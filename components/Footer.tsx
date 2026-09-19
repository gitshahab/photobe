export default function Footer() {
  return (
    <footer className="border-t bg-gray-50 mt-auto">
      <div className="container mx-auto px-4 h-14 flex items-center justify-center text-sm text-gray-500">
        <p>©{new Date().getFullYear()} Photobe. All rights reserved.</p>
      </div>
    </footer>
  );
}
