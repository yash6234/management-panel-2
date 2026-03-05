import { useState, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Modal from "../Layout/Modal";
import { fetchSalesMan, fetchSales, addMonth, addSales } from "./Sales";
import { fetchSalesMen } from "../Masters/salesManApi";
import { fetchDiesel } from "../Masters/dieselApi";

const STEPS = { GRID: "grid", MONTH: "month", CALENDAR: "calendar" };
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Sales() {
  const [step, setStep] = useState(STEPS.GRID);
  const [salesMen, setSalesMen] = useState([]);
  const [dieselOptions, setDieselOptions] = useState([]);
  const [selectedSalesman, setSelectedSalesman] = useState(null);
  const [salesEntries, setSalesEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingSales, setLoadingSales] = useState(false);
  const [error, setError] = useState(null);

  const [monthYear, setMonthYear] = useState(() => {
    const d = new Date();
    return { month: d.getMonth() + 1, year: d.getFullYear() };
  });
  const [addMonthSubmitting, setAddMonthSubmitting] = useState(false);
  const [addMonthError, setAddMonthError] = useState(null);

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
      let list = [];
      try {
        list = await fetchSalesMan();
      } catch {
        // Fallback: /fetch-sales-man may not exist on backend; use Masters list
        list = await fetchSalesMen();
      }
      setSalesMen(Array.isArray(list) ? list : []);
    } catch (err) {
      setError(err?.response?.data?.message || "Failed to load sales persons");
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
      const response = await fetchSales(salesmanId);

      console.log("API Response:", response);

      const salesArray =
        Array.isArray(response)
          ? response
          : Array.isArray(response?.data)
            ? response.data
            : [];

      setSalesEntries(salesArray);
    } catch (err) {
      console.log(err);
      setSalesEntries([]);
    } finally {
      setLoadingSales(false);
    }
  }, []);
  useEffect(() => {
    if (step === STEPS.CALENDAR && selectedSalesman?._id) {
      loadSalesForSalesman(selectedSalesman._id);
    }
  }, [step, selectedSalesman?._id, loadSalesForSalesman]);

  const toDateStr = (val) => {
    if (val == null) return null;
    if (typeof val === "string") {
      const part = val.split("T")[0];
      return part.length >= 10 ? part.slice(0, 10) : part || null;
    }
    if (typeof val === "number" && !isNaN(val))
      return new Date(val).toISOString().slice(0, 10);
    if (val instanceof Date && !isNaN(val)) return val.toISOString().slice(0, 10);
    return null;
  };

  const calendarEvents = salesEntries.map((s) => ({
    id: s._id,
    title: `₹${s.amount || 0}`,
    start: s.date,
    allDay: true,
  }));

  const handleSelectPerson = (person) => {
    setSelectedSalesman(person);
    setAddMonthError(null);
    const d = new Date();
    setMonthYear({ month: d.getMonth() + 1, year: d.getFullYear() });
    setStep(STEPS.MONTH);
  };

  const handleAddMonthSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSalesman?._id) return;
    setAddMonthSubmitting(true);
    setAddMonthError(null);
    try {
      await addMonth({
        sales_man: selectedSalesman._id,
        month: monthYear.month,
        year: monthYear.year,
      });
      setStep(STEPS.CALENDAR);
    } catch (err) {
      const data = err?.response?.data;
      const msg =
        (typeof data === "string" && data) ||
        (typeof data?.message === "string" && data.message) ||
        (typeof data?.msg === "string" && data.msg) ||
        (typeof data?.error === "string" && data.error) ||
        (typeof err?.message === "string" && err.message) ||
        "Failed to add month. Check that the sales person and month/year are valid.";
      const monthAlreadyExists = /month.*already|already.*(exist|exists)/i.test(msg);
      if (monthAlreadyExists) {
        setAddMonthError(null);
        setStep(STEPS.CALENDAR);
      } else {
        setAddMonthError(msg);
      }
    } finally {
      setAddMonthSubmitting(false);
    }
  };

  const handleDateClick = (info) => {
    setFormData({
      sales_man: selectedSalesman?._id || "",
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
    const [year, month] = date.split("-").map(Number);
    try {
      await addMonth({ sales_man, month, year });
    } catch {
      // Month may already exist
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

  const handleAddSalesSubmit = async (e) => {
    e.preventDefault();

    const newSale = {
      _id: Date.now(),
      date: formData.date,
      amount: formData.amount,
    };

    setSalesEntries((prev) => [...prev, newSale]);

    setShowSalesModal(false);
  };
  useEffect(() => {
    console.log("salesEntries:", salesEntries);
  }, [salesEntries]);
  useEffect(() => {
    console.log("calendarEvents:", calendarEvents);
  }, [calendarEvents]);

  const goBack = () => {
    if (step === STEPS.MONTH) {
      setSelectedSalesman(null);
      setStep(STEPS.GRID);
    } else if (step === STEPS.CALENDAR) {
      setStep(STEPS.MONTH);
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
    <div className="space-y-6 h-[calc(100vh-8rem)] flex flex-col">
      <div className="flex items-center justify-between">
        {/* <h2 className="text-xl font-semibold text-gray-900">Sales</h2> */}
        {step !== STEPS.GRID && (
          <button
            type="button"
            onClick={goBack}
            className="px-4 py-2 border border-[#E5E7EB] rounded-lg hover:bg-gray-50"
          >
            Back
          </button>
        )}
      </div>

      {error && (
        <div className="text-danger text-sm bg-red-50 border border-red-200 rounded-lg px-4 py-2">
          {error}
        </div>
      )}

      {/* Step 1: Grid of sales persons */}
      {step === STEPS.GRID && (
        <div className="flex-1 min-h-0 overflow-auto">
          {/* <p className="text-sm text-gray-600 mb-4">
            Select a sales person to add month/year and manage sales.
          </p> */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {salesMen.map((p) => (
              <button
                key={p._id}
                type="button"
                onClick={() => handleSelectPerson(p)}
                className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-[#E5E7EB] bg-card hover:border-primary hover:bg-primary/5 hover:shadow-md transition-all w-full aspect-square min-h-0"
              >
                <span className="font-medium text-gray-900 truncate w-full text-center">
                  {p.name ?? "—"}
                </span>
                {p.email && (
                  <span className="text-sm text-gray-500 truncate w-full text-center mt-1">
                    {p.email}
                  </span>
                )}
              </button>
            ))}
          </div>
          {salesMen.length === 0 && !error && (
            <p className="text-gray-500 text-center py-8">No sales persons found.</p>
          )}
        </div>
      )}

      {/* Step 2: Add month / year */}
      {step === STEPS.MONTH && selectedSalesman && (
        <div className="flex-1 flex flex-col">
          <div className="bg-card rounded-xl border border-[#E5E7EB] p-6 max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              Add month for {selectedSalesman.name ?? selectedSalesman.email ?? "Sales person"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Select month and year, then continue to the calendar.
            </p>
            <form onSubmit={handleAddMonthSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Month
                </label>
                <select
                  value={monthYear.month}
                  onChange={(e) =>
                    setMonthYear((prev) => ({
                      ...prev,
                      month: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
                >
                  {MONTHS.map((name, i) => (
                    <option key={name} value={i + 1}>
                      {name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Year
                </label>
                <select
                  value={monthYear.year}
                  onChange={(e) =>
                    setMonthYear((prev) => ({
                      ...prev,
                      year: parseInt(e.target.value, 10),
                    }))
                  }
                  className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(
                    (y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    )
                  )}
                </select>
              </div>
              {addMonthError && (
                <div className="text-danger text-sm">{addMonthError}</div>
              )}
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={goBack}
                  className="px-4 py-2 border border-[#E5E7EB] rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={addMonthSubmitting}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {addMonthSubmitting ? "Adding…" : "Continue to calendar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Step 3: Calendar view */}
      {step === STEPS.CALENDAR && selectedSalesman && (
        <>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">
            Sales calendar for {selectedSalesman.name ?? selectedSalesman.email ?? "Sales person"}
          </h2>

          <div className="flex-1 min-h-[calc(100vh-10rem)] bg-card rounded-xl border border-[#E5E7EB] overflow-auto p-4 relative flex flex-col">
            <style>{`
              .fc-daygrid-day.fc-day-addable { cursor: pointer; }
              .fc-daygrid-day.fc-day-addable:hover { background: rgba(59, 130, 246, 0.08); }
              .fc .fc-daygrid-event { white-space: normal; line-height: 1.2; }
              .fc .fc-daygrid-day-frame { min-height: 80px; }
            `}</style>
            {loadingSales && (
              <div className="absolute inset-0 flex items-center justify-center bg-white/60 z-10 rounded-xl">
                <span className="text-gray-600">Loading sales…</span>
              </div>
            )}
            <div className="flex-1 min-h-0">
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
                height="calc(100vh - 10rem)"
                eventDisplay="block"
                dayMaxEvents={3}
                dayMaxEventRows={true}
                dayCellClassNames={() => ["fc-day-addable"]}
              />
            </div>
          </div>
        </>
      )}

      {/* Add Sales modal */}
      <Modal
        isOpen={showSalesModal}
        onClose={() => setShowSalesModal(false)}
        title="Add Sales Entry"
      >
        <form onSubmit={handleAddSalesSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sales person <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={selectedSalesman?.name ?? selectedSalesman?.email ?? formData.sales_man}
              readOnly
              className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] bg-gray-50 text-gray-700"
            />
            <input type="hidden" name="sales_man" value={formData.sales_man} />
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
