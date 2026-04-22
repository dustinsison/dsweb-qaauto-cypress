const fs = require("node:fs");

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

async function qaseRequest(url, init = {}) {
  const token = requireEnv("QASE_API_TOKEN");
  const response = await fetch(url, {
    ...init,
    headers: {
      Token: token,
      ...(init.headers || {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Qase request failed: ${response.status} ${body}`);
  }

  return response.json();
}

function readJsonReport(reportPath) {
  const raw = fs.readFileSync(reportPath, "utf8").trim();

  if (!raw) {
    throw new Error(`Results file is empty: ${reportPath}`);
  }

  try {
    return JSON.parse(raw);
  } catch {
    const firstBrace = raw.indexOf("{");
    const lastBrace = raw.lastIndexOf("}");

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      throw new Error(`Could not parse JSON results from: ${reportPath}`);
    }

    return JSON.parse(raw.slice(firstBrace, lastBrace + 1));
  }
}

async function findCaseId(projectCode, title) {
  const searchParams = new URLSearchParams({
    search: title,
    limit: "100",
  });

  const suiteId = process.env.QASE_SUITE_ID;
  if (suiteId) {
    searchParams.set("suite_id", suiteId);
  }

  const response = await qaseRequest(
    `https://api.qase.io/v1/case/${projectCode}?${searchParams.toString()}`,
  );

  const entities = Array.isArray(response.result)
    ? response.result
    : response.result?.entities || [];

  const match = entities.find(
    (entity) => entity.title && entity.title.trim() === title.trim(),
  );

  return match?.id || null;
}

async function publishResults(projectCode, runId, results) {
  if (results.length > 0) {
    await qaseRequest(
      `https://api.qase.io/v1/result/${projectCode}/${runId}/bulk`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          results,
        }),
      },
    );
  }

  await qaseRequest(`https://api.qase.io/v1/run/${projectCode}/${runId}/complete`, {
    method: "POST",
  });
}

module.exports = {
  findCaseId,
  publishResults,
  readJsonReport,
  requireEnv,
};
