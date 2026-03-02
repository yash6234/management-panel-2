import axios from "axios";
import Cookie from "js-cookie";
import { encryptData, decryptData } from "../../api/enc_dec_admin";

const baseUrl = `${import.meta.env.VITE_IP}/master/details`;

const createPayload = (additionalData = {}) => {
  const token = Cookie.get("data");
  return encodeURIComponent(encryptData({ data: token, ...additionalData }));
};


export const fetchCommissions = async () => {
  const response = await axios.get(
    `${baseUrl}/fetch/${createPayload({})}`
  );
  const data = decryptData(response.data.data);
  console.log(data);
 return data.map((item) => ({
    _id: item._id,
    name: item.field,   // 👈 table "Name"
    amount: item.value // 👈 table "Amount"
  }));
};        

export const editCommission = async (payload) => {
 
  const response = await axios.get(
    `${baseUrl}/edit/${createPayload({ _id, value })}`
  );
  const result = decryptData(response.data.data);
  return result;
};

