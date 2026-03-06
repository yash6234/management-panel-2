import { useState, useEffect, useCallback } from "react";
import { fetchCommissions } from "../Masters/Commission";
import { fetchSalesMen } from "../Masters/salesManApi";
import { fetchDiesel } from "../Masters/dieselApi";
import { fetchSalesMan, fetchDailySales } from "../Sales/Sales";

const TABS = [
  "Personal Details",
  "Vehicle",
  "Commission/Labour",
  "Sales",
];

export default function Data() {
  const [activeTab, setActiveTab] = useState(0);
  const [commission, setCommission] = useState([]);
  const [personalDetails, setPersonalDetails] = useState([]);
  const [diesel, setDiesel] = useState([]);
  const [salesData, setSalesData] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState(null);

  useEffect(() => {
    fetchCommissions().then(setCommission).catch(() => setCommission([]));
  }, []);
  useEffect(() => {
    fetchSalesMen().then(setPersonalDetails).catch(() => setPersonalDetails([]));
  }, []);
  useEffect(() => {
    fetchDiesel().then(setDiesel).catch(() => setDiesel([]));
  }, []);

  const loadSalesData = useCallback(async () => {
    setSalesLoading(true);
    setSalesError(null);
    try {
      let people = [];
      try {
        people = await fetchSalesMan();
      } catch {
        people = await fetchSalesMen();
      }
      if (!Array.isArray(people) || people.length === 0) {
        setSalesData([]);
        return;
      }
      const now = new Date();
      const month = now.getMonth() + 1;
      const year = now.getFullYear();
      const allSales = [];
      for (const person of people) {
        const id = person._id;
        const name = person.name ?? person.email ?? "—";
        try {
          const items = await fetchDailySales(id, month, year);
          const list = Array.isArray(items) ? items : [];
          list.forEach((s) => {
            allSales.push({
              ...s,
              salesPersonName: name,
              salesPersonId: id,
            });
          });
        } catch {
          // skip this person's sales
        }
      }
      allSales.sort((a, b) => (b.date || "").localeCompare(a.date || ""));
      setSalesData(allSales);
    } catch (err) {
      setSalesError(err?.response?.data?.message || "Failed to load sales data");
      setSalesData([]);
    } finally {
      setSalesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === 3) loadSalesData();
  }, [activeTab, loadSalesData]);

  const formatSaleDate = (val) => {
    if (val == null) return null;
    if (typeof val === "string") return val.split("T")[0] || val;
    if (typeof val === "number" && !isNaN(val)) return new Date(val).toLocaleDateString();
    if (val instanceof Date && !isNaN(val)) return val.toLocaleDateString();
    return String(val).slice(0, 10) || null;
  };

  const getDieselLabel = (dieselIdOrName) => {
    if (dieselIdOrName == null || dieselIdOrName === "") return "—";
    const idStr = String(dieselIdOrName).trim();
    const found = diesel.find(
      (d) => String(d._id ?? d.id ?? "") === idStr
    );
    if (found) return found.name ?? found.amount ?? idStr;
    return idStr;
  };

  const getSaleDisplay = (s) => ({
    date: formatSaleDate(s.date ?? s.sale_date ?? s.startDate ?? s.createdAt ?? s.day) ?? "—",
    amount: s.amount != null ? String(s.amount) : s.deposit != null ? String(s.deposit) : "—",
    diesel: getDieselLabel(s.diesel ?? s.dieselType) || "—",
    left: s.left != null ? String(s.left) : "—",
    over: s.over != null ? String(s.over) : "—",
  });

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Data</h2>
      <div className="bg-card rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        <div className="flex border-b border-[#E5E7EB]">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-6 py-4 text-sm font-medium transition-colors ${activeTab === i
                ? "text-primary border-b-2 border-primary"
                : "text-gray-500 hover:text-gray-700"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 0 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[500px] border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-gray-50/80">
                    <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Name</th>
                    <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">M.no</th>
                    <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Email</th>
                    <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Address</th>
                  </tr>
                </thead>
                <tbody>
                  {personalDetails.map((p, i) => (
                    <tr key={p._id ?? p.id ?? i} className="border-b border-[#E5E7EB] hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-gray-900">{p.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{p.mobile_no ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{p.email ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{p.address ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {personalDetails.length === 0 && (
                <p className="text-gray-500 text-sm py-6 text-center">No personal details.</p>
              )}
            </div>
          )}
          {activeTab === 1 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[300px] border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-gray-50/80">
                    <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Name</th>
                    <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {diesel.map((v, i) => (
                    <tr key={v._id ?? v.id ?? i} className="border-b border-[#E5E7EB] hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-gray-900">{v.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{v.amount != null ? String(v.amount) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {diesel.length === 0 && (
                <p className="text-gray-500 text-sm py-6 text-center">No vehicle/diesel data.</p>
              )}
            </div>
          )}
          {activeTab === 2 && (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[300px] border-collapse">
                <thead>
                  <tr className="border-b border-[#E5E7EB] bg-gray-50/80">
                    <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Name</th>
                    <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {commission.map((c, i) => (
                    <tr key={c._id ?? c.id ?? i} className="border-b border-[#E5E7EB] hover:bg-gray-50/50">
                      <td className="px-4 py-3 text-gray-900">{c.name ?? "—"}</td>
                      <td className="px-4 py-3 text-gray-600">{c.amount != null ? String(c.amount) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {commission.length === 0 && (
                <p className="text-gray-500 text-sm py-6 text-center">No commission data.</p>
              )}
            </div>
          )}
          {activeTab === 3 && (
            <div className="space-y-4">
              {salesLoading && (
                <p className="text-gray-500 text-sm">Loading sales…</p>
              )}
              {salesError && (
                <p className="text-danger text-sm">{salesError}</p>
              )}
              {!salesLoading && !salesError && salesData.length === 0 && (
                <p className="text-gray-500 text-sm py-6 text-center">No sales data.</p>
              )}
              {!salesLoading && salesData.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px] border-collapse">
                    <thead>
                      <tr className="border-b border-[#E5E7EB] bg-gray-50/80">
                        <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Sales Person</th>
                        <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Date</th>
                        <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Amount</th>
                        <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Diesel</th>
                        <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Left</th>
                        <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Over</th>
                      </tr>
                    </thead>
                    <tbody>
                      {salesData.map((s, i) => {
                        const d = getSaleDisplay(s);
                        return (
                          <tr key={s._id ?? s.id ?? i} className="border-b border-[#E5E7EB] hover:bg-gray-50/50">
                            <td className="px-4 py-3 text-gray-900">{s.salesPersonName ?? "—"}</td>
                            <td className="px-4 py-3 text-gray-600">{d.date}</td>
                            <td className="px-4 py-3 text-gray-600">{d.amount}</td>
                            <td className="px-4 py-3 text-gray-600">{d.diesel}</td>
                            <td className="px-4 py-3 text-gray-600">{d.left}</td>
                            <td className="px-4 py-3 text-gray-600">{d.over}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
