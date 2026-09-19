import Link from "next/link";
import { Terminal } from "lucide-react";

export default function Header() {
  return (
    <header className="border-b bg-white">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-lg"
        >
          <Terminal className="w-5 h-5" />
          <span>Photobe</span>
        </Link>
        <Link href="/studio" className="text-sm text-gray-500">
          Studio
        </Link>
      </div>
    </header>
  );
}
