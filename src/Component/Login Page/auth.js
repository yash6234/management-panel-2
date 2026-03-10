import axios from 'axios';
import Cookie from 'js-cookie';
import { encryptData, decryptData } from '../../api/enc_dec_admin.js';

const TOKEN_KEY = 'data';

/**
 * Returns the decrypted auth payload if valid (has token, id, user).
 * Returns null if missing, invalid, or decryption fails.
 */
export const getValidAuthUser = () => {
  try {
    const stored = Cookie.get(TOKEN_KEY) || localStorage.getItem('token');
    if (!stored) return null;
    const decrypted = decryptData(stored);
    if (!decrypted || typeof decrypted !== 'object') return null;
    if (!decrypted.token || !decrypted.id || !decrypted.user) return null;
    return decrypted;
  } catch {
    return null;
  }
};

export const getToken = () => Cookie.get(TOKEN_KEY);
export const setToken = (token) => {
  if (token) Cookie.set(TOKEN_KEY, token);
  else Cookie.remove(TOKEN_KEY);
};

const getBaseUrl = () => {
  const ip = import.meta.env.VITE_IP || '';
  return ip.startsWith('http') ? ip : `http://${ip}`;
};

const createPayload = (additionalData = {}) => {
  const cookieData = Cookie.get("data");

  return encodeURIComponent(encryptData({ data: cookieData, ...additionalData }));
};

/** GET /admin/auth/login/:data – :data is the encrypted payload (email, password, etc.) */
export const login = async (data) => {
  try {
    const baseUrl = getBaseUrl();
    const encodedData = createPayload(data);

    const response = await axios.get(
      `${baseUrl}/admin/auth/login/${encodedData}`
    );

    const encryptedPayload = response.data?.data;

    if (!encryptedPayload) {
      return { success: false, msg: 'Invalid server response' };
    }
    const encryptedMessage =response.data?.message

    const decrypted = decryptData(encryptedPayload);
    const decryptedMessage = encryptedMessage ? decryptData(encryptedMessage) : null;
    if (!decrypted) {
      return { success: false, msg: 'Unable to decrypt server response' };
    }

    if (
      decrypted === 'Login_Verified_Successfully_And_Response_Token_Sent' ||
      decryptedMessage === 'Login_Verified_Successfully_And_Response_Token_Sent'
    ) {
      const token = response.data.data;
      if (token) Cookie.set("data", token);
      return {
        success: true,
        data: decrypted,
        token,
        msg: 'Login successful',
      };
    }

    return { success: false, msg: 'Authentication failed' };
  } catch (error) {
    return {
      success: false,
      msg:
        error.response?.data?.message ||
        'Unable to reach server',
    };
  }
};
