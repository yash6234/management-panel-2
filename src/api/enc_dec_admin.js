import CryptoJS from "crypto-js";

const encryptData = (data) => {
  return CryptoJS.AES.encrypt(
    JSON.stringify(data),
    import.meta.env.VITE_ENCRYPTION_SECRET
  ).toString();
};

const decryptData = (encryptedData) => {
  const bytes = CryptoJS.AES.decrypt(
    encryptedData,
    import.meta.env.VITE_ENCRYPTION_SECRET
  );
  return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
};

export { encryptData, decryptData };
