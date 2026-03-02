import axios from "axios";
import Cookie from "js-cookie";
import { encryptData, decryptData } from "../../api/enc_dec_admin";

const baseUrl = import.meta.env.VITE_IP || "";
const baseUrlWithProtocol = baseUrl.startsWith("http") ? baseUrl : `http://${baseUrl}`;

const createPayload = (additionalData = {}) => {
  const token = Cookie.get("data");
  return encodeURIComponent(encryptData({ data: token, ...additionalData }));
};

/**
 * GET /fetch-sales-man/:data
 * Returns list of sales men for the Sales page.
 */
export const fetchSalesMan = async () => {
  const response = await axios.get(
    `${baseUrlWithProtocol}/fetch-sales-man/${createPayload()}`
  );
  let data = null;
  try {
    if (response?.data?.data) data = decryptData(response.data.data);
  } catch {}
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object")
    return data.list ?? data.data ?? data.items ?? [];
  return [];
};

/**
 * GET /sales-man/fetch-sales/:data
 * @param {string} salesman_id
 */
export const fetchSales = async (salesman_id) => {
  const response = await axios.get(
    `${baseUrlWithProtocol}/sales-man/fetch-sales/${createPayload({ salesman_id })}`
  );
  let data = null;
  try {
    if (response?.data?.data) data = decryptData(response.data.data);
  } catch {}
  if (Array.isArray(data)) return data;
  if (data && typeof data === "object")
    return data.list ?? data.data ?? data.items ?? [];
  return [];
};

/**
 * GET /sales-man/add-month/:data
 * @param {{ sales_man: string, month: number, year: number }}
 */
export const addMonth = async ({ sales_man, month, year }) => {
  const response = await axios.get(
    `${baseUrlWithProtocol}/sales-man/add-month/${createPayload({
      sales_man,
      month: Number(month),
      year: Number(year),
    })}`
  );
  try {
    if (response?.data?.data) return decryptData(response.data.data);
  } catch {}
  return response.data;
};

/**
 * GET /sales-man/add-sales/:data
 * @param {{ date: string, sales_man: string, diesel: string|number, amount: number, left?: number, over?: number }}
 */
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
    `${baseUrlWithProtocol}/sales-man/add-sales/${createPayload({
      date,
      sales_man,
      diesel: diesel ?? "",
      amount: Number(amount),
      left: Number(left),
      over: Number(over),
    })}`
  );
  try {
    if (response?.data?.data) return decryptData(response.data.data);
  } catch {}
  return response.data;
};
