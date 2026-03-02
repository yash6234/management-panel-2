export const initialPersons = [
  {
    _id: "1",
    name: "John Doe",
    mobile: "1234567890",
    email: "john@example.com",
    address: "123 Main St, City, Country",
  },
  {
    _id: "2",
    name: "Jane Smith",
    mobile: "9876543210",
    email: "jane@example.com",
    address: "456 Oak Ave",
  },
];

export const truncate = (str, len = 30) => {
  if (!str) return "—";
  return str.length > len ? str.slice(0, len) + "…" : str;
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
};
