export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function unavailable() {
  return Response.json(
    { error: "Website analytics storage is not configured." },
    { status: 503, headers: { "Cache-Control": "no-store" } }
  );
}

function supabaseEndpoint(pathname) {
  if (!supabaseUrl || !supabaseServiceRoleKey) return null;

  const projectUrl = new URL(supabaseUrl);
  if (projectUrl.protocol !== "https:" && projectUrl.hostname !== "localhost") {
    throw new Error("SUPABASE_URL must use HTTPS.");
  }

  return new URL(pathname, projectUrl);
}

function supabaseHeaders() {
  return {
    apikey: supabaseServiceRoleKey,
    Authorization: `Bearer ${supabaseServiceRoleKey}`,
    "Content-Type": "application/json"
  };
}

function noStoreJson(body, status = 200) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store" }
  });
}

export async function GET() {
  if (!supabaseUrl || !supabaseServiceRoleKey) return unavailable();

  try {
    const response = await fetch(
      supabaseEndpoint("/rest/v1/rpc/get_website_analytics_totals"),
      {
        method: "POST",
        headers: supabaseHeaders(),
        body: "{}",
        cache: "no-store",
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!response.ok) {
      throw new Error(`Supabase returned HTTP ${response.status}.`);
    }

    const totals = await response.json();
    const counts = {
      pageViews: totals?.pageViews,
      arloOsDownloadClicks: totals?.arloOsDownloadClicks,
      arloDeckDownloadClicks: totals?.arloDeckDownloadClicks
    };

    if (
      !Object.values(counts).every(
        (value) => Number.isSafeInteger(value) && value >= 0
      )
    ) {
      throw new Error("Supabase returned invalid website analytics totals.");
    }

    return noStoreJson(counts);
  } catch (error) {
    console.error("Could not read website analytics:", error.message);
    return noStoreJson(
      { error: "Website analytics are temporarily unavailable." },
      503
    );
  }
}

export async function POST(request) {
  const origin = request.headers.get("origin");
  if (origin) {
    let requestOrigin;
    let submittedOrigin;
    try {
      requestOrigin = new URL(request.url).origin;
      submittedOrigin = new URL(origin).origin;
    } catch {
      return noStoreJson({ error: "Invalid request origin." }, 400);
    }
    if (submittedOrigin !== requestOrigin) {
      return noStoreJson({ error: "Cross-origin analytics are not accepted." }, 403);
    }
  }

  if (!supabaseUrl || !supabaseServiceRoleKey) return unavailable();

  let event;
  try {
    event = await request.json();
  } catch {
    return noStoreJson({ error: "Please submit a valid analytics event." }, 400);
  }

  if (!event || typeof event !== "object" || Array.isArray(event)) {
    return noStoreJson({ error: "Please submit a valid analytics event." }, 400);
  }

  const isPageView = event.eventName === "page_view" && event.productName == null;
  const isArloOsDownload =
    event.eventName === "download_click" && event.productName === "arlo_os";
  const isArloDeckDownload =
    event.eventName === "download_click" && event.productName === "arlo_deck";

  if (!isPageView && !isArloOsDownload && !isArloDeckDownload) {
    return noStoreJson({ error: "Unsupported analytics event." }, 400);
  }

  try {
    const response = await fetch(
      supabaseEndpoint("/rest/v1/rpc/increment_website_analytics"),
      {
        method: "POST",
        headers: supabaseHeaders(),
        body: JSON.stringify({
          p_event_name: event.eventName,
          p_product_name: event.productName ?? "none"
        }),
        cache: "no-store",
        signal: AbortSignal.timeout(10000)
      }
    );

    if (!response.ok) {
      throw new Error(`Supabase returned HTTP ${response.status}.`);
    }

    return noStoreJson({ ok: true }, 201);
  } catch (error) {
    console.error("Could not record website analytics:", error.message);
    return noStoreJson(
      { error: "Could not record this activity right now." },
      503
    );
  }
}
