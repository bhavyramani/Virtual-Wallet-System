import Navbar from "@/components/Navbar";

export default function RootLayout({ children }) {
  return (
    <div className="flex h-screen">
      {/* Sidebar (Navbar) */}
      <div className="bg-gray-800 w-64 h-full sticky top-0">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">{children}</div>
    </div>
  );
}
