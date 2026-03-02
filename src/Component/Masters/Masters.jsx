import { useState, useEffect } from "react";
import Person from "./Person.jsx";
import Vehicle from "./Vehicle.jsx";
import Commission from "./Commission.jsx";
import { initialPersons, generateId } from "./Person";
import { initialVehicles } from "./Vehicle";
import { initialCommission } from "./Commission";
import {
  fetchSalesMen,
  addSalesMan,
  editSalesMan,
  deleteSalesMan,
} from "./salesManApi";
import {
  fetchDiesel,
  addDiesel,
  editDiesel,
  deleteDiesel,
} from "./dieselApi";

const TABS = ["Personal Details", "Vehicle", "Commission/Labour"];

export default function Masters() {
  const [activeTab, setActiveTab] = useState(0);
  const [persons, setPersons] = useState(initialPersons);
  const [vehicles, setVehicles] = useState(initialVehicles);
  const [commission, setCommission] = useState(initialCommission);
  const [personModal, setPersonModal] = useState(null);
  const [vehicleModal, setVehicleModal] = useState(null);
  const [commissionModal, setCommissionModal] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [personLoading, setPersonLoading] = useState(false);
  const [personError, setPersonError] = useState("");
  const [vehicleLoading, setVehicleLoading] = useState(false);
  const [vehicleError, setVehicleError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    mobile: "",
    email: "",
    address: "",
  });

  const baseUrl = import.meta.env.VITE_IP || "";
  const hasBackend = !!baseUrl;

  const loadPersons = async () => {
    if (!hasBackend) return;
    setPersonLoading(true);
    setPersonError("");
    try {
      const list = await fetchSalesMen();
      setPersons(list || []);
    } catch (err) {
      console.error("Fetch persons error", err);
      const msg = err?.response?.data?.message ?? err?.response?.data?.error ?? err?.response?.data?.msg ?? err?.message;
      setPersonError(msg || "Failed to fetch persons. Ensure you are logged in.");
    } finally {
      setPersonLoading(false);
    }
  };

  const loadVehicles = async () => {
    if (!hasBackend) return;
    setVehicleLoading(true);
    setVehicleError("");
    try {
      const list = await fetchDiesel();
      setVehicles(list || []);
    } catch (err) {
      console.error("Fetch vehicles error", err);
      const msg = err?.response?.data?.message ?? err?.response?.data?.error ?? err?.response?.data?.msg ?? err?.message;
      setVehicleError(msg || "Failed to fetch vehicles. Ensure you are logged in.");
    } finally {
      setVehicleLoading(false);
    }
  };

  useEffect(() => {
    loadPersons();
    loadVehicles();
  }, []);

  const handlePersonSubmit = async (e) => {
    e.preventDefault();
    if (!hasBackend) {
      setPersons((prev) =>
        personModal === "add"
          ? [
            ...prev,
            {
              _id: generateId(),
              name: formData.name,
              mobile: formData.mobile,
              email: formData.email,
              address: formData.address,
            },
          ]
          : prev.map((p) =>
            p._id === formData._id ? { ...formData } : p
          )
      );
      setPersonModal(null);
      setFormData({ name: "", mobile: "", email: "", address: "" });
      return;
    }
    setPersonLoading(true);
    setPersonError("");
    try {
      if (personModal === "add") {
        await addSalesMan({
          name: formData.name,
          mobile: formData.mobile,
          email: formData.email,
          address: formData.address,
        });
        await loadPersons();
      } else if (personModal === "edit" && formData._id) {
        await editSalesMan({
          _id: formData._id,
          name: formData.name,
          mobile: formData.mobile,
          email: formData.email,
          address: formData.address,
        });
        await loadPersons();
      }
      setPersonModal(null);
      setFormData({ name: "", mobile: "", email: "", address: "" });
    } catch (err) {
      console.error("Person save error", err);
      setPersonError(
        err?.message || err?.response?.data?.message || "Failed to save. Check backend."
      );
    } finally {
      setPersonLoading(false);
    }
  };

  const handlePersonDelete = async (id) => {
    if (!hasBackend) {
      setPersons((prev) => prev.filter((p) => p._id !== id));
      return;
    }
    setPersonLoading(true);
    setPersonError("");
    try {
      await deleteSalesMan(id);
      await loadPersons();
    } catch (err) {
      console.error("Delete person error", err);
      setPersonError(
        err?.message || err?.response?.data?.message || "Failed to delete. Check backend."
      );
    } finally {
      setPersonLoading(false);
    }
  };

  const handleVehicleSubmit = async (e) => {
    e.preventDefault();
    if (!hasBackend) {
      if (vehicleModal === "add") {
        setVehicles((prev) => [
          ...prev,
          {
            _id: generateId(),
            name: formData.name,
            amount: Number(formData.amount),
          },
        ]);
      } else if (vehicleModal === "edit" && formData._id) {
        setVehicles((prev) =>
          prev.map((v) =>
            v._id === formData._id
              ? { ...formData, amount: Number(formData.amount) }
              : v
          )
        );
      }
      setVehicleModal(null);
      setFormData({ name: "", amount: "" });
      return;
    }
    setVehicleLoading(true);
    setVehicleError("");
    try {
      if (vehicleModal === "add") {
        await addDiesel({ name: formData.name, amount: formData.amount });
        await loadVehicles();
      } else if (vehicleModal === "edit" && formData._id) {
        await editDiesel({
          _id: formData._id,
          name: formData.name,
          amount: formData.amount,
        });
        await loadVehicles();
      }
      setVehicleModal(null);
      setFormData({ name: "", amount: "" });
    } catch (err) {
      console.error("Vehicle save error", err);
      setVehicleError(
        err?.message || err?.response?.data?.message || "Failed to save. Check backend."
      );
    } finally {
      setVehicleLoading(false);
    }
  };

  const handleVehicleDelete = async (id) => {
    if (!hasBackend) {
      setVehicles((prev) => prev.filter((v) => v._id !== id));
      return;
    }
    setVehicleLoading(true);
    setVehicleError("");
    try {
      await deleteDiesel(id);
      await loadVehicles();
    } catch (err) {
      console.error("Delete vehicle error", err);
      setVehicleError(
        err?.message || err?.response?.data?.message || "Failed to delete. Check backend."
      );
    } finally {
      setVehicleLoading(false);
    }
  };

  const handleCommissionSubmit = (e) => {
    e.preventDefault();
    if (commissionModal === "add") {
      setCommission((prev) => [
        ...prev,
        {
          _id: generateId(),
          name: formData.name,
          amount: Number(formData.amount),
        },
      ]);
    } else if (commissionModal === "edit" && formData._id) {
      setCommission((prev) =>
        prev.map((c) =>
          c._id === formData._id
            ? { ...formData, amount: Number(formData.amount) }
            : c
        )
      );
    }
    setCommissionModal(null);
    setFormData({ name: "", amount: "" });
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-semibold text-gray-900">Masters</h2>
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
            <Person
              persons={persons}
              formData={formData}
              modalState={personModal}
              selectedItem={selectedItem}
              loading={personLoading}
              error={personError}
              onAdd={() => setPersonModal("add")}
              onEdit={() => setPersonModal("edit")}
              onDelete={handlePersonDelete}
              onView={(p) => {
                setSelectedItem(p);
                setPersonModal("view");
              }}
              onSubmit={handlePersonSubmit}
              onClose={() => {
                setPersonModal(null);
                setPersonError("");
              }}
              setFormData={setFormData}
            />
          )}
          {activeTab === 1 && (
            <Vehicle
              vehicles={vehicles}
              formData={formData}
              modalState={vehicleModal}
              loading={vehicleLoading}
              error={vehicleError}
              onAdd={() => setVehicleModal("add")}
              onEdit={() => setVehicleModal("edit")}
              onDelete={handleVehicleDelete}
              onSubmit={handleVehicleSubmit}
              onClose={() => {
                setVehicleModal(null);
                setVehicleError("");
              }}
              setFormData={setFormData}
            />
          )}
          {activeTab === 2 && (
            <Commission
              commission={commission}
              formData={formData}
              modalState={commissionModal}
              onAdd={() => setCommissionModal("add")}
              onEdit={() => setCommissionModal("edit")}
              onDelete={(id) =>
                setCommission((prev) => prev.filter((c) => c._id !== id))
              }
              onSubmit={handleCommissionSubmit}
              onClose={() => setCommissionModal(null)}
              setFormData={setFormData}
            />
          )}
        </div>
      </div>
    </div>
  );
}
