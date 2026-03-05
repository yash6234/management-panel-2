import { useState, useEffect, useCallback } from "react";
import { Users, Truck, Briefcase, ShoppingCart } from "lucide-react";
import { fetchCommissions } from "../Masters/Commission";
import { fetchSalesMen } from "../Masters/salesManApi";
import { fetchDiesel } from "../Masters/dieselApi";
import { fetchSalesMan, fetchSales } from "../Sales/Sales";
import { statCards, formatDate } from "./Dashboard";

const iconMap = {
  Users,
  Truck,
  Briefcase,
  ShoppingCart,
};

export default function Dashboard() {
  const [persons, setPersons] = useState([]);
  const [diesel, setDiesel] = useState([]);
  const [commission, setCommission] = useState([]);
  const [salesCount, setSalesCount] = useState(0);
  const [recentSales, setRecentSales] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [personsRes, dieselRes, commissionRes] = await Promise.all([
        fetchSalesMen().catch(() => []),
        fetchDiesel().catch(() => []),
        fetchCommissions().catch(() => []),
      ]);
      setPersons(Array.isArray(personsRes) ? personsRes : []);
      setDiesel(Array.isArray(dieselRes) ? dieselRes : []);
      setCommission(Array.isArray(commissionRes) ? commissionRes : []);

      let people = [];
      try {
        people = await fetchSalesMan();
      } catch {
        people = await fetchSalesMen();
      }
      people = Array.isArray(people) ? people : [];
      const allSales = [];
      for (const person of people) {
        const id = person._id;
        const name = person.name ?? person.email ?? "—";
        try {
          const result = await fetchSales(id);
          const list = Array.isArray(result)
            ? result
            : Array.isArray(result?.list)
              ? result.list
              : Array.isArray(result?.data)
                ? result.data
                : [];
          list.forEach((s) => {
            allSales.push({
              ...s,
              salesPersonName: name,
              salesPersonId: id,
            });
          });
        } catch {
          // skip
        }
      }
      allSales.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      setSalesCount(allSales.length);
      setRecentSales(allSales.slice(0, 10));
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const counts = [persons.length, diesel.length, commission.length, salesCount];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Dashboard</h2>
      {error && (
        <div className="text-danger text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </div>
      )}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-gray-500">
          Loading…
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map(({ id, label, icon }, i) => {
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
                  <p className="mt-3 text-2xl font-bold text-gray-900">
                    {counts[i] ?? 0}
                  </p>
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
                    <th className="px-6 py-3 font-medium">Diesel</th>
                    <th className="px-6 py-3 font-medium">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-6 py-8 text-center text-gray-500"
                      >
                        No recent sales. Add data in Sales to see activity here.
                      </td>
                    </tr>
                  ) : (
                    recentSales.map((row, i) => (
                      <tr
                        key={row._id || row.id || i}
                        className="border-t border-[#E5E7EB] hover:bg-gray-50"
                      >
                        <td className="px-6 py-4 text-gray-900">
                          {row.salesPersonName ?? "—"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {row.date ? formatDate(row.date) : "—"}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {row.diesel ?? "—"}
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-1 text-sm font-medium rounded-full bg-success/15 text-success">
                            ₹{row.amount ?? 0}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
