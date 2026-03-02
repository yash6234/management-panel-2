import { Search } from "lucide-react";

export default function DashboardHeader() {
  return (
    <header className="h-16 px-6 flex items-center border-b border-[#E5E7EB] bg-card shadow-sm">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search..."
          className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#E5E7EB] bg-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-shadow"
        />
      </div>
    </header>
  );
}
