import { Card } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-[calc(100vh-12rem)]">
      <Card className="p-6 flex flex-col gap-6 bg-white shadow-sm">
        <h2 className="text-xl font-semibold">1. Upload Product</h2>
        <div className="border-2 border-dashed border-gray-200 rounder-lg flex-1 flex items-center justify-center bg-gray-50 text-gray-400">
          Dropzone Component Goes Here
        </div>
        <h2 className="text-xl font-semibold mt-4">2. Scene Description</h2>
        <div className="h-24 bg-gray-50 border rounded-lg p-3 text-gray-400">
          Text Input Component Goes Here
        </div>
      </Card>
      <Card className="p-6 flex flex-col items-center justify-center bg-zinc-900 text-zinc-500 shadow-sm relative overflow-hidden">
        <p>Generated asset will appear here</p>
      </Card>
    </div>
  );
}
