import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import Modal from "../Layout/Modal";
import { truncate } from "./Person";

export default function Person({
  persons,
  formData,
  modalState,
  selectedItem,
  loading,
  error,
  onAdd,
  onEdit,
  onDelete,
  onView,
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
            setFormData({ name: "", mobile: "", email: "", address: "" });
            onAdd();
          }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Plus className="w-4 h-4" /> Add Person
        </button>
      </div>
      {loading && persons.length === 0 ? (
        <div className="py-8 text-center text-gray-500">Loading persons...</div>
      ) : (
      <table className="w-full">
        <thead>
          <tr className="text-left text-sm text-gray-600">
            <th className="pb-2 font-medium">Name</th>
            <th className="pb-2 font-medium">M.no</th>
            <th className="pb-2 font-medium">Email</th>
            <th className="pb-2 font-medium">Address</th>
            <th className="pb-2 font-medium">Actions</th>
          </tr>
        </thead>
        <tbody>
          {persons.map((p) => (
            <tr key={p._id} className="border-t border-[#E5E7EB]">
              <td className="py-3 text-gray-900">{p.name}</td>
              <td className="py-3 text-gray-600">{p.mobile}</td>
              <td className="py-3 text-gray-600">{p.email}</td>
              <td className="py-3 text-gray-600">{truncate(p.address)}</td>
              <td className="py-3 flex gap-2">
                <button
                  onClick={() => {
                    onView(p);
                  }}
                  className="p-2 text-accent hover:bg-accent/10 rounded"
                  title="View"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setFormData(p);
                    onEdit();
                  }}
                  className="p-2 text-primary hover:bg-primary/10 rounded"
                  title="Edit"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDelete(p._id)}
                  className="p-2 text-danger hover:bg-danger/10 rounded"
                  title="Delete"
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
        title={modalState === "add" ? "Add Person" : "Edit Person"}
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
              placeholder="Full name"
              className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              M.no
            </label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              placeholder="Mobile number"
              className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email address"
              className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Address"
              rows={3}
              className="w-full px-4 py-2 rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
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

      <Modal
        isOpen={modalState === "view"}
        onClose={onClose}
        title="Person Details"
      >
        {selectedItem && (
          <div className="space-y-3 text-sm">
            <p>
              <span className="font-medium text-gray-600">Name:</span>{" "}
              {selectedItem.name}
            </p>
            <p>
              <span className="font-medium text-gray-600">M.no:</span>{" "}
              {selectedItem.mobile || "—"}
            </p>
            <p>
              <span className="font-medium text-gray-600">Email:</span>{" "}
              {selectedItem.email || "—"}
            </p>
            <p>
              <span className="font-medium text-gray-600">Address:</span>{" "}
              {selectedItem.address || "—"}
            </p>
          </div>
        )}
      </Modal>
    </>
  );
}
