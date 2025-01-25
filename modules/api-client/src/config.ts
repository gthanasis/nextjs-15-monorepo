export default {
  controlURL:
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.CONTROL_BACKEND_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:3001",
  storageURL:
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.STORAGE_BACKEND_URL ||
    process.env.BACKEND_URL ||
    "http://localhost:3002",
  headers: {
    "Content-Type": "application/json",
  },
  token: process.env.NEXT_TOKEN,
};
