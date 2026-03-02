import { useState,useEffect } from "react";
import DetailCard from "./DetailCard";
import {
  mockPersonalDetails,
  mockVehicles,
  mockCommission,
  mockSales,
} from "./Data";
import { fetchCommissions } from "../Masters/Commission";
import { fetchSalesMen } from "../Masters/salesManApi";
import { fetchDiesel } from "../Masters/dieselApi";

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
const [diesel,setDiesel] = useState([]);

useEffect(() => {
  fetchCommissions().then(setCommission);
}, []);
useEffect(() => {
  fetchSalesMen().then(setPersonalDetails);
}, []);
useEffect(() => {
  fetchDiesel().then(setDiesel);
}, []);

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Data</h2>
      <div className="bg-card rounded-xl shadow-sm border border-[#E5E7EB] overflow-hidden">
        <div className="flex border-b border-[#E5E7EB]">
          {TABS.map((tab, i) => (
            <button
              key={tab}
              onClick={() => setActiveTab(i)}
              className={`px-6 py-4 text-sm font-medium transition-colors ${
                activeTab === i
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {mockSales.map((s, i) => (
                <DetailCard
                  key={i}
                  title={s.name}
                  fields={[
                    { label: "Date", value: s.date },
                    { label: "Products", value: s.products },
                    { label: "Deposit", value: String(s.deposit) },
                    { label: "Credit", value: s.credit },
                    { label: "Location", value: s.location },
                  ]}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
