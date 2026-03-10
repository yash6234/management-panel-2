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
        <div className="mb-4 p-4 rounded-lg bg-danger/10 text-danger text-base">
          {error}
        </div>
      )}
      <div className="flex justify-end mb-5">
        <button
          disabled={loading}
          onClick={() => {
            setFormData({ name: "", mobile: "", email: "", address: "" });
            onAdd();
          }}
          className="flex items-center gap-2 px-5 py-3 text-lg bg-primary text-white rounded-lg hover:bg-primary/90"
        >
          <Plus className="w-5 h-5" /> Add Person
        </button>
      </div>
      {loading && persons.length === 0 ? (
        <div className="py-10 text-center text-gray-500 text-lg">Loading persons...</div>
      ) : (
        <table className="w-full text-lg">
          <thead>
            <tr className="text-left text-lg text-gray-600">
              <th className="pb-4 pt-2 font-medium">Name</th>
              <th className="pb-4 pt-2 font-medium">M.no</th>
              <th className="pb-4 pt-2 font-medium">Email</th>
              <th className="pb-4 pt-2 font-medium">Address</th>
              <th className="pb-4 pt-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {persons.map((p) => (
              <tr key={p._id} className="border-t border-[#E5E7EB]">
                <td className="py-5 text-lg text-gray-900">{p.name}</td>
                <td className="py-5 text-lg text-gray-600">{p.mobile}</td>
                <td className="py-5 text-lg text-gray-600">{p.email}</td>
                <td className="py-5 text-lg text-gray-600">{truncate(p.address)}</td>
                <td className="py-5 flex gap-2">
                  <button
                    onClick={() => {
                      onView(p);
                    }}
                    className="p-2.5 text-accent hover:bg-accent/10 rounded-lg"
                    title="View"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => {
                      setFormData(p);
                      onEdit();
                    }}
                    className="p-2.5 text-primary hover:bg-primary/10 rounded-lg"
                    title="Edit"
                  >
                    <Pencil className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(p._id)}
                    className="p-2.5 text-danger hover:bg-danger/10 rounded-lg"
                    title="Delete"
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
        title={modalState === "add" ? "Add Person" : "Edit Person"}
        cardClassName="max-w-3xl"
        titleSize="text-2xl"
        contentPadding="p-8"
      >
        <form onSubmit={onSubmit} className="space-y-6 text-xl">
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-2">
              Name <span className="text-danger">*</span>
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Full name"
              className="w-full px-5 py-4 text-xl rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
              required
            />
          </div>
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-2">
              M.no
            </label>
            <input
              type="tel"
              value={formData.mobile}
              onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
              placeholder="Mobile number"
              className="w-full px-5 py-4 text-xl rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email address"
              className="w-full px-5 py-4 text-xl rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <label className="block text-xl font-medium text-gray-700 mb-2">
              Address
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Address"
              rows={3}
              className="w-full px-5 py-4 text-xl rounded-lg border border-[#E5E7EB] focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="flex justify-end gap-3 pt-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-3 text-xl border border-[#E5E7EB] rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 text-xl bg-primary text-white rounded-lg hover:bg-primary/90 disabled:opacity-70 disabled:cursor-not-allowed"
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
        cardClassName="max-w-3xl"
        titleSize="text-2xl"
        contentPadding="p-8"
      >
        {selectedItem && (
          <div className="space-y-5 text-xl">
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
