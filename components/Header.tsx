import { Terminal } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <Terminal className="w-5 h-5" />
          <span>Photobe</span>
        </div>
        <nav className="text-sm text-gray-500">About</nav>
      </div>
    </header>
  );
}
