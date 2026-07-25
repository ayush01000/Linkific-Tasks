import axios from "axios";

const api = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000/api",
  headers: {
    "Content-Type": "application/json",
  },
});

export const getTransactions = () =>
  api.get("/transactions/");

export const getTransaction = (id) =>
  api.get(`/transactions/${id}/`);

export const createTransaction = (data) =>
  api.post("/transactions/", data);

export const updateTransaction = (id, data) =>
  api.patch(`/transactions/${id}/`, data);

export const deleteTransaction = (id) =>
  api.delete(`/transactions/${id}/`);

export const getSummary = () =>
  api.get("/summary/");

export default api;