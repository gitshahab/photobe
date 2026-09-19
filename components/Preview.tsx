"use client";

import { Download, Image as ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useStore } from "@/store/useStore";
import Image from "next/image";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";

export function Preview() {
  const { status, outputUrl, errorMessage } = useStore();
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    if (status === "loading") {
      setImageLoaded(false);
    }
  }, [status]);

  const isActuallyLoading =
    status === "loading" || (status === "success" && !imageLoaded);

  const handleDownload = async () => {
    if (!outputUrl) return;
    try {
      const response = await fetch(outputUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.style.display = "none";
      link.href = url;
      link.download = "ProductStudio-Asset.png";
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error("Failed to download image", error);
    }
  };

  return (
    <Card className="relative w-full min-h-[400px] lg:min-h-full flex flex-col items-center justify-center bg-gray-50 border rounded-2xl overflow-hidden">
      {isActuallyLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-gray-50/80 backdrop-blur-sm">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-sm font-medium text-gray-600 animate-pulse">
            {status === "success"
              ? "Painting image..."
              : "AI is rendering your scene..."}
          </p>
        </div>
      )}

      {status === "error" && (
        <div className="text-red-400 text-center">
          <p className="font-semibold">Generation Failed</p>
          <p className="text-sm">{errorMessage}</p>
        </div>
      )}

      {status === "success" && outputUrl && (
        <>
          <Image
            src={outputUrl}
            alt="Generated Background"
            fill
            className="object-contain"
            unoptimized
            onLoad={() => setImageLoaded(true)}
          />
          {imageLoaded && (
            <div className="absolute bottom-4 right-4 z-10">
              <Button
                onClick={handleDownload}
                size="lg"
                className="rounded-full shadow-xl bg-black hover:bg-gray-800 text-white gap-2"
              >
                <Download className="w-4 h-4" />
                Download
              </Button>
            </div>
          )}
        </>
      )}

      {status === "idle" && !outputUrl && (
        <p>Generated asset will appear here</p>
      )}
    </Card>
  );
}
