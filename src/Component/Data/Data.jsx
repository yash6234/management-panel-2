import { useState, useEffect, useCallback } from "react";
import DetailCard from "./DetailCard";
import { fetchCommissions } from "../Masters/Commission";
import { fetchSalesMen } from "../Masters/salesManApi";
import { fetchDiesel } from "../Masters/dieselApi";
import { fetchSalesMan, fetchSales } from "../Sales/Sales";

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
      const allSales = [];
      for (const person of people) {
        const id = person._id;
        const name = person.name ?? person.email ?? "—";
        try {
          const list = await fetchSales(id);
          const items = Array.isArray(list) ? list : [];
          items.forEach((s) => {
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {personalDetails.map((p, i) => (
                <DetailCard
                  key={i}
                  title={p.name}
                  fields={[
                    { label: "M.no", value: p.mobile },
                    { label: "Email", value: p.email },
                    { label: "Address", value: p.address },
                  ]}
                />
              ))}
            </div>
          )}
          {activeTab === 1 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {diesel.map((v, i) => (
                <DetailCard
                  key={i}
                  title={v.name}
                  fields={[{ label: "Amount", value: String(v.amount) }]}
                />
              ))}
            </div>
          )}
          {activeTab === 2 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {commission.map((c, i) => (
                <DetailCard
                  key={i}
                  title={c.name}
                  fields={[{ label: "Amount", value: String(c.amount) }]}
                />
              ))}
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
                <p className="text-gray-500 text-sm">No sales data.</p>
              )}
              {!salesLoading && salesData.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {salesData.map((s, i) => (
                    <DetailCard
                      key={s._id || s.id || i}
                      title={s.salesPersonName || "Sales"}
                      fields={[
                        { label: "Date", value: s.date },
                        { label: "Amount", value: s.amount != null ? String(s.amount) : "—" },
                        { label: "Diesel", value: s.diesel ?? "—" },
                        { label: "Left", value: s.left != null ? String(s.left) : "—" },
                        { label: "Over", value: s.over != null ? String(s.over) : "—" },
                      ]}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
