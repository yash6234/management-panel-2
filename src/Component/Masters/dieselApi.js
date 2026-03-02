import axios from "axios";
import Cookie from "js-cookie";
import { encryptData, decryptData } from "../../api/enc_dec_admin.js";

const baseUrl = `${import.meta.env.VITE_IP || ""}/master/diesel`;

const createPayload = (additionalData = {}) => {
  const token = Cookie.get("data");
  return encodeURIComponent(encryptData({ data: token, ...additionalData }));
};

export const addDiesel = async (payload) => {
  const { name, amount } = payload;
  const response = await axios.get(
    `${baseUrl}/add/${createPayload({ name, amount: Number(amount) })}`
  );
  const result = decryptData(response.data.data);
  return result;
};

export const editDiesel = async (payload) => {
  const { _id, name, amount } = payload;
  const response = await axios.get(
    `${baseUrl}/edit/${createPayload({ _id, name, amount: Number(amount) })}`
  );
  return decryptData(response.data.data);
};

export const fetchDiesel = async () => {
  const response = await axios.get(`${baseUrl}/fetch/${createPayload({})}`);
  const data = decryptData(response.data.data);
  let list = [];
  if (Array.isArray(data)) {
    list = data;
  } else if (data && typeof data === "object") {
    list = data.list ?? data.data ?? data.items ?? [];
  }
  return list || [];
};

export const deleteDiesel = async (id) => {
  const response = await axios.get(
    `${baseUrl}/delete/${createPayload({ _id: id })}`
    
  );
 
console.log("response",response.data.data);

 if (!response.data || !response.data.data) {
    return true;
  }

  try {
    return decryptData(response.data.data);
  } catch {
    return true;
  }
};
