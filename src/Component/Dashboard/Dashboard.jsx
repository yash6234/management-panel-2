import { Users, Truck, Briefcase, ShoppingCart } from "lucide-react";
import { statCards, recentActivity, formatDate } from "./Dashboard";

const iconMap = {
  Users,
  Truck,
  Briefcase,
  ShoppingCart,
};

export default function Dashboard() {
  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ id, label, icon }) => {
          const Icon = iconMap[icon];
          return (
            <div
              key={id}
              className="bg-card rounded-xl p-5 shadow-sm border border-[#E5E7EB] hover:shadow-md transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="font-medium text-gray-900">{label}</span>
              </div>
              <p className="mt-3 text-2xl font-bold text-gray-900">0</p>
            </div>
          );
        })}
      </div>
      <div className="bg-card rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        <div className="p-4 border-b border-[#E5E7EB]">
          <h3 className="font-semibold text-gray-900">Recent Activity</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F8FAFC] text-left text-sm text-gray-600">
                <th className="px-6 py-3 font-medium">Name</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Products</th>
                <th className="px-6 py-3 font-medium">Deposit</th>
              </tr>
            </thead>
            <tbody>
              {recentActivity.map((row) => (
                <tr
                  key={row.id}
                  className="border-t border-[#E5E7EB] hover:bg-gray-50"
                >
                  <td className="px-6 py-4 text-gray-900">{row.name}</td>
                  <td className="px-6 py-4 text-gray-600">
                    {formatDate(row.date)}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{row.products}</td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2 py-1 text-sm font-medium rounded-full bg-success/15 text-success">
                      {row.deposit}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
