"use strict";
const axios = require("axios");

const BASE_URL = process.env.BEAR_CLI_BASE_URL
  ? process.env.BEAR_CLI_BASE_URL
  : "http://cli.monsterbear.top:7001";

const request = axios.create({
  baseURL: BASE_URL,
  timeout: 5000,
});

request.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

request.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    return Promise.reject(error);
  }
);

module.exports = request;
