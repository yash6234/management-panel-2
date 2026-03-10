

export const truncate = (str, len = 30) => {
  if (!str) return "—";
  return str.length > len ? str.slice(0, len) + "…" : str;
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
};
