import { Pencil, Trash2, Plus } from "lucide-react";
import Modal from "../Layout/Modal";

export default function Vehicle({
  vehicles,
  formData,
  modalState,
  loading,
  error,
  onAdd,
  onEdit,
  onDelete,
  onSubmit,
  onClose,
  setFormData,
}) {
  return (
    <>
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-danger/10 text-danger text-sm">
          {error}
        </div>
      )}
      <div className="flex justify-end mb-4">
        <button
          disabled={loading}
          onClick={() => {
            setFormData({ name: "", amount: "" });
            onAdd();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Plus className="w-4 h-4" /> Add
        </button>
      </div>
      {loading && vehicles.length === 0 ? (
        <div className="py-8 text-center text-gray-500">Loading vehicles...</div>
      ) : (
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-gray-600">
            <th className="pb-2 font-medium">Name</th>
            <th className="pb-2 font-medium">Amount</th>
            <th className="pb-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {vehicles.map((v) => (
            <tr key={v._id} className="border-t border-[#E5E7EB]">
              <td className="py-3 text-gray-900">{v.name}</td>
              <td className="py-3 text-gray-600">{v.amount}</td>
              <td className="py-3 flex gap-2">
                <button
                  onClick={() => {
                    setFormData(v);
                    onEdit();
                  }}
                  className="p-2 text-primary hover:bg-primary/10 rounded"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(v._id)}
                  className="p-2 text-danger hover:bg-danger/10 rounded"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      )}

      <Modal
        isOpen={modalState === "add" || modalState === "edit"}
        onClose={onClose}
        title={modalState === "add" ? "Add Vehicle" : "Edit Vehicle"}
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Name"
              className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
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
              className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-[#E5E7EB] rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
