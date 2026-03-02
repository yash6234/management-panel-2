import { useState, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Modal from "../Layout/Modal";
import {
  fetchSalesMan,
  fetchSales,
  addMonth,
  addSales,
} from "./Sales";
import { fetchDiesel } from "../Masters/dieselApi";

export default function Sales() {
  const [salesMen, setSalesMen] = useState([]);
  const [dieselOptions, setDieselOptions] = useState([]);
  const [selectedSalesmanId, setSelectedSalesmanId] = useState("");
  const [salesEntries, setSalesEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSales, setLoadingSales] = useState(false);
  const [error, setError] = useState(null);
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    sales_man: "",
    date: "",
    diesel: "",
    amount: "",
    left: 0,
    over: 0,
  });

  const loadSalesMen = useCallback(async () => {
    try {
      setError(null);
      const list = await fetchSalesMan();
      setSalesMen(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load sales men");
      setSalesMen([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDiesel = useCallback(async () => {
    try {
      const list = await fetchDiesel();
      setDieselOptions(Array.isArray(list) ? list : []);
    } catch {
      setDieselOptions([]);
    }
  }, []);

  useEffect(() => {
    loadSalesMen();
    loadDiesel();
  }, [loadSalesMen, loadDiesel]);

  const loadSalesForSalesman = useCallback(async (salesmanId) => {
    if (!salesmanId) {
      setSalesEntries([]);
      return;
    }
    setLoadingSales(true);
    try {
      const list = await fetchSales(salesmanId);
      setSalesEntries(Array.isArray(list) ? list : []);
    } catch (err) {
      setSalesEntries([]);
    } finally {
      setLoadingSales(false);
    }
  }, []);

  useEffect(() => {
    loadSalesForSalesman(selectedSalesmanId);
  }, [selectedSalesmanId, loadSalesForSalesman]);

  const calendarEvents = salesEntries.map((s) => ({
    id: s._id || s.id || `${s.date}-${s.amount}`,
    title: `₹${s.amount ?? s.deposit ?? ""}${s.diesel ? ` - ${s.diesel}` : ""}`,
    date: s.date,
  }));

  const handleDateClick = (info) => {
    setFormData({
      sales_man: selectedSalesmanId || "",
      date: info.dateStr,
      diesel: "",
      amount: "",
      left: 0,
      over: 0,
    });
    setSubmitError(null);
    setShowSalesModal(true);
  };

  const ensureMonthThenAddSales = async () => {
    const { sales_man, date, diesel, amount, left, over } = formData;
    if (!sales_man || !date) {
      setSubmitError("Sales person and date are required.");
      return;
    }
    const [year, month] = date.split("-");
    try {
      await addMonth({
        sales_man,
        month: parseInt(month, 10),
        year: parseInt(year, 10),
      });
    } catch {
      // Month may already exist; continue to add sales
    }
    return addSales({
      date: formData.date,
      sales_man: formData.sales_man,
      diesel: formData.diesel,
      amount: formData.amount,
      left: formData.left ?? 0,
      over: formData.over ?? 0,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      await ensureMonthThenAddSales();
      setShowSalesModal(false);
      if (selectedSalesmanId) loadSalesForSalesman(selectedSalesmanId);
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message || err?.message || "Failed to add sales"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        Loading…
      </div>
    );
  }

  return (
    <div className="space-y-6 h-[calc(100vh-12rem)] flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Sales</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Sales person
          </label>
          <select
            value={selectedSalesmanId}
            onChange={(e) => setSelectedSalesmanId(e.target.value)}
            className="px-4 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30 focus:border-primary min-w-[200px]"
          >
            <option value="">All persons</option>
            {salesMen.map((p) => (
              <option key={p._id} value={p._id}>
                {p.name ?? p.email ?? p._id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div className="text-danger text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      <div className="flex-1 min-h-0 bg-card rounded-xl border border-[#E5E7EB] overflow-hidden p-4 relative">
        {loadingSales && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10 rounded-xl">
            <span className="text-gray-600">Loading sales…</span>
          </div>
        )}
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "dayGridMonth,timeGridWeek,timeGridDay",
          }}
          dateClick={handleDateClick}
          events={calendarEvents}
          height="100%"
          dayMaxEvents={true}
        />
      </div>

      <Modal
        isOpen={showSalesModal}
        onClose={() => setShowSalesModal(false)}
        title="Add Sales Entry"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sales person <span className="text-danger">*</span>
            </label>
            <select
              value={formData.sales_man}
              onChange={(e) =>
                setFormData({ ...formData, sales_man: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
              required
            >
              <option value="">Select person</option>
              {salesMen.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name ?? p.email ?? p._id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date <span className="text-danger">*</span>
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diesel
            </label>
            <select
              value={formData.diesel}
              onChange={(e) =>
                setFormData({ ...formData, diesel: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select diesel (optional)</option>
              {dieselOptions.map((d) => (
                <option
                  key={d._id}
                  value={d._id ?? d.name ?? d.amount}
                >
                  {d.name ?? d.amount ?? d._id}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="Amount"
              className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Left
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={formData.left}
              onChange={(e) =>
                setFormData({ ...formData, left: e.target.value || 0 })
              }
              placeholder="0"
              className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Over
            </label>
            <input
              type="number"
              min="0"
              step="any"
              value={formData.over}
              onChange={(e) =>
                setFormData({ ...formData, over: e.target.value || 0 })
              }
              placeholder="0"
              className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
            />
          </div>
          {submitError && (
            <div className="text-danger text-sm">{submitError}</div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={() => setShowSalesModal(false)}
              className="px-4 py-2 border border-[#E5E7EB] rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
            >
              {submitting ? "Adding…" : "Add"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
