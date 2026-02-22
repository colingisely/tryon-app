import fs from "fs";
import path from "path";

export async function GET(
  req: Request,
  context: { params: Promise<{ filename: string }> }
) {
  const params = await context.params;
  const filePath = path.join("/tmp", params.filename);

  if (!fs.existsSync(filePath)) {
    return new Response("Not found", { status: 404 });
  }

  const file = fs.readFileSync(filePath);

  return new Response(file, {
    headers: {
      "Content-Type": "image/png",
    },
  });
}
