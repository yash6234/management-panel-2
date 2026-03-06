import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import DashboardHeader from "./DashboardHeader";

export default function Layout() {
  return (
    <div className="h-screen flex bg-[#F8FAFC]">
      <Sidebar />
      <div className="flex-1 flex flex-col w-full">
        <DashboardHeader />
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
