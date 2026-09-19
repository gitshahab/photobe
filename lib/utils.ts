export { cn } from "cn";

export const resizeImage = (file: File, maxDimension = 768): Promise<File> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new window.Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        // Only resize if the image is too big
        const scale = maxDimension / Math.max(img.width, img.height);
        if (scale >= 1) return resolve(file);

        const canvas = document.createElement("canvas");
        canvas.width = img.width * scale;
        canvas.height = img.height * scale;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);

        canvas.toBlob((blob) => {
          if (blob) {
            resolve(new File([blob], file.name, { type: "image/png" }));
          } else {
            resolve(file); // Fallback to original
          }
        }, "image/png");
      };
    };
  });
};
