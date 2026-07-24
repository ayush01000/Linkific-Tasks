import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api",
});

export const getTransactions = () =>
  api.get("/transactions/");

export const createTransaction = (data) =>
  api.post("/transactions/", data);

export const deleteTransaction = (id) =>
  api.delete(`/transactions/${id}/`);

export const getSummary = () =>
  api.get("/summary/");

export default api;