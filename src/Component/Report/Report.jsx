import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDate(val) {
  if (!val) return "—";
  if (typeof val === "string") return val.split("T")[0] || val;
  if (typeof val === "number" && !isNaN(val)) return new Date(val).toLocaleDateString();
  return String(val).slice(0, 10) || "—";
}

export default function Report({
  salesEntries = [],
  totals = {},
  selectedSalesman,
  monthYear,
  dieselOptions = [],
  getDieselLabel = () => "—",
}) {
  const totalSale = salesEntries.reduce(
    (sum, s) => sum + Number(s.amount ?? s.deposit ?? 0),
    0
  );
  const totalLeft = salesEntries.reduce(
    (sum, s) => sum + Number(s.left ?? 0),
    0
  );
  const totalOver = salesEntries.reduce(
    (sum, s) => sum + Number(s.over ?? 0),
    0
  );
  const payableAmount = totals.finalPayable ?? 0;

  const salesmanName =
    selectedSalesman?.name ?? selectedSalesman?.email ?? "Sales person";
  const monthLabel = monthYear?.month
    ? `${MONTHS[monthYear.month - 1]} ${monthYear?.year ?? ""}`
    : "";

  const handleDownloadPDF = () => {
    const doc = new jsPDF({ orientation: "landscape", unit: "mm" });
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 14;

    const totalSaleStr = totalSale.toLocaleString("en-IN");
    const totalSaleFormatted = `Rs. ${totalSaleStr}`;
    const payableStr = Number(payableAmount).toLocaleString("en-IN");

    const headers = [["Date", "Sale", "Left", "Over", "Diesel"]];
    const rows = salesEntries.map((s) => [
      formatDate(s.date ?? s.sale_date ?? s.startDate ?? s.createdAt ?? s.day),
      String(s.amount ?? s.deposit ?? "—"),
      String(s.left ?? "—"),
      String(s.over ?? "—"),
      getDieselLabel(s.diesel ?? s.dieselType) || "—",
    ]);

    const footRows = [
      ["Total Sale", totalSaleFormatted, "", "", ""],
      ["Total Left", String(totalLeft.toLocaleString("en-IN")), "", "", ""],
      ["Total Over", String(totalOver.toLocaleString("en-IN")), "", "", ""],
      ["Payable Amount", `Rs. ${payableStr}`, "", "", ""],
    ];

    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text("Sales Report", margin, 12);

    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.text(`${salesmanName}${monthLabel ? ` — ${monthLabel}` : ""}`, margin, 18);

    autoTable(doc, {
      startY: 24,
      head: headers,
      body: rows,
      theme: "striped",
      headStyles: {
        fillColor: [41, 98, 255],
        textColor: 255,
        fontStyle: "bold",
        fontSize: 10,
        cellPadding: 4,
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 28 },
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right" },
        4: { cellWidth: "auto" },
      },
      margin: { left: margin, right: margin },
    });
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");

    doc.text(`Total Sale : Rs. ${totalSaleStr}`, margin, finalY);
    doc.text(`Total Left : ${totalLeft.toLocaleString("en-IN")}`, margin, finalY + 7);
    doc.text(`Total Over : ${totalOver.toLocaleString("en-IN")}`, margin, finalY + 14);
    doc.text(`Payable Amount : Rs. ${payableStr}`, margin, finalY + 21);

    doc.save(`sales-report-${salesmanName.replace(/\s+/g, "-")}-${monthLabel.replace(/\s+/g, "-") || "report"}.pdf`);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-base font-semibold text-gray-900">
          Sales Report — {salesmanName}
          {monthLabel && (
            <span className="font-normal text-gray-600"> ({monthLabel})</span>
          )}
        </h3>
        <button
          type="button"
          onClick={handleDownloadPDF}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 text-sm"
        >
          Download PDF
        </button>
      </div>

      <div className="overflow-x-auto border border-[#E5E7EB] rounded-lg">
        <table className="w-full min-w-[500px] border-collapse">
          <thead>
            <tr className="border-b border-[#E5E7EB] bg-gray-50/80">
              <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Date</th>
              <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Sale</th>
              <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Left</th>
              <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Over</th>
              <th className="text-left text-sm font-medium text-gray-700 px-4 py-3">Diesel</th>
            </tr>
          </thead>
          <tbody>
            {salesEntries.map((s, i) => (
              <tr key={s._id ?? s.id ?? i} className="border-b border-[#E5E7EB]">
                <td className="px-4 py-3 text-gray-900">
                  {formatDate(s.date ?? s.sale_date ?? s.startDate ?? s.createdAt ?? s.day)}
                </td>
                <td className="px-4 py-3 text-gray-600">
                  {s.amount != null ? s.amount : s.deposit ?? "—"}
                </td>
                <td className="px-4 py-3 text-gray-600">{s.left ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">{s.over ?? "—"}</td>
                <td className="px-4 py-3 text-gray-600">
                  {getDieselLabel(s.diesel ?? s.dieselType) || "—"}
                </td>
              </tr>
            ))}
          </tbody>


        </table>
        {salesEntries.length === 0 && (
          <p className="text-gray-500 text-sm py-8 text-center">No sales data for this period.</p>
        )}
      </div>
    </div >
  );
}
