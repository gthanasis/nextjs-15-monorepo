import axios from "axios";
import config from "./config";

if (config.token) {
  config.headers["Authorization"] = `Bearer ${config.token}`;
}

const control = axios.create({
  baseURL: `${config.controlURL}/control`,
  headers: config.headers,
  withCredentials: true,
});

const storage = axios.create({
  baseURL: `${config.storageURL}/storage`,
  headers: config.headers,
  withCredentials: true,
});

export { control, storage };
