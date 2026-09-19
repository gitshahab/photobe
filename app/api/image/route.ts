import { NextResponse } from "next/server";

const COMFY_URL = process.env.COMFYUI_URL || "http://127.0.0.1:8188";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const filename = searchParams.get("filename");

    if (!filename) {
      return new NextResponse("Missing filename", { status: 400 });
    }

    // fetch the raw image bytes from Comfy
    const imageRes = await fetch(
      `${COMFY_URL}/view?filename=${filename}&type=output`,
    );

    if (!imageRes.ok) {
      return new NextResponse("Image not found", { status: 404 });
    }

    const imageBuffer = await imageRes.arrayBuffer();

    // return the image securely to the client
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": "image/png",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (error) {
    console.error("Image Proxy Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
