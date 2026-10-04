import { NextResponse } from "next/server";

const COMFY_URL = process.env.COMFYUI_URL || "http://127.0.0.1:8188";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const image = formData.get("image") as File;
    const promptText = formData.get("prompt") as string;

    const cleanPrompt = promptText.trim();

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

        // Node 12a: Creates the rembg session that ImageRemoveBackground+ needs, using u2net default model
        "12a": {
          class_type: "RemBGSession+",
          inputs: {
            model: "u2net: general purpose",
            providers: "CPU",
          },
        },

        //Node 12: Auto-generate mask via background removal, comfyui-rembg
        "12": {
          class_type: "ImageRemoveBackground+",
          inputs: { rembg_session: ["12a", 0], image: ["11", 0] },
        },

        //Node 12b: Convert the removed-bg image's alpha channel into a mask.
        "12b": {
          class_type: "InvertMask",
          inputs: { mask: ["12", 1] },
        },

        //Node 13: Load the ControlNet depth model
        "13": {
          class_type: "ControlNetLoader",
          inputs: { control_net_name: "control_v11f1p_sd15_depth.pth" },
        },

        //Node 14: Generate a depth map from the resized image, comfyui_controlnet_aux
        "14": {
          class_type: "MiDaS-DepthMapPreprocessor",
          inputs: {
            image: ["11", 0],
            a: 6.28,
            bg_threshold: 0.1,
            resolution: 512,
          },
        },

        // Node 6: Positive Prompt
        "6": {
          class_type: "CLIPTextEncode",
          inputs: {
            text: `commercial product photography, photorealistic studio lighting, sharp focus, complete scene, fully rendered background, ${cleanPrompt}`,
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

        //Node 15: Apply ControlNet depth conditioning to the positive prompt
        "15": {
          class_type: "ControlNetApply",
          inputs: {
            conditioning: ["6", 0],
            control_net: ["13", 0],
            image: ["14", 0],
            strength: 0.6,
          },
        },

        // Node 16: Encode image + mask for proper inpainting ( replace plain VAEEncode)
        "16": {
          class_type: "VAEEncodeForInpaint",
          inputs: {
            pixels: ["11", 0],
            vae: ["4", 2],
            mask: ["12b", 0],
            grow_mask_by: 6,
          },
        },

        // Node 3: KSampler — ControlNet conditioned positive + inpaint-aware latent
        "3": {
          class_type: "KSampler",
          inputs: {
            seed: Math.floor(Math.random() * 1000000000),
            steps: 35,
            cfg: 6.5,
            sampler_name: "euler",
            scheduler: "karras",
            denoise: 1.0,
            model: ["4", 0],
            positive: ["15", 0],
            negative: ["7", 0],
            latent_image: ["16", 0],
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
