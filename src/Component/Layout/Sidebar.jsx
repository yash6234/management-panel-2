import { NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  ShoppingCart,
  Database,
  LogOut,
} from "lucide-react";

const navItems = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard, end: true },
  { path: "/dashboard/masters", label: "Masters", icon: Users },
  { path: "/dashboard/sales", label: "Sales", icon: ShoppingCart },
  { path: "/dashboard/data", label: "Data", icon: Database },
];

export default function Sidebar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <aside className="w-64 h-screen bg-primary flex flex-col text-white">
      <div className="p-6">
        <h1 className="text-xl font-semibold text-white/95">Shreeji Management</h1>
      </div>
      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ path, label, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                ? "bg-white/20 text-white"
                : "text-white/80 hover:bg-white/10 hover:text-white"
              }`
            }
          >
            <Icon className="w-5 h-5 shrink-0" />
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-white/20">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-white/80 hover:bg-white/10 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5 shrink-0" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
