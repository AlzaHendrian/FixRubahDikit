import axios from "axios";

export const API = axios.create({

  // baseURL: process.env.REACT_APP_BASEURL,
  baseURL: process.env.REACT_APP_BASEURL,
  // baseURL: "https://test-production-6488.up.railway.app/waysbooks"
});

export const setAuthToken = (token) => {
  if (token) {
    API.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete API.defaults.headers.common["Authorization"];
  }
};
