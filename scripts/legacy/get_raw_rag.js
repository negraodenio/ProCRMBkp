const baseUrl = "http://localhost:3000";
const orgId = "11111111-1111-1111-1111-111111111111";

async function testQuery(query) {
  try {
    const res = await fetch(`${baseUrl}/api/eval/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-eval-token": "test-token-123"
      },
      body: JSON.stringify({ query, org_id: orgId, debug: true })
    });

    if (!res.ok) {
      const errorText = await res.text();
      console.error(`HTTP Error for query "${query}": ${res.status} - ${errorText}`);
      return;
    }

    const data = await res.json();
    console.log("\n========================================");
    console.log("QUERY: " + query);
    console.log("REASON: " + data.reason);
    console.log("\n--- CONTEXT PREVIEW ---");
    console.log((data.context_preview || "").slice(0, 500) + "...");
    console.log("\n--- RAW RAG RESPONSE (JSON) ---");
    console.log(data.raw || "NO RAW JSON (Model refused answer or crashed)");
    console.log("\n--- FINAL ANSWER (FORMATTED) ---");
    console.log(data.answer);
    console.log("========================================\n");
  } catch (err) {
    console.error("Query failed:", query, err.message);
  }
}

async function run() {
  await testQuery("onde os dados realmente passam?"); // Success case
  await testQuery("como o crm funciona?"); // Refusal case
}

run();
