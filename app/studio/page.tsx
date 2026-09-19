import { Controls } from "@/components/Controls";
import { Preview } from "@/components/Preview";

export default function Studio() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-[calc(100vh-12rem)] lg:h-[calc(100vh-12rem)]">
      <Controls />
      <Preview />
    </div>
  );
}
