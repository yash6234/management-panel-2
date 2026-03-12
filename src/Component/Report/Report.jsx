import { useState, useMemo, useEffect } from "react";
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

const ENTRIES_PER_PAGE = 40;

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function formatDate(val) {
  if (!val) return "—";

  const d = new Date(val);

  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
}

export default function Report({
  salesEntries = [],
  totals = {},
  selectedSalesman,
  monthYear,
  getDieselLabel = () => "—",
}) {

  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(
    1,
    Math.ceil(salesEntries.length / ENTRIES_PER_PAGE)
  );

  const paginatedEntries = useMemo(() => {
    const start = (currentPage - 1) * ENTRIES_PER_PAGE;
    return salesEntries.slice(start, start + ENTRIES_PER_PAGE);
  }, [salesEntries, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [salesEntries.length]);

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

  const totalDiesel = salesEntries.reduce(
    (sum, s) => sum + Number(s.diesel_amount ?? 0),
    0
  );

  const payableAmount = totals.finalPayable ?? 0;

  const salesmanName =
    selectedSalesman?.name ??
    selectedSalesman?.email ??
    "Sales person";

  const monthLabel = monthYear?.month
    ? `${MONTHS[monthYear.month - 1]} ${monthYear?.year ?? ""}`
    : "";

  const chunkArray = (array, size) => {
    const result = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  };

  const handleDownloadPDF = () => {

    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4"
    });

    const margin = 12;
    const pageHeight = doc.internal.pageSize.getHeight();

    const headers = [["Date", "Sale", "Left", "Over", "Diesel"]];

    const rows = [...salesEntries]
      .sort((a, b) => {
        const dateA = new Date(
          a.date ?? a.sale_date ?? a.startDate ?? a.createdAt ?? a.day
        );
        const dateB = new Date(
          b.date ?? b.sale_date ?? b.startDate ?? b.createdAt ?? b.day
        );
        return dateA - dateB;
      })
      .map((s) => {

        const dieselName = getDieselLabel(
          s.diesel ?? s.dieselType
        );

        const dieselAmount = s.diesel_amount ?? 0;

        return [
          formatDate(
            s.date ??
            s.sale_date ??
            s.startDate ??
            s.createdAt ??
            s.day
          ),

          Number(s.amount ?? s.deposit ?? 0)
            .toLocaleString("en-IN"),

          Number(s.left ?? 0)
            .toLocaleString("en-IN"),

          Number(s.over ?? 0)
            .toLocaleString("en-IN"),

          `${dieselName}-${dieselAmount}`,
        ];
      });

    const rowChunks = chunkArray(rows, ENTRIES_PER_PAGE);

    rowChunks.forEach((chunk, index) => {

      if (index !== 0) doc.addPage();

      if (index === 0) {

        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");

        doc.text("Sales Report", margin, 10);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");

        doc.text(
          `${salesmanName}${monthLabel ? ` — ${monthLabel}` : ""}`,
          margin,
          16
        );
      }

      autoTable(doc, {

        startY: 20,

        head: headers,

        body: chunk,

        theme: "grid",

        styles: {
          fontSize: 8,
          cellPadding: 1.5,
          minCellHeight: 6.5,
          overflow: "hidden",
          valign: "middle"
        },

        headStyles: {
          fillColor: [41, 98, 255],
          textColor: 255,
          fontStyle: "bold",
          halign: "center",
          fontSize: 8,
          minCellHeight: 7
        },

        columnStyles: {
          0: { halign: "center", cellWidth: 32 },
          1: { halign: "center", cellWidth: 32 },
          2: { halign: "center", cellWidth: 28 },
          3: { halign: "center", cellWidth: 28 },
          4: { halign: "center", cellWidth: 42 }
        },

        margin: { left: margin, right: margin }

      });

    });

    const summaryLineHeight = 5;

    let finalY = doc.lastAutoTable
      ? doc.lastAutoTable.finalY + 10
      : 30;

    const summaryHeight = summaryLineHeight * 5;

    if (finalY + summaryHeight > pageHeight - 10) {
      doc.addPage();
      finalY = 20;
    }

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");

    doc.text(
      `Total Sale : Rs. ${totalSale.toLocaleString("en-IN")}`,
      margin,
      finalY
    );

    doc.text(
      `Total Left : ${totalLeft.toLocaleString("en-IN")}`,
      margin,
      finalY + summaryLineHeight
    );

    doc.text(
      `Total Over : ${totalOver.toLocaleString("en-IN")}`,
      margin,
      finalY + summaryLineHeight * 2
    );

    doc.text(
      `Total Diesel : Rs. ${totalDiesel.toLocaleString("en-IN")}`,
      margin,
      finalY + summaryLineHeight * 3
    );

    doc.text(
      `Payable Amount : Rs. ${payableAmount.toLocaleString("en-IN")}`,
      margin,
      finalY + summaryLineHeight * 4
    );

    doc.save(
      `sales-report-${salesmanName.replace(/\s+/g, "-")}.pdf`
    );
  };

  return (
    <div className="space-y-4">

      <div className="flex flex-wrap items-center justify-between gap-2">

        <h3 className="text-base font-semibold text-gray-900">
          Report — {salesmanName}
          {monthLabel && (
            <span className="font-normal text-gray-600">
              ({monthLabel})
            </span>
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

              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Date
              </th>

              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Sale
              </th>

              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Left
              </th>

              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Over
              </th>

              <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                Diesel
              </th>

            </tr>

          </thead>

          <tbody>

            {paginatedEntries.map((s, i) => (

              <tr
                key={s._id ?? s.id ?? i}
                className="border-b border-[#E5E7EB]"
              >

                <td className="px-4 py-3 text-gray-900">
                  {formatDate(
                    s.date ??
                    s.sale_date ??
                    s.startDate ??
                    s.createdAt ??
                    s.day
                  )}
                </td>

                <td className="px-4 py-3 text-gray-600">
                  {s.amount != null
                    ? s.amount
                    : s.deposit ?? "—"}
                </td>

                <td className="px-4 py-3 text-gray-600">
                  {s.left ?? "—"}
                </td>

                <td className="px-4 py-3 text-gray-600">
                  {s.over ?? "—"}
                </td>

                <td className="px-4 py-3 text-gray-600">
                  {getDieselLabel(
                    s.diesel ?? s.dieselType
                  ) || "—"}
                </td>

              </tr>

            ))}

          </tbody>

        </table>

        {salesEntries.length === 0 && (

          <p className="text-gray-500 text-sm py-8 text-center">
            No sales data for this period.
          </p>

        )}

      </div>

    </div>
  );
}