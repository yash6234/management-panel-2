import { Pencil, Trash2, Plus } from "lucide-react";
import Modal from "../Layout/Modal";
import { useState, useEffect } from "react";
import { fetchCommissions } from "./Commission";

function Commission({

  formData,
  modalState,
  onAdd,
  onEdit,
  onDelete,
  onSubmit,
  onClose,
  setFormData,
}) {
  const [commission, setCommission] = useState([]);

  useEffect(() => {
    const loadCommissions = async () => {
      try {
        const data = await fetchCommissions();
        setCommission(data);
      } catch {
        setCommission([]);
      }
    };
    loadCommissions();
  }, []);
  return (
    <>
      <div className="flex justify-end mb-5">
        <button
          onClick={() => {
            setFormData({ name: "", amount: "" });
            onAdd();
          }}
          className="flex items-center gap-2 px-5 py-3 text-lg bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Plus className="w-5 h-5" /> Add
        </button>
      </div>
      <table className="w-full text-base">
        <thead>
          <tr className="text-left text-base text-gray-600">
            <th className="pb-3 pt-1 font-medium">Name</th>
            <th className="pb-3 pt-1 font-medium">Amount</th>
            <th className="pb-3 pt-1 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {commission.map((c) => (
            <tr key={c._id} className="border-t border-[#E5E7EB]">
              <td className="py-4 text-gray-900">{c.name}</td>
              <td className="py-4 text-gray-600">{c.amount}</td>
              <td className="py-4 flex gap-2">
                <button
                  onClick={() => {
                    setFormData(c);
                    onEdit();
                  }}
                  className="p-2.5 text-primary hover:bg-primary/10 rounded-lg"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => onDelete(c._id)}
                  className="p-2.5 text-danger hover:bg-danger/10 rounded-lg"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <Modal
        isOpen={modalState === "add" || modalState === "edit"}
        onClose={onClose}
        title={
          modalState === "add"
            ? "Add Commission/Labour"
            : "Edit Commission/Labour"
        }
        cardClassName="max-w-2xl"
        titleSize="text-xl"
        contentPadding="p-6"
      >
        <form onSubmit={onSubmit} className="space-y-5 text-lg">
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Name"
              className="w-full px-5 py-3.5 text-lg rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <div>
            <label className="block text-lg font-medium text-gray-700 mb-2">
              Amount <span className="text-danger">*</span>
            </label>
            <input
              type="number"
              min={0}
              step={0.01}
              value={formData.amount}
              onChange={(e) =>
                setFormData({ ...formData, amount: e.target.value })
              }
              placeholder="Amount"
              className="w-full px-5 py-3.5 text-lg rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 text-lg border border-[#E5E7EB] rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-3 text-lg bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              Save
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
export default Commission;