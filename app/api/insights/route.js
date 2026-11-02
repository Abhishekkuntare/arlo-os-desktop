export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const analyticsApiBase =
  "https://manage.devcenter.microsoft.com/v1.0/my/analytics";

class PartnerCenterError extends Error {}

function dateForApi(date) {
  return `${date.getUTCMonth() + 1}/${date.getUTCDate()}/${date.getUTCFullYear()}`;
}

async function readJson(response, source) {
  if (!response.ok) {
    throw new PartnerCenterError(
      `${source} returned HTTP ${response.status}. Check the Partner Center app permissions and credentials.`
    );
  }

  try {
    return await response.json();
  } catch {
    throw new PartnerCenterError(`${source} returned an invalid response.`);
  }
}

async function getAccessToken(tenantId, clientId, clientSecret) {
  const body = new URLSearchParams({
    grant_type: "client_credentials",
    client_id: clientId,
    client_secret: clientSecret,
    resource: "https://manage.devcenter.microsoft.com"
  });
  const response = await fetch(
    `https://login.microsoftonline.com/${encodeURIComponent(tenantId)}/oauth2/token`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(10000)
    }
  );
  const tokenData = await readJson(response, "Microsoft Entra sign-in");

  if (typeof tokenData.access_token !== "string" || !tokenData.access_token) {
    throw new PartnerCenterError(
      "Microsoft Entra did not return an access token. Check the Partner Center app permissions."
    );
  }

  return tokenData.access_token;
}

async function getAnalyticsData(endpoint, params, accessToken) {
  const url = new URL(`${analyticsApiBase}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store",
    signal: AbortSignal.timeout(15000)
  });
  const data = await readJson(response, "Microsoft Store analytics");

  if (!Array.isArray(data.Value)) {
    throw new PartnerCenterError(
      "Microsoft Store analytics returned an unexpected data format."
    );
  }

  return data.Value;
}

function readOtherDownloadCount() {
  const configuredCount = process.env.ARLO_OTHER_DOWNLOADS;
  const count = configuredCount === undefined
    ? 1
    : Number(configuredCount);

  if (!Number.isSafeInteger(count) || count < 0) {
    throw new PartnerCenterError(
      "ARLO_OTHER_DOWNLOADS must be a whole number greater than or equal to zero."
    );
  }

  return count;
}

function parseCount(value, field) {
  const count = Number(value);
  if (!Number.isFinite(count) || count < 0) {
    throw new PartnerCenterError(
      `Microsoft Store analytics returned an invalid ${field} value.`
    );
  }
  return count;
}

export async function GET(request) {
  const tenantId = process.env.MS_PARTNER_TENANT_ID;
  const clientId = process.env.MS_PARTNER_CLIENT_ID;
  const clientSecret = process.env.MS_PARTNER_CLIENT_SECRET;
  const appId = process.env.MS_STORE_APP_ID || "9NN6LSN1KSZF";

  if (!tenantId || !clientId || !clientSecret) {
    return Response.json(
      {
        error:
          "Live Partner Center analytics are not connected. Add the required server environment variables to enable automatic updates."
      },
      {
        status: 503,
        headers: { "Cache-Control": "private, no-store" }
      }
    );
  }

  const isManualRefresh = new URL(request.url).searchParams.has("refresh");

  try {
    const otherDownloads = readOtherDownloadCount();
    const endDate = new Date();
    const startDate = new Date(endDate);
    startDate.setUTCDate(startDate.getUTCDate() - 29);
    const range = {
      applicationId: appId,
      startDate: dateForApi(startDate),
      endDate: dateForApi(endDate)
    };
    const accessToken = await getAccessToken(tenantId, clientId, clientSecret);
    const [installRows, funnelRows] = await Promise.all([
      getAnalyticsData(
        "installs",
        {
          ...range,
          top: "10000",
          skip: "0",
          aggregationLevel: "day",
          groupby: "date,market"
        },
        accessToken
      ),
      getAnalyticsData("funnel", range, accessToken)
    ]);

    const marketCounts = new Map();
    for (const row of installRows) {
      const market =
        typeof row.market === "string" && row.market.trim()
          ? row.market.trim().toUpperCase()
          : "ZZ";
      const installCount = parseCount(
        row.successfulInstallCount,
        "successful install count"
      );
      marketCounts.set(market, (marketCounts.get(market) || 0) + installCount);
    }

    const markets = [...marketCounts.entries()]
      .map(([market, installs]) => ({ market, installs }))
      .sort((left, right) => right.installs - left.installs);
    const storeInstalls = markets.reduce(
      (total, market) => total + market.installs,
      0
    );
    const funnelCounts = new Map();
    for (const row of funnelRows) {
      if (typeof row.MetricType !== "string") continue;
      const metric = row.MetricType.toLowerCase();
      const count = parseCount(row.UserCount, "funnel count");
      funnelCounts.set(metric, (funnelCounts.get(metric) || 0) + count);
    }
    const pageViews = funnelCounts.get("pageview") || 0;

    return Response.json(
      {
        storeInstalls,
        otherDownloads,
        totalDownloads: storeInstalls + otherDownloads,
        pageViews,
        conversionRate:
          pageViews > 0 ? (storeInstalls / pageViews) * 100 : 0,
        markets,
        startDate: range.startDate,
        endDate: range.endDate,
        updatedAt: new Date().toISOString()
      },
      {
        headers: {
          "Cache-Control": isManualRefresh
            ? "private, no-store"
            : "public, s-maxage=900, stale-while-revalidate=1800"
        }
      }
    );
  } catch (error) {
    if (!(error instanceof PartnerCenterError)) throw error;

    console.error("Partner Center analytics refresh failed:", error.message);
    return Response.json(
      { error: error.message },
      {
        status: 502,
        headers: { "Cache-Control": "private, no-store" }
      }
    );
  }
}
