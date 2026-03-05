import axios from "axios";
import Cookie from "js-cookie";
import { encryptData, decryptData } from "../../api/enc_dec_admin";

/**
 * Sales page API routes (GET, payload in path :data as encrypted + encoded):
 *   /fetch-sales-man/:data
 *   /sales-man/fetch-sales/:data  { salesman_id }
 *   /sales-man/add-month/:data   { sales_man, month, year }
 *   /sales-man/add-sales/:data  { date, sales_man, diesel, amount, left = 0, over = 0 }
 */
const baseUrl = `${import.meta.env.VITE_IP}/admin/sales/sales-man`;
const baseUrl1 = `${import.meta.env.VITE_IP}/admin/sales`;


const createPayload = (additionalData = {}) => {
  const token = Cookie.get("data");
  return encodeURIComponent(encryptData({ data: token, ...additionalData }));
};

/** GET /fetch-sales-man/:data */
export const fetchSalesMan = async () => {
  const response = await axios.get(
    `${baseUrl1}/fetch-sales-man/${createPayload()}`
  );
  console.log(response.data.data);
  return decryptData(response.data.data) ?? [];
};

/** GET /sales-man/fetch-sales/:data  Payload: { salesman_id } */
export const fetchSales = async (salesman_id) => {
  const response = await axios.get(
    `${baseUrl}/fetch-sales/${createPayload({ salesman_id })}`
  );
  const raw = response.data.data;
  return decryptData(raw) ?? [];
};

/** GET /sales-man/add-month/:data  Payload: { sales_man, month, year } */
export const addMonth = async ({ sales_man, month, year }) => {
  const response = await axios.get(
    `${baseUrl}/add-month/${createPayload({
      sales_man,
      month:Number(month),
      year:Number(year),
    })}`
  );
  if (response.status < 200 || response.status >= 300) return null;
  const raw = response?.data?.data;
  if (raw != null && typeof raw === "string") {
    try {
      return decryptData(raw);
    } catch {}
  }
  return response?.data ?? null;
};

/** GET /sales-man/add-sales/:data  Payload: { date, sales_man, diesel, amount, left = 0, over = 0 } */
export const addSales = async (payload) => {
  const {
    date,
    sales_man,
    diesel,
    amount,
    left = 0,
    over = 0,
  } = payload;
  const response = await axios.get(
    `${baseUrl}/add-sales/${createPayload({
      date,
      sales_man,
      diesel: diesel ?? "",
      amount: Number(amount),
      left: Number(left),
      over: Number(over),
    })}`
  );
  const raw = response?.data?.data;
  if (raw != null && typeof raw === "string") {
    try {
      return decryptData(raw);
    } catch {
      // Backend may return plain JSON; use as-is
    }
  }
  return response?.data.data ?? null;
};
