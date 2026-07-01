export async function GET() {
  return Response.json({
    ok: true,
    service: "tergion-technologies",
    timestamp: new Date().toISOString(),
  });
}
