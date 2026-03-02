export const statCards = [
  { id: "persons", label: "Persons", icon: "Users" },
  { id: "diesel", label: "Vehicle Entries", icon: "Truck" },
  { id: "commission", label: "Commission/Labour", icon: "Briefcase" },
  { id: "sales", label: "Sales Entries", icon: "ShoppingCart" },
];

export const recentActivity = [
  {
    id: 1,
    name: "John Doe",
    date: "Feb 28, 2025",
    products: "Product A, B",
    deposit: 500,
  },
  {
    id: 2,
    name: "Jane Smith",
    date: "Feb 27, 2025",
    products: "Product C",
    deposit: 250,
  },
  {
    id: 3,
    name: "Bob Wilson",
    date: "Feb 26, 2025",
    products: "Product D, E",
    deposit: 750,
  },
];

export const formatDate = (dateStr) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
