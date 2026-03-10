export const statCards = [
  { id: "persons", label: "Persons", icon: "Users" },
  { id: "diesel", label: "Vehicle Entries", icon: "Truck" },
  { id: "commission", label: "Commission/Labour", icon: "Briefcase" },
  { id: "sales", label: "Sales Entries", icon: "ShoppingCart" },
];

export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
