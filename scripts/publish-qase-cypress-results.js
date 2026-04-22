const {
  findCaseId,
  publishResults,
  readJsonReports,
  requireEnv,
} = require("./qase-results-lib");

function mapCypressState(test) {
  if (test.pending) {
    return "skipped";
  }

  if (test.pass === true) {
    return "passed";
  }

  if (test.fail === true) {
    return "failed";
  }

  if (test.state === "passed" || test.state === "failed" || test.state === "pending") {
    return mapCypressState({
      pass: test.state === "passed",
      fail: test.state === "failed",
      pending: test.state === "pending",
    });
  }

  return "invalid";
}

function normalizeTitle(test) {
  if (Array.isArray(test.title)) {
    return test.title[test.title.length - 1] || "";
  }

  return test.title || test.fullTitle || "";
}

function extractResults(report) {
  const tests = Array.isArray(report.tests) ? report.tests : [];

  return tests
    .map((test) => ({
      title: normalizeTitle(test),
      status: mapCypressState(test),
      comment: test.err?.message || "",
      time_ms: test.duration || 0,
    }))
    .filter((test) => Boolean(test.title));
}

async function main() {
  const projectCode = requireEnv("QASE_PROJECT_CODE");
  const runId = requireEnv("QASE_RUN_ID");
  const reportPath =
    process.env.CYPRESS_RESULTS_PATH || ".qa-artifacts/cypress-results.json";
  const titlePrefix = process.env.QASE_CASE_TITLE_PREFIX || "[cypress] ";
  const reports = readJsonReports(reportPath);
  const extractedResults = reports.flatMap((report) => extractResults(report));
  const caseIdCache = new Map();
  const qaseResults = [];

  for (const result of extractedResults) {
    if (!result.title) {
      continue;
    }

    const caseTitle = `${titlePrefix}${result.title}`;

    if (!caseIdCache.has(caseTitle)) {
      caseIdCache.set(caseTitle, await findCaseId(projectCode, caseTitle));
    }

    const caseId = caseIdCache.get(caseTitle);
    if (!caseId) {
      console.warn(`No matching Qase case found for title: ${caseTitle}`);
      continue;
    }

    qaseResults.push({
      case_id: caseId,
      status: result.status,
      time_ms: result.time_ms,
      comment: result.comment || `Imported result for "${result.title}"`,
    });
  }

  await publishResults(projectCode, runId, qaseResults);

  console.log(`Published ${qaseResults.length} Cypress Qase results to run ${runId}.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
