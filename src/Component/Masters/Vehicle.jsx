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
        <div className="mb-4 p-4 rounded-lg bg-danger/10 text-danger text-base">
          {error}
        </div>
      )}
      <div className="flex justify-end mb-5">
        <button
          disabled={loading}
          onClick={() => {
            setFormData({ name: "", amount: "" });
            onAdd();
          }}
          className="flex items-center gap-2 px-5 py-3 text-lg bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <Plus className="w-5 h-5" /> Add
        </button>
      </div>
      {loading && vehicles.length === 0 ? (
        <div className="py-10 text-center text-gray-500 text-lg">Loading vehicles...</div>
      ) : (
        <table className="w-full text-base">
          <thead>
            <tr className="text-left text-base text-gray-600">
              <th className="pb-3 pt-1 font-medium">Name</th>
              <th className="pb-3 pt-1 font-medium">Amount</th>
              <th className="pb-3 pt-1 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v._id} className="border-t border-[#E5E7EB]">
                <td className="py-4 text-gray-900">{v.name}</td>
                <td className="py-4 text-gray-600">{v.amount}</td>
                <td className="py-4 flex gap-2">
                  <button
                    onClick={() => {
                      setFormData(v);
                      onEdit();
                    }}
                    className="p-2.5 text-primary hover:bg-primary/10 rounded-lg"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(v._id)}
                    className="p-2.5 text-danger hover:bg-danger/10 rounded-lg"
                  >
                    <Trash2 className="w-5 h-5" />
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
              disabled={loading}
              className="px-5 py-3 text-lg bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? "Saving..." : "Save"}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}
