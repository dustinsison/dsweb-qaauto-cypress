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

    if (firstBrace === -1) {
      throw new Error(`Could not parse JSON results from: ${reportPath}`);
    }

    let depth = 0;
    let inString = false;
    let escaping = false;

    for (let index = firstBrace; index < raw.length; index += 1) {
      const character = raw[index];

      if (inString) {
        if (escaping) {
          escaping = false;
          continue;
        }

        if (character === "\\") {
          escaping = true;
          continue;
        }

        if (character === "\"") {
          inString = false;
        }

        continue;
      }

      if (character === "\"") {
        inString = true;
        continue;
      }

      if (character === "{") {
        depth += 1;
        continue;
      }

      if (character === "}") {
        depth -= 1;

        if (depth === 0) {
          return JSON.parse(raw.slice(firstBrace, index + 1));
        }
      }
    }

    throw new Error(`Could not isolate JSON results from: ${reportPath}`);
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
