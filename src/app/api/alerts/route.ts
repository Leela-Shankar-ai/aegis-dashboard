// POST /api/alerts — receives real-time alert notifications from MCP server
export async function POST(request: Request) {
  const body = await request.json();
  console.log(`[AEGIS ALERT] ${body.channel}: ${body.message}`);
  return Response.json({ received: true });
}
