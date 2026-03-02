import { useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import Modal from "../Layout/Modal";
import { mockPersons, initialSales } from "./Sales";

export default function Sales() {
  const [selectedPerson, setSelectedPerson] = useState("All persons");
  const [showSalesModal, setShowSalesModal] = useState(false);
  const [salesEntries, setSalesEntries] = useState(initialSales);
  const [formData, setFormData] = useState({
    person: "",
    date: "",
    salesOfProducts: "",
    deposit: "",
    credit: "",
    location: "",
  });

  const calendarEvents = salesEntries
    .filter(
      (s) => selectedPerson === "All persons" || s.person === selectedPerson
    )
    .map((s) => ({
      id: s.id,
      title: `${s.products} - ₹${s.deposit}`,
      date: s.date,
    }));

  const handleDateClick = (info) => {
    setFormData({
      person: "",
      date: info.dateStr,
      salesOfProducts: "",
      deposit: "",
      credit: "",
      location: "",
    });
    setShowSalesModal(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEntry = {
      id: Date.now().toString(),
      date: formData.date,
      person: formData.person,
      products: formData.salesOfProducts,
      deposit: formData.deposit,
      credit: formData.credit,
      location: formData.location,
    };
    setSalesEntries((prev) => [...prev, newEntry]);
    setShowSalesModal(false);
  };

  return (
    <div className="space-y-6 h-[calc(100vh-12rem)] flex flex-col">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold text-gray-900">Sales</h2>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Person
          </label>
          <select
            value={selectedPerson}
            onChange={(e) => setSelectedPerson(e.target.value)}
            className="px-4 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30 focus:border-primary min-w-[200px]"
          >
            <option value="All persons">All persons</option>
            {mockPersons.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
      </div>
      <div className="flex-1 min-h-0 bg-card rounded-xl border border-[#E5E7EB] overflow-hidden p-4">
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
              Person
            </label>
            <select
              value={formData.person}
              onChange={(e) =>
                setFormData({ ...formData, person: e.target.value })
              }
              className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Select person (optional)</option>
              {mockPersons.map((p) => (
                <option key={p} value={p}>
                  {p}
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
              Sales of Products <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={formData.salesOfProducts}
              onChange={(e) =>
                setFormData({ ...formData, salesOfProducts: e.target.value })
              }
              placeholder="Sales of products"
              className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Deposit <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={formData.deposit}
              onChange={(e) =>
                setFormData({ ...formData, deposit: e.target.value })
              }
              placeholder="Deposit"
              className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Credit
            </label>
            <input
              type="text"
              value={formData.credit}
              onChange={(e) =>
                setFormData({ ...formData, credit: e.target.value })
              }
              placeholder="Credit"
              className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              placeholder="Location"
              className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
            />
          </div>
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
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Add
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
