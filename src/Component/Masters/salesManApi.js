import axios from "axios";
import Cookie from "js-cookie";
import { encryptData, decryptData } from "../../api/enc_dec_admin";

const baseUrl = `${import.meta.env.VITE_IP}/master/sales-man`;

const createPayload = (additionalData = {}) => {
  const token = Cookie.get("data");
  return encodeURIComponent(encryptData({ data: token, ...additionalData }));
};

const toApiPayload = (item) => ({
  ...item,
  mobile_no: item.mobile ?? item.mobile_no,
});

const fromApiPayload = (item) => ({
  ...item,
  mobile: item.mobile_no ?? item.mobile,
});

export const addSalesMan = async (payload) => {
  const apiPayload = toApiPayload(payload);
  const { name, mobile_no, email, address } = apiPayload;
  const response = await axios.get(
    `${baseUrl}/add/${createPayload({ name, mobile_no, email, address })}`
  );

  

  const result = decryptData(response.data.data);

  return fromApiPayload(result);
};

export const editSalesMan = async (payload) => {
  const apiPayload = toApiPayload(payload);
  const { _id, name, mobile_no, email, address } = apiPayload;
  const response = await axios.get(
    `${baseUrl}/edit/${createPayload({ _id, name, mobile_no, email, address })}`
  );
  const result = decryptData(response.data.data);
  return fromApiPayload(result);
};  

export const fetchSalesMen = async () => {
  const response = await axios.get(`${baseUrl}/fetch/${createPayload()}`);
  
  const data = decryptData(response.data.data);
  let list = [];
  if (Array.isArray(data)) {
    list = data;
  } else if (data && typeof data === "object") {
    list = data.list ?? data.data ?? data.items ?? [];
  }
  return (list || []).map(fromApiPayload);
};

export const deleteSalesMan = async (id) => {
  
  const response = await axios.get(
    `${baseUrl}/delete/${createPayload({ _id: id })}`
  );
 if (!response.data || !response.data.data) {
    return true;
  }

  // Only decrypt if encrypted data exists
  try {
    return decryptData(response.data.data);
  } catch {
    return true;
  }
};
