const baseUrl = "http://localhost:3000";
const orgId = "11111111-1111-1111-1111-111111111111";

async function check() {
  const res = await fetch(`${baseUrl}/api/eval/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-eval-token": "test-token-123"
    },
    body: JSON.stringify({
      query: "o que tem no arsenal de ferramentas?",
      org_id: orgId
    })
  });
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

check();
