export default function DetailCard({ title, fields, className = "" }) {
  return (
    <div
      className={`bg-card rounded-xl border border-[#E5E7EB] p-4 shadow-sm hover:shadow-md transition-shadow h-[200px] flex flex-col ${className}`}
    >
      <h3 className="font-semibold text-gray-900 mb-3 truncate">{title}</h3>
      <div className="flex-1 space-y-1 text-sm text-gray-600 overflow-y-auto">
        {fields.map(({ label, value }) => (
          <p key={label} className="truncate">
            <span className="font-medium text-gray-500">{label}:</span>{" "}
            {value || "—"}
          </p>
        ))}
      </div>
    </div>
  );
}
