import { NextResponse } from "next/server";

const COMFY_URL = process.env.COMFYUI_URL || "http://127.0.0.1:8188";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const prompt_id = searchParams.get("prompt_id");

    if (!prompt_id) {
      return NextResponse.json({ error: "Missing prompt_id" }, { status: 400 });
    }

    // check Comfy history
    const res = await fetch(`${COMFY_URL}/history/${prompt_id}`);
    const historyData = await res.json();

    // if the prompt_id exists in history, it's done
    if (historyData[prompt_id]) {
      const outputs = historyData[prompt_id].outputs;
      let filename = "";

      // dynamically find the first output node that contains images
      for (const nodeId in outputs) {
        if (outputs[nodeId].images && outputs[nodeId].images.length > 0) {
          filename = outputs[nodeId].images[0].filename;
          break;
        }
      }

      if (filename) {
        return NextResponse.json({ status: "success", filename });
      } else {
        return NextResponse.json({
          status: "error",
          error: "No image found in output",
        });
      }
    }

    // if it's not in history yet, it's still in the queue or generating
    return NextResponse.json({ status: "generating" });
  } catch (error) {
    console.error("Status API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
