"use client";

import { Loader2, UploadCloud } from "lucide-react";
import Image from "next/image";
import { useRef } from "react";
import { useStore } from "@/store/useStore";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Input } from "./ui/input";
import { resizeImage } from "@/lib/utils";

export function Controls() {
  const imageFile = useStore((state) => state.imageFile);
  const previewUrl = useStore((state) => state.previewUrl);
  const prompt = useStore((state) => state.prompt);
  const status = useStore((state) => state.status);

  const setImage = useStore((state) => state.setImage);
  const setPrompt = useStore((state) => state.setPrompt);
  const setStatus = useStore((state) => state.setStatus);
  const setError = useStore((state) => state.setError);
  const setOutput = useStore((state) => state.setOutput);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file, URL.createObjectURL(file));
    }
  };

  const handleGenerate = async () => {
    if (!imageFile || !prompt) return;
    setStatus("generating");

    const optimisedImage = await resizeImage(imageFile);

    const formData = new FormData();
    formData.append("image", optimisedImage);
    formData.append("prompt", prompt);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setStatus("generating");

      //polling loop
      const pollInterval = setInterval(async () => {
        try {
          const statusRes = await fetch(
            `/api/status?prompt_id=${data.prompt_id}`,
          );
          const statusData = await statusRes.json();

          if (statusData.status === "success") {
            clearInterval(pollInterval);
            setOutput(`/api/image?filename=${statusData.filename}`);
          } else if (statusData.status === "error") {
            clearInterval(pollInterval);
            setError("ComfyUI failed to generate the image.");
          }
          //if status is generating loop continues
        } catch (err) {
          clearInterval(pollInterval);
          setError("Network error while checking status.");
        }
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  return (
    <Card className="p-6 flex flex-col gap-6 bg-white shadow-sm overflow-y-auto">
      {/* Dropzone UI */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          1. Upload Product Image
        </h2>
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleImageChange}
          accept="image/*"
          className="hidden"
        />
        {previewUrl ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden border border-gray-200 group">
            <Image
              src={previewUrl}
              alt="Preview"
              fill
              className="object-contain bg-gray-50"
            />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
              >
                Change Image
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-48 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors text-gray-500"
          >
            <UploadCloud className="w-8 h-8 mb-2 text-gray-400" />
            <span className="font-medium">Click to upload product</span>
          </button>
        )}
      </div>

      {/* Prompt UI */}
      <div>
        <h2 className="text-sm font-semibold text-gray-700 mb-3">
          2. Scene Description
        </h2>
        <Input
          placeholder="e.g., resting on a mossy rock in a sunlit forest..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={status === "uploading" || status === "generating"}
        />
      </div>

      <Button
        className="w-full mt-auto h-12"
        onClick={handleGenerate}
        disabled={
          !imageFile ||
          !prompt ||
          status === "uploading" ||
          status === "generating"
        }
      >
        {status === "uploading" || status === "generating" ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...
          </>
        ) : (
          "Generate Composited Image"
        )}
      </Button>
    </Card>
  );
}
