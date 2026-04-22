const {
  findCaseId,
  publishResults,
  readJsonReport,
  requireEnv,
} = require("./qase-results-lib");

function mapCypressState(state, pending) {
  if (pending || state === "pending") {
    return "skipped";
  }

  switch (state) {
    case "passed":
      return "passed";
    case "failed":
      return "failed";
    default:
      return "invalid";
  }
}

function extractResults(report) {
  const tests = Array.isArray(report.tests) ? report.tests : [];

  return tests.map((test) => ({
    title: test.title || test.fullTitle || "",
    status: mapCypressState(test.state, test.pending),
    comment: test.err?.message || "",
    time_ms: test.duration || 0,
  }));
}

async function main() {
  const projectCode = requireEnv("QASE_PROJECT_CODE");
  const runId = requireEnv("QASE_RUN_ID");
  const reportPath =
    process.env.CYPRESS_RESULTS_PATH || ".qa-artifacts/cypress-results.json";
  const titlePrefix = process.env.QASE_CASE_TITLE_PREFIX || "[cypress] ";
  const report = readJsonReport(reportPath);
  const extractedResults = extractResults(report);
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
