import { NextResponse } from "next/server";

const COMFY_URL = process.env.COMFYUI_URL || "http://127.0.0.1:8188";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;
    const promptText = formData.get("image") as File;

    if (!image || !promptText) {
      return NextResponse.json(
        { error: "Image and prompt are required" },
        { status: 400 },
      );
    }

    //Upload the raw product image to ComfyUI's input directory
    const uploadFormData = new FormData();
    uploadFormData.append("image", image);
    uploadFormData.append("overwrite", "true");

    const uploadRes = await fetch(`${COMFY_URL}/upload/image`, {
      method: "POST",
      body: uploadFormData,
    });

    if (!uploadRes.ok) {
      const errText = await uploadRes.text();
      console.error("ComfyUI upload failed:", errText);
      throw new Error("Failed to upload image to ComfyUI backend");
    }

    const uploadData = await uploadRes.json();
    const uploadedFilename = uploadData.name;

    // 2. Build the execution graph (API format)
    const promptPayload = {
      prompt: {
        // Node 4: Load the SD 1.5 Checkpoint
        "4": {
          class_type: "CheckpointLoaderSimple",
          inputs: {
            ckpt_name: "v1-5-pruned-emaonly.safetensors",
          },
        },
        // Node 5: Load the uploaded user image
        "5": {
          class_type: "LoadImage",
          inputs: {
            image: uploadedFilename,
            upload: "image",
          },
        },
        // Node 11: Resize to an SD1.5-native resolution before encoding.
        // 512x768 portrait works well for product-on-surface compositions.
        // Swap to 768x512 if your product shots are landscape.
        "11": {
          class_type: "ImageScale",
          inputs: {
            image: ["5", 0],
            upscale_method: "lanczos",
            width: 512,
            height: 768,
            crop: "center",
          },
        },
        // Node 6: Positive Prompt
        "6": {
          class_type: "CLIPTextEncode",
          inputs: {
            text: `commercial product photography, photorealistic studio lighting, sharp focus, complete scene, fully rendered background, ${promptText}`,
            clip: ["4", 1],
          },
        },
        // Node 7: Negative Prompt (now explicitly targets unfinished/cropped output)
        "7": {
          class_type: "CLIPTextEncode",
          inputs: {
            text: "blurry, low quality, distorted, deformed, text, watermark, bad lighting, cropped, cut off, out of frame, unfinished, incomplete, partial render",
            clip: ["4", 1],
          },
        },
        // Node 10: Encode the RESIZED image to Latent space
        "10": {
          class_type: "VAEEncode",
          inputs: {
            pixels: ["11", 0],
            vae: ["4", 2],
          },
        },
        // Node 3: KSampler — more steps, karras scheduler, slightly lower CFG
        "3": {
          class_type: "KSampler",
          inputs: {
            seed: Math.floor(Math.random() * 1000000000),
            steps: 35,
            cfg: 6.5,
            sampler_name: "euler",
            scheduler: "karras",
            denoise: 0.75,
            model: ["4", 0],
            positive: ["6", 0],
            negative: ["7", 0],
            latent_image: ["10", 0],
          },
        },
        // Node 8: Decode generated latent back to RGB pixels
        "8": {
          class_type: "VAEDecode",
          inputs: {
            samples: ["3", 0],
            vae: ["4", 2],
          },
        },
        // Node 9: Save the final image
        "9": {
          class_type: "SaveImage",
          inputs: {
            filename_prefix: "ProductStudio",
            images: ["8", 0],
          },
        },
      },
    };

    // 3. Dispatch the execution prompt to ComfyUI
    const promptRes = await fetch(`${COMFY_URL}/prompt`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(promptPayload),
    });

    if (!promptRes.ok) {
      const errText = await promptRes.text();
      console.error("ComfyUI /prompt call failed:", errText);
      throw new Error("ComfyUI failed to queue the generation job");
    }

    const promptData = await promptRes.json();

    return NextResponse.json({ prompt_id: promptData.prompt_id });
  } catch (error) {
    console.error("API Route Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
