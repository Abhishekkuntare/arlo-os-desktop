import { randomUUID } from "node:crypto";
import { appendFile, mkdir } from "node:fs/promises";
import path from "node:path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const allowedTypes = new Set(["feature", "bug", "contact"]);
const feedbackDirectory = path.join(process.cwd(), "feedback-data");
const submissionsPath = path.join(feedbackDirectory, "submissions.jsonl");

function storageNotConfigured(missingVariables) {
  return Response.json(
    {
      error:
        `Feedback is not configured yet. Add ${missingVariables.join(
          " and "
        )} in Vercel → Project Settings → Environment Variables for Production, then redeploy. This message was not saved.`
    },
    { status: 503, headers: { "Cache-Control": "no-store" } }
  );
}

async function saveToSupabase(record, projectUrl, serviceRoleKey) {
  const endpoint = new URL("/rest/v1/feedback_submissions", projectUrl);
  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal"
    },
    body: JSON.stringify({
      id: record.id,
      submitted_at: record.submittedAt,
      name: record.name,
      email: record.email,
      type: record.type,
      message: record.message
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    throw new Error(`Supabase returned HTTP ${response.status}.`);
  }
}

async function saveLocally(record) {
  await mkdir(feedbackDirectory, { recursive: true });
  await appendFile(submissionsPath, `${JSON.stringify(record)}\n`, {
    encoding: "utf8",
    mode: 0o600
  });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 254;
}

export async function POST(request) {
  let submission;

  try {
    submission = await request.json();
  } catch {
    return Response.json({ error: "Please submit a valid form." }, { status: 400 });
  }

  if (!submission || typeof submission !== "object" || Array.isArray(submission)) {
    return Response.json({ error: "Please submit a valid form." }, { status: 400 });
  }

  if (
    typeof submission.companyWebsite === "string" &&
    submission.companyWebsite.trim()
  ) {
    return Response.json({ error: "The submission could not be accepted." }, { status: 400 });
  }

  const name = typeof submission.name === "string" ? submission.name.trim() : "";
  const email = typeof submission.email === "string" ? submission.email.trim() : "";
  const type = typeof submission.type === "string" ? submission.type : "";
  const message =
    typeof submission.message === "string" ? submission.message.trim() : "";

  if (!name || name.length > 100) {
    return Response.json(
      { error: "Enter a name of 1 to 100 characters." },
      { status: 400 }
    );
  }

  if (!isValidEmail(email)) {
    return Response.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  if (!allowedTypes.has(type)) {
    return Response.json({ error: "Choose a valid message type." }, { status: 400 });
  }

  if (!message || message.length > 5000) {
    return Response.json(
      { error: "Enter a message of 1 to 5,000 characters." },
      { status: 400 }
    );
  }

  const record = {
    id: randomUUID(),
    submittedAt: new Date().toISOString(),
    name,
    email,
    type,
    message
  };

  const projectUrl = process.env.SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const missingVariables = [
    !projectUrl && "SUPABASE_URL",
    !serviceRoleKey && "SUPABASE_SERVICE_ROLE_KEY"
  ].filter(Boolean);

  if (missingVariables.length > 0) {
    return storageNotConfigured(missingVariables);
  }

  try {
    if (projectUrl && serviceRoleKey) {
      await saveToSupabase(record, projectUrl, serviceRoleKey);
    } else if (process.env.NODE_ENV === "production") {
      return storageNotConfigured([
        "SUPABASE_URL",
        "SUPABASE_SERVICE_ROLE_KEY"
      ]);
    } else {
      await saveLocally(record);
    }
  } catch (error) {
    console.error("Could not save feedback submission:", error.message);
    return Response.json(
      {
        error: "Could not save your message. Please try again later."
      },
      { status: 503, headers: { "Cache-Control": "no-store" } }
    );
  }

  return Response.json(
    { ok: true },
    { status: 201, headers: { "Cache-Control": "no-store" } }
  );
}
