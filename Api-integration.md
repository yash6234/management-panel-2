# API Integration Guide (React + Vite)

This document describes how the Management Panel 2 React app integrates with backend APIs: configuration, encryption layer, service modules, and API endpoints. It uses **axios** for HTTP requests and **Vite** for environment variables.

---

## 1. Overview

- **Backend**: The app talks **directly** to an external API. There are no proxy routes.
- **Base URL**: Configured via `VITE_IP`. Example: `http://192.168.1.113:5100`.
- **Auth**: Admin auth flow uses encrypted payloads in URL path. Token is returned after OTP verification and can be stored in cookies or localStorage for subsequent requests.
- **Data**: Request/response data is encrypted using **AES** (CryptoJS) with `VITE_ENCRYPTION_SECRET`.
- **HTTP Client**: All API calls use **axios**.

---

## 2. Environment Variables

| Env variable | Purpose |
|--------------|---------|
| `VITE_IP` | Backend base URL (e.g. `http://192.168.1.113:5100`) |
| `VITE_ENCRYPTION_SECRET` | Secret key for AES encryption/decryption of payloads |

Add these to `.env` or `.env.local`:

```
VITE_IP=http://192.168.1.113:5100
VITE_ENCRYPTION_SECRET=your_secret_key_here
```

---

## 3. Encryption / Decryption Module

All sensitive payloads are encrypted before being sent in the URL and decrypted when responses are received.

**File:** `src/utils/enc_dec_admin.js` (or `src/lib/enc_dec_admin.js`)

```javascript
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
```

**Dependencies:** Install `crypto-js` and `js-cookie`:

```bash
npm install crypto-js js-cookie axios
```

---

## 4. Admin Auth Service

**File:** `src/api/adminAuth.js` (or `src/services/adminAuth.js`)

```javascript
import axios from 'axios';
import Cookie from 'js-cookie';
import { encryptData, decryptData } from './enc_dec_admin';

const ip = `${import.meta.env.VITE_IP}/admin/auth`;
const cookieData = Cookie.get('data');

const createPayload = (additionalData = {}) => {
  return encodeURIComponent(encryptData({ data: cookieData, ...additionalData }));
};

export const login = async (data) => {
  try {
    const response = await axios.get(
      `${ip}/login/${createPayload(data)}`
    );
    if (
      response.status === 200 &&
      decryptData(response.data.data) === "User_Authenticated_And_OTP_Sent"
    ) {
      return { success: true, data: response.data, msg: 'Login successful, OTP sent' };
    }
  } catch (error) {
    console.error('Error in Login', error);
    return { success: false, msg: error.response?.data?.message || 'Failed to login' };
  }
};
```

### 4.1 Admin Auth Endpoints

| Endpoint | Method | Payload | Description |
|----------|--------|---------|-------------|
| `/admin/auth/login/:data` | GET | `{ email, password }` | Login – sends OTP. Response: `"User_Authenticated_And_OTP_Sent"` |
| (OTP verify) | GET | OTP + credentials | Verify OTP. Response: `"Login_Verified_Successfully_And_Response_Token_Sent"` with `{ token, id, name, mobile_no, email, user: 'Verified' }` |

**Encrypted payload format:** Data is AES-encrypted, then URL-encoded and appended to the path as `:data`.

---

## 5. Master – Sales Man APIs

**Base path:** `${VITE_IP}/master/sales-man`

All payloads are encrypted and URL-encoded in the `:data` path segment.

| Endpoint | Method | Payload | Description |
|----------|--------|---------|-------------|
| `/master/sales-man/add/:data` | GET/POST | `{ name, mobile_no, email, address }` | Add new sales man |
| `/master/sales-man/edit/:data` | GET/PUT | `{ _id, name, mobile_no, email, address }` | Edit sales man |
| `/master/sales-man/fetch/:data` | GET | (empty or minimal) | Fetch all sales men |
| `/master/sales-man/delete/:data` | GET/DELETE | `{ _id }` | Delete sales man |

### 5.1 Sales Man Service Example

**File:** `src/api/salesMan.js`

```javascript
import axios from 'axios';
import { encryptData, decryptData } from './enc_dec_admin';

const baseUrl = `${import.meta.env.VITE_IP}/master/sales-man`;

const createPayload = (data) => encodeURIComponent(encryptData(data));

export const addSalesMan = async (payload) => {
  const response = await axios.get(`${baseUrl}/add/${createPayload(payload)}`);
  return decryptData(response.data.data);
};

export const editSalesMan = async (payload) => {
  const response = await axios.get(`${baseUrl}/edit/${createPayload(payload)}`);
  return decryptData(response.data.data);
};

export const fetchSalesMen = async () => {
  const response = await axios.get(`${baseUrl}/fetch/${createPayload({})}`);
  return decryptData(response.data.data);
};

export const deleteSalesMan = async (id) => {
  const response = await axios.get(`${baseUrl}/delete/${createPayload({ _id: id })}`);
  return decryptData(response.data.data);
};
```

---

## 6. Master – Diesel APIs

**Base path:** `${VITE_IP}/master/diesel`

| Endpoint | Method | Payload | Description |
|----------|--------|---------|-------------|
| `/master/diesel/add/:data` | GET/POST | `{ name, amount }` | Add diesel entry |
| `/master/diesel/edit/:data` | GET/PUT | `{ _id, name, amount }` | Edit diesel entry |
| `/master/diesel/fetch/:data` | GET | (empty or minimal) | Fetch all diesel entries |
| `/master/diesel/delete/:data` | GET/DELETE | `{ _id }` | Delete diesel entry |

### 6.1 Diesel Service Example

**File:** `src/api/diesel.js`

```javascript
import axios from 'axios';
import { encryptData, decryptData } from './enc_dec_admin';

const baseUrl = `${import.meta.env.VITE_IP}/master/diesel`;

const createPayload = (data) => encodeURIComponent(encryptData(data));

export const addDiesel = async (payload) => {
  const response = await axios.get(`${baseUrl}/add/${createPayload(payload)}`);
  return decryptData(response.data.data);
};

export const editDiesel = async (payload) => {
  const response = await axios.get(`${baseUrl}/edit/${createPayload(payload)}`);
  return decryptData(response.data.data);
};

export const fetchDiesel = async () => {
  const response = await axios.get(`${baseUrl}/fetch/${createPayload({})}`);
  return decryptData(response.data.data);
};

export const deleteDiesel = async (id) => {
  const response = await axios.get(`${baseUrl}/delete/${createPayload({ _id: id })}`);
  return decryptData(response.data.data);
};
```

---

## 7. Axios Configuration (Optional)

For centralized configuration and interceptors (e.g. attaching token, handling 401), create an axios instance:

**File:** `src/api/axiosInstance.js`

```javascript
import axios from 'axios';
import Cookie from 'js-cookie';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_IP,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// Add token from cookie/localStorage to requests
axiosInstance.interceptors.request.use((config) => {
  const token = Cookie.get('token'); // or localStorage
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 – redirect to login
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      Cookie.remove('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
```

Use this instance in services that require auth (e.g. after login):

```javascript
import axiosInstance from './axiosInstance';
```

Use plain `axios` for auth endpoints that don’t yet have a token.

---

## 8. Authentication Flow

1. **Login:** Call `login({ email, password })` → backend returns `"User_Authenticated_And_OTP_Sent"`.
2. **OTP Verify:** Call backend with OTP + credentials → returns `"Login_Verified_Successfully_And_Response_Token_Sent"` and `{ token, id, name, mobile_no, email, user: 'Verified' }`.
3. **Token storage:** Store `token` in Cookie or localStorage.
4. **Authenticated requests:** Use the axios instance with interceptors to add `Authorization: Bearer <token>`.
5. **401 handling:** Interceptor clears token and redirects to `/login`.

---

## 9. File Reference

| Purpose | Recommended path |
|---------|------------------|
| Encryption/decryption | `src/utils/enc_dec_admin.js` or `src/lib/enc_dec_admin.js` |
| Admin auth | `src/api/adminAuth.js` |
| Sales man CRUD | `src/api/salesMan.js` |
| Diesel CRUD | `src/api/diesel.js` |
| Axios instance | `src/api/axiosInstance.js` |

---

## 10. Summary

- **React + Vite**: Use `import.meta.env.VITE_IP` and `import.meta.env.VITE_ENCRYPTION_SECRET`.
- **HTTP client**: Axios for all API calls.
- **Encryption**: AES (CryptoJS) for payloads in admin/auth and master endpoints.
- **Payload format**: Data is encrypted, JSON-stringified, then URL-encoded and passed as `:data` in the path.
- **Endpoints**: Admin auth (`/admin/auth/*`), Sales man (`/master/sales-man/*`), Diesel (`/master/diesel/*`).
- **Auth**: Cookie/localStorage for token; axios interceptors for Bearer token and 401 handling.
