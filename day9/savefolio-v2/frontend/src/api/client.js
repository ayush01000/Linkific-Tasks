import axios from "axios";

const client = axios.create({
  baseURL:
    import.meta.env.VITE_API_URL ||
    "http://127.0.0.1:8000",
  headers: {
    "Content-Type": "application/json",
  },
});

export const transactionApi = {
  async list() {
    const response = await client.get(
      "/api/transactions/",
    );

    return response.data;
  },

  async create(data) {
    const response = await client.post(
      "/api/transactions/",
      data,
    );

    return response.data;
  },

  async update(id, data) {
    const response = await client.patch(
      `/api/transactions/${id}/`,
      data,
    );

    return response.data;
  },

  async remove(id) {
    await client.delete(`/api/transactions/${id}/`);
  },

  async summary() {
    const response = await client.get("/api/summary/");

    return response.data;
  },
};

export default client;