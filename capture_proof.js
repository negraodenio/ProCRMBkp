const orgId = "11111111-1111-1111-1111-111111111111";
const fs = require('fs');

async function capture(query, filename) {
  try {
    const res = await fetch('http://localhost:3000/api/eval/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-eval-token': 'test-token-123' },
      body: JSON.stringify({ query, org_id: orgId, debug: true })
    });
    const data = await res.json();
    fs.writeFileSync(filename, JSON.stringify(data, null, 2));
    console.log(`Captured ${query} -> ${filename}`);
  } catch (e) {
    console.error(`Failed ${query}:`, e.message);
  }
}

async function run() {
  await capture("onde os dados realmente passam?", "proof_dados.json");
  await capture("como o crm funciona?", "proof_crm.json");
}

run();
