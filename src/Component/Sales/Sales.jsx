import { useState, useEffect, useCallback } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Modal from "../Layout/Modal";
import { fetchSalesMan, fetchSales, fetchDailySales, addMonth, addSales, editSales, deleteSales, fetchSalesTotals, fetchSalesPerMonth } from "./Sales";
import { fetchSalesMen } from "../Masters/salesManApi";
import { fetchDiesel } from "../Masters/dieselApi";
import Report from "../Report/Report";

const STEPS = { GRID: "grid", CALENDAR: "calendar" };
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export default function Sales() {
  const [step, setStep] = useState(STEPS.GRID);

  const [salesMen, setSalesMen] = useState([]);
  const [totals, setTotals] = useState({ totalAmount: 0, finalPayable: 0 });
  const [yearTotals, setYearTotals] = useState({ totalAmount: 0, finalPayable: 0 });
  const [perMonthData, setPerMonthData] = useState(null);
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
  // Per-row month/year for each sales person (keyed by person id)
  const [rowMonthYear, setRowMonthYear] = useState({});
  const getRowMonthYear = (personId) => {
    const d = new Date();
    const def = { month: d.getMonth() + 1, year: d.getFullYear() };
    return rowMonthYear[personId] ?? def;
  };
  const [addMonthSubmitting, setAddMonthSubmitting] = useState(false);
  const [addMonthError, setAddMonthError] = useState(null);

  const [showSalesModal, setShowSalesModal] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [viewingSale, setViewingSale] = useState(null);
  const [submitError, setSubmitError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [formData, setFormData] = useState({
    sales_man: "",
    date: "",
    diesel: "",
    amount: "",
    left: "",
    over: "",
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

  const getDieselLabel = useCallback((dieselIdOrName) => {
    if (dieselIdOrName == null || dieselIdOrName === "") return "—";
    const idStr = String(dieselIdOrName).trim();
    const found = dieselOptions.find((d) => String(d._id ?? d.id ?? "") === idStr);
    return found ? (found.name ?? String(found.amount ?? idStr)) : idStr;
  }, [dieselOptions]);

  const formatSaleDate = useCallback((val) => {
    if (!val) return null;

    if (typeof val === "string") {
      return val.slice(0, 10);
    }

    return val;
  }, []);

  const getSaleDisplay = useCallback((s) => ({
    date: formatSaleDate(s.date ?? s.sale_date ?? s.startDate ?? s.createdAt ?? s.day) ?? "—",
    amount: s.amount != null ? String(s.amount) : s.deposit != null ? String(s.deposit) : "—",
    diesel: getDieselLabel(s.diesel ?? s.dieselType) || "—",
    left: s.left != null ? String(s.left) : "—",
    over: s.over != null ? String(s.over) : "—",
  }), [formatSaleDate, getDieselLabel]);

  useEffect(() => {
    loadSalesMen();
    loadDiesel();
  }, [loadSalesMen, loadDiesel]);

  useEffect(() => {
    if (dieselOptions.length > 0) {
      setFormData((prev) => ({
        ...prev,
        diesel: prev.diesel || dieselOptions[0]._id,
      }));
    }
  }, [dieselOptions]);
  const loadSalesForSalesman = useCallback(async (salesmanId, month, year) => {
    if (!salesmanId) {
      setSalesEntries([]);
      return;
    }
    setLoadingSales(true);
    try {
      const list = await fetchDailySales(
        salesmanId,
        month ?? monthYear.month,
        year ?? monthYear.year
      );
      setSalesEntries(Array.isArray(list) ? list : []);
    } catch {
      setSalesEntries([]);
    } finally {
      setLoadingSales(false);
    }
  }, [monthYear.month, monthYear.year]);

  const loadSalesTotals = useCallback(async (salesmanId) => {
    if (!salesmanId) return;
    try {
      const data = await fetchSalesTotals(salesmanId);
      const totalAmount = Array.isArray(data)
        ? data.reduce((sum, item) => sum + Number(item?.total_sales ?? 0), 0)
        : Number(data?.total_amount ?? data?.totalAmount ?? 0);
      const finalPayable = Array.isArray(data)
        ? data.reduce((sum, item) => sum + Number(item?.final_amount ?? 0), 0)
        : Number(data?.total_payable ?? data?.finalPayable ?? 0);
      setTotals({ totalAmount, finalPayable });
    } catch (err) {
      console.error("Failed to load totals", err);
    }
  }, []);

  /** Fetches full-year total amount & total payable (fetchSalesTotals). */
  const loadYearTotals = useCallback(async (salesmanId) => {
    if (!salesmanId) return;
    try {
      const data = await fetchSalesTotals(salesmanId);
      const totalAmount = Array.isArray(data)
        ? data.reduce((sum, item) => sum + Number(item?.total_sales ?? 0), 0)
        : Number(data?.total_amount ?? data?.totalAmount ?? 0);
      const finalPayable = Array.isArray(data)
        ? data.reduce((sum, item) => sum + Number(item?.final_amount ?? 0), 0)
        : Number(data?.total_payable ?? data?.finalPayable ?? 0);
      setYearTotals({ totalAmount, finalPayable });
    } catch (err) {
      console.error("Failed to load year totals", err);
    }
  }, []);

  /** Fetches per-month total & total payable from fetchSalesPerMonth API; month label from backend when provided. */
  const loadPerMonthTotals = useCallback(async (salesmanId, month, year) => {
    if (!salesmanId) return;
    try {
      const data = await fetchSalesPerMonth(salesmanId, month, year);
      if (data == null) {
        setPerMonthData(null);
        return;
      }
      const item = Array.isArray(data) && data.length > 0 ? data[0] : data;
      if (!item || typeof item !== "object") {
        setPerMonthData(null);
        return;
      }
      const m = Number(item.month ?? item.month_number ?? month);
      const y = Number(item.year ?? year);
      const monthLabel =
        item.month_name ?? item.monthName ?? item.month_label ?? MONTHS[m - 1];
      const totalAmount = Number(
        item.total_amount ?? item.total_sales ?? item.totalAmount ?? 0
      );
      const totalPayable = Number(
        item.total_payable ?? item.final_amount ?? item.finalPayable ?? 0
      );
      setTotals({ totalAmount, finalPayable: totalPayable });
      setPerMonthData({
        month: m,
        year: y,
        monthLabel: `${monthLabel} ${y}`,
        totalAmount,
        totalPayable,
      });
    } catch (err) {
      console.error("Failed to load per-month totals", err);
      setPerMonthData(null);
    }
  }, []);

  useEffect(() => {
    if (step === STEPS.CALENDAR && selectedSalesman?._id) {
      loadSalesForSalesman(selectedSalesman._id, monthYear.month, monthYear.year);
      loadPerMonthTotals(
        selectedSalesman._id,
        monthYear.month,
        monthYear.year
      );
      loadYearTotals(selectedSalesman._id);
    }
  }, [
    step,
    selectedSalesman?._id,
    monthYear.month,
    monthYear.year,
    loadSalesForSalesman,
    loadPerMonthTotals,
    loadYearTotals,
  ]);

  const toDateStr = (val) => {
    if (!val) return null;

    if (typeof val === "string") {
      return val.slice(0, 10);
    }

    const d = new Date(val);

    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  };

  const calendarEvents = salesEntries
    .map((s, i) => {
      const dateStr = toDateStr(
        s.date ?? s.sale_date ?? s.startDate ?? s.createdAt ?? s.day
      );
      if (!dateStr) return null;
      const amount = s.amount ?? s.deposit ?? 0;
      const left = s.left != null ? s.left : "—";
      const over = s.over != null ? s.over : "—";
      return {
        id: s._id ?? s.id ?? `evt-${i}-${dateStr}`,
        title: `₹${amount}`,
        start: dateStr,

        allDay: true,
        extendedProps: { amount, left, over },
      };
    })
    .filter(Boolean);

  const totalAmount = salesEntries.reduce((sum, s) => {
    const amt = Number(s.amount ?? s.deposit ?? 0);
    return sum + (isNaN(amt) ? 0 : amt);
  }, 0);
  const renderEventContent = (eventInfo) => {
    const { amount, left, over } = eventInfo.event.extendedProps ?? {};
    return (
      <div className="flex flex-col gap-0.5 text-left text-xs leading-tight py-1">
        <div className="block">Amount: ₹{amount ?? "—"}</div>
        <div className="block">Left: {left ?? "—"}</div>
        <div className="block">Over: {over ?? "—"}</div>
      </div>
    );
  };

  const handleContinueToCalendar = async (e, person, rowMonth, rowYear) => {
    e.preventDefault();
    const targetPerson = person ?? selectedSalesman;
    if (!targetPerson?._id) return;
    const month = rowMonth ?? monthYear.month;
    const year = rowYear ?? monthYear.year;
    setSelectedSalesman(targetPerson);
    setMonthYear({ month, year });
    setAddMonthSubmitting(true);
    setAddMonthError(null);
    try {
      await addMonth({
        sales_man: targetPerson._id,
        month,
        year,
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
    setViewingSale(null);
    setFormData({
      sales_man: selectedSalesman?._id || "",
      date: info.dateStr,
      diesel: dieselOptions[0]?._id || "",
      amount: "",
      left: "",
      over: "",
    });
    setSubmitError(null);
    setShowSalesModal(true);
  };

  const handleEventClick = (info) => {
    info.jsEvent.preventDefault();

    const eventId = info.event.id;

    const sale = salesEntries.find(
      (s) => String(s._id ?? s.id) === String(eventId)
    );

    if (!sale) return;

    const rawDate = sale.date ?? sale.sale_date ?? "";
    const dateValue = rawDate.split("T")[0];

    setViewingSale(sale);

    setFormData({
      sales_man: selectedSalesman?._id || "",
      date: dateValue,
      diesel: sale.diesel ?? "",
      amount: sale.amount ?? sale.deposit ?? "",
      left: sale.left ? String(sale.left) : "",
      over: sale.over ? String(sale.over) : "",
    });

    setSubmitError(null);
    setShowSalesModal(true);
  };
  // const handleViewSaleDetails = (sale) => {

  //   const rawDate = sale.date ?? sale.sale_date ?? "";
  //   const dateValue = rawDate.split("T")[0];

  // setViewingSale(sale); // KEEP SALE FOR EDIT MODE

  //   setFormData({
  //     sales_man: selectedSalesman?._id || "",
  //     date: dateValue,
  //     diesel: sale.diesel ?? "",
  //     amount: sale.amount ?? sale.deposit ?? "",
  //     left: sale.left ?? 0,
  //     over: sale.over ?? 0,
  //   });

  //   setShowSalesModal(true);
  // };

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

  const handleDeleteSale = async () => {
    if (!viewingSale?._id) return;
    setDeleting(true);
    setSubmitError(null);
    try {
      await deleteSales(viewingSale._id);
      setShowSalesModal(false);
      setViewingSale(null);
      if (selectedSalesman?._id) {
        await loadSalesForSalesman(
          selectedSalesman._id,
          monthYear.month,
          monthYear.year
        );
        await loadPerMonthTotals(
          selectedSalesman._id,
          monthYear.month,
          monthYear.year
        );
        await loadYearTotals(selectedSalesman._id);
      }
    } catch (err) {
      setSubmitError(
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete sales entry"
      );
    } finally {
      setDeleting(false);
    }
  };
  const getErrorMessage = (err) => {
    const data = err?.response?.data;

    if (typeof data === "string") return data;

    return (
      data?.message ||
      data?.error ||
      data?.msg ||
      err?.message ||
      "Something went wrong"
    );
  };
  const addSalesFromCalendar = async () => {
    const { sales_man, date } = formData;

    if (!sales_man || !date) {
      setSubmitError("Sales person and date are required.");
      return;
    }

    const [year, month] = date.split("-").map(Number);

    // ensure month exists
    try {
      await addMonth({
        sales_man,
        month,
        year,
      });
    } catch {
      // month already exists
    }

    return addSales({
      date,
      sales_man,
      diesel: formData.diesel ?? "",
      amount: formData.amount,
      left: formData.left ?? 0,
      over: formData.over ?? 0,
    });
  };

  const handleAddSalesSubmit = async (e) => {
    console.log("FORM SUBMIT TRIGGERED");
    e.preventDefault();

    setSubmitting(true);
    setSubmitError(null);

    try {

      console.log("viewingSale", viewingSale);
      // EDIT MODE

      if (viewingSale?._id) {
        console.log("EDIT MODE:", viewingSale?._id);
        console.log("EDIT PAYLOAD", {
          id: viewingSale._id,
          date: formData.date,
          sales_man: formData.sales_man,
          diesel: formData.diesel ?? "",
          amount: formData.amount,
          left: formData.left,
          over: formData.over,
        });
        await editSales({
          id: viewingSale._id,
          date: formData.date,
          sales_man: formData.sales_man,
          diesel: formData.diesel ?? "",
          amount: Number(formData.amount),
          left: formData.left === "" ? 0 : Number(formData.left),
          over: formData.over === "" ? 0 : Number(formData.over),
        });

      }
      // ADD MODE
      else {

        if (step === STEPS.CALENDAR && selectedSalesman?._id) {
          await addSalesFromCalendar();
        } else {
          await ensureMonthThenAddSales();
        }

      }

      setShowSalesModal(false);
      setViewingSale(null);

      // reload calendar data
      if (selectedSalesman?._id) {
        await loadSalesForSalesman(
          selectedSalesman._id,
          monthYear.month,
          monthYear.year
        );

        await loadPerMonthTotals(
          selectedSalesman._id,
          monthYear.month,
          monthYear.year
        );

        await loadYearTotals(selectedSalesman._id);
      }

    } catch (err) {
      setSubmitError(getErrorMessage(err) || "Failed to save sales");
    } finally {
      setSubmitting(false);
    }
  };
  const handleDatesSet = (info) => {
    const date = info.view.currentStart;

    const month = date.getMonth() + 1;
    const year = date.getFullYear();

    setMonthYear({ month, year });

    if (selectedSalesman?._id) {
      loadSalesForSalesman(selectedSalesman._id, month, year);
      loadPerMonthTotals(selectedSalesman._id, month, year);
      loadYearTotals(selectedSalesman._id);
    }
  };

  const goBack = () => {
    if (step === STEPS.CALENDAR) {
      setStep(STEPS.GRID);
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

      {/* Calendar view (when step is CALENDAR) */}
      {step === STEPS.CALENDAR && selectedSalesman && (
        <>
          <div className="flex items-center justify-between gap-4 mb-2">
            <h2 className="text-lg font-semibold text-gray-900">
              Sales calendar for {selectedSalesman.name ?? selectedSalesman.email ?? "Sales person"}
            </h2>
            <button
              type="button"
              onClick={() => setShowReportModal(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm whitespace-nowrap"
            >
              Download Report
            </button>
          </div>

          <div className="flex flex-wrap gap-4 mb-4">
            <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-2 min-w-[180px]">
              <span className="text-sm text-gray-600 block">
                Total Amount
                {perMonthData?.monthLabel && (
                  <span className="font-medium text-gray-700"> — {perMonthData.monthLabel}</span>
                )}
                {!perMonthData?.monthLabel && monthYear?.month && (
                  <span className="font-medium text-gray-700">
                    {" "}
                    — {MONTHS[monthYear.month - 1]} {monthYear.year}
                  </span>
                )}
              </span>
              <div className="text-lg font-semibold text-green-700">
                ₹{(totals.totalAmount ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-2 min-w-[180px]">
              <span className="text-sm text-gray-600 block">
                Total Payable
                {perMonthData?.monthLabel && (
                  <span className="font-medium text-gray-700"> — {perMonthData.monthLabel}</span>
                )}
                {!perMonthData?.monthLabel && monthYear?.month && (
                  <span className="font-medium text-gray-700">
                    {" "}
                    — {MONTHS[monthYear.month - 1]} {monthYear.year}
                  </span>
                )}
              </span>
              <div className="text-lg font-semibold text-blue-700">
                ₹{(totals.finalPayable ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-2 min-w-[180px]">
              <span className="text-sm text-gray-600 block">
                Total Amount <span className="font-medium text-gray-700">— Year {monthYear?.year ?? new Date().getFullYear()}</span>
              </span>
              <div className="text-lg font-semibold text-amber-700">
                ₹{(yearTotals.totalAmount ?? 0).toLocaleString()}
              </div>
            </div>
            <div className="bg-purple-50 border border-purple-200 rounded-lg px-4 py-2 min-w-[180px]">
              <span className="text-sm text-gray-600 block">
                Total Payable <span className="font-medium text-gray-700">— Year {monthYear?.year ?? new Date().getFullYear()}</span>
              </span>
              <div className="text-lg font-semibold text-purple-700">
                ₹{(yearTotals.finalPayable ?? 0).toLocaleString()}
              </div>
            </div>
          </div>

          {/* <div className="bg-card rounded-xl border border-[#E5E7EB] p-6 mb-4">
            <h3 className="text-base font-semibold text-gray-900 mb-3">Added sales </h3>
            {loadingSales && salesEntries.length === 0 ? (
              <p className="text-gray-500 text-sm">Loading sales…</p>
            ) : salesEntries.length === 0 ? (
              <p className="text-gray-500 text-sm">No sales yet. Click a date on the calendar to add sales.</p>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {salesEntries.map((s, i) => {
                  const d = getSaleDisplay(s);
                  return (
                    <div
                      key={s._id ?? s.id ?? i}
                      role="button"
                      tabIndex={0}
                      onClick={() => handleViewSaleDetails(s)}
                      onKeyDown={(e) => e.key === "Enter" && handleViewSaleDetails(s)}
                      className="flex flex-wrap items-center gap-x-4 gap-y-1 border border-[#E5E7EB] rounded-lg px-3 py-2 bg-gray-50/50 text-sm cursor-pointer hover:bg-gray-100 hover:border-primary/30 transition-colors"
                    >
                      <span className="font-medium text-gray-700">{d.date}</span>
                      <span><span className="text-gray-500">Amount:</span> {d.amount}</span>
                      <span><span className="text-gray-500">Diesel:</span> {d.diesel}</span>
                      <span><span className="text-gray-500">Left:</span> {d.left}</span>
                      <span><span className="text-gray-500">Over:</span> {d.over}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div> */}

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
                initialDate={`${monthYear.year}-${String(monthYear.month).padStart(2, "0")}-01`}
                headerToolbar={{
                  left: "prev,next today",
                  center: "title",
                  right: "dayGridMonth,timeGridWeek,timeGridDay",
                }}
                datesSet={handleDatesSet}
                dateClick={handleDateClick}
                eventClick={handleEventClick}
                events={calendarEvents}
                eventContent={renderEventContent}
                height="calc(100vh - 10rem)"
                eventDisplay="block"
                dayMaxEvents={false}
                dayMaxEventRows={false}
                dayCellClassNames={() => ["fc-day-addable"]}
              />
            </div>
          </div>
        </>
      )}



      {/* Table: Person name, Email, Month, Year, Continue to calendar (per row) - after calendar UI */}
      <div className="bg-card rounded-xl border border-[#E5E7EB] overflow-hidden">
        {addMonthError && (
          <div className="text-danger text-sm px-4 py-2 bg-red-50 border-b border-red-200">{addMonthError}</div>
        )}
        <div className="overflow-x-auto">
          <table className="w-full min-w-[500px]">
            <thead>
              <tr className="border-b border-[#E5E7EB] bg-gray-50/80">
                <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Person name</th>
                <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Email</th>
                <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Month</th>
                <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Year</th>
                <th className="text-left text-sm font-medium text-gray-700 px-4 py-3 w-[180px]">Action</th>
              </tr>
            </thead>
            <tbody>
              {salesMen.map((p) => {
                const pid = p._id ?? p.id;
                const my = getRowMonthYear(pid);
                return (
                  <tr key={pid} className="border-b border-[#E5E7EB] hover:bg-gray-50/50">
                    <td className="px-4 py-3 text-gray-900">{p.name ?? "—"}</td>
                    <td className="px-4 py-3 text-gray-600">{p.email ?? "—"}</td>
                    <td className="px-4 py-3">
                      <select
                        value={my.month}
                        onChange={(e) => {
                          const d = new Date();
                          const def = { month: d.getMonth() + 1, year: d.getFullYear() };
                          setRowMonthYear((prev) => ({
                            ...prev,
                            [pid]: { ...(prev[pid] ?? def), month: parseInt(e.target.value, 10) },
                          }));
                        }}
                        className="w-full min-w-[100px] px-3 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30 bg-white text-sm"
                      >
                        {MONTHS.map((name, i) => (
                          <option key={name} value={i + 1}>
                            {name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={my.year}
                        onChange={(e) => {
                          const d = new Date();
                          const def = { month: d.getMonth() + 1, year: d.getFullYear() };
                          setRowMonthYear((prev) => ({
                            ...prev,
                            [pid]: { ...(prev[pid] ?? def), year: parseInt(e.target.value, 10) },
                          }));
                        }}
                        className="w-full min-w-[80px] px-3 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30 bg-white text-sm"
                      >
                        {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(
                          (y) => (
                            <option key={y} value={y}>
                              {y}
                            </option>
                          )
                        )}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={(e) => handleContinueToCalendar(e, p, my.month, my.year)}
                        disabled={addMonthSubmitting}
                        className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50 text-sm whitespace-nowrap"
                      >
                        {addMonthSubmitting ? "Adding…" : "Continue to calendar"}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {salesMen.length === 0 && !error && (
          <p className="text-gray-500 text-center py-8">No sales persons found.</p>
        )}
      </div>

      {/* View sale details modal */}
      {/* <Modal
        isOpen={!!viewingSale}
        onClose={() => setViewingSale(null)}
        title="Sale details"
      >
        {viewingSale && (() => {
          const d = getSaleDisplay(viewingSale);
          return (
            <div className="space-y-4">
              <div className="grid gap-3 text-sm">
                <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                  <span className="text-gray-500">Date</span>
                  <span className="font-medium text-gray-900">{d.date}</span>
                </div>
                <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                  <span className="text-gray-500">Amount</span>
                  <span className="font-medium text-gray-900">₹{d.amount}</span>
                </div>
                <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                  <span className="text-gray-500">Diesel</span>
                  <span className="font-medium text-gray-900">{d.diesel}</span>
                </div>
                <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                  <span className="text-gray-500">Left</span>
                  <span className="font-medium text-gray-900">{d.left}</span>
                </div>
                <div className="flex justify-between border-b border-[#E5E7EB] pb-2">
                  <span className="text-gray-500">Over</span>
                  <span className="font-medium text-gray-900">{d.over}</span>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setViewingSale(null)}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                >
                  Close
                </button>
              </div>
            </div>
          );
        })()}
      </Modal> */}

      {/* Report modal */}
      <Modal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        title="Sales Report"
      >
        {showReportModal && (
          <Report
            salesEntries={salesEntries}
            totals={totals}
            selectedSalesman={selectedSalesman}
            monthYear={monthYear}
            dieselOptions={dieselOptions}
            getDieselLabel={getDieselLabel}
          />
        )}
      </Modal>

      {/* Add Sales modal - larger card & text for accessibility (older users) */}
      <Modal
        isOpen={showSalesModal}
        onClose={() => setShowSalesModal(false)}
        title={viewingSale ? "Edit Sales Entry" : "Add Sales Entry"}
        cardClassName="max-w-2xl"
        titleSize="text-xl"
        contentPadding="p-6"
      >
        <form onSubmit={handleAddSalesSubmit} className="space-y-5 text-lg">
          {/* Sales Person (bold name) | Date */}
          <div className="flex flex-wrap items-end gap-5">
            <div className="flex-1 min-w-[200px]">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Sales Person <span className="text-danger">*</span>
              </label>
              <div className="px-5 py-3.5 text-lg rounded-lg border border-[#E5E7EB] bg-gray-50 text-gray-900 font-semibold">
                {(selectedSalesman?.name ?? selectedSalesman?.email ?? formData.sales_man) || "—"}
              </div>
              <input type="hidden" name="sales_man" value={formData.sales_man} />
            </div>
            <div className="flex-1 min-w-[160px]">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Date <span className="text-danger">*</span>
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full px-5 py-3.5 text-lg rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
                required
              />
            </div>
          </div>
          {/* Diesel */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Diesel
            </label>
            <select
              value={formData.diesel}
              onChange={(e) =>
                setFormData({ ...formData, diesel: e.target.value })
              }
              className="w-full px-5 py-3.5 text-lg rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
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
          {/* Amount */}
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
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
              className="w-full px-5 py-3.5 text-lg rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          {/* Left | Over */}
          <div className="flex flex-wrap gap-5">
            <div className="flex-1 min-w-[140px]">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Left (ખૂટતા)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.left ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, left: e.target.value })
                }
                placeholder="0"
                className="w-full px-5 py-3.5 text-lg rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <div className="flex-1 min-w-[140px]">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Over (વધુ)
              </label>
              <input
                type="number"
                min="0"
                step="any"
                value={formData.over ?? ""}
                onChange={(e) =>
                  setFormData({ ...formData, over: e.target.value })
                }
                placeholder="0"
                className="w-full px-5 py-3.5 text-lg rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          {submitError && (
            <div className="text-danger text-base">{submitError}</div>
          )}
          <div className="flex justify-between gap-3 pt-3">
            <div className="flex gap-3">
              {viewingSale?._id && (
                <button
                  type="button"
                  onClick={handleDeleteSale}
                  disabled={deleting || submitting}
                  className="px-5 py-3 text-lg bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                >
                  {deleting ? "Deleting…" : "Delete"}
                </button>
              )}
            </div>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowSalesModal(false)}
                className="px-5 py-3 text-lg border border-[#E5E7EB] rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || deleting}
                className="px-5 py-3 text-lg bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-50"
              >
                {submitting ? "Saving…" : viewingSale ? "Update" : "Add"}
              </button>
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
}
