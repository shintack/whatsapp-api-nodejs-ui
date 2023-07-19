import { defineStore } from "pinia";
import { extend, LocalStorage } from "quasar";
import axios from "axios";

export const useSessionStore = defineStore("session", {
  state: () => ({
    token: LocalStorage.getItem("token") || null,
    baseUrlApi: LocalStorage.getItem("api_url") || null,
    devices: LocalStorage.getItem("devices") || [],
    sessionApi: null,
  }),
  getters: {
    getToken: (state) => state.token,
    getApiUrl: (state) => state.baseUrlApi,
  },
  actions: {
    login(token, apiUrl) {
      this.token = token;
      this.baseUrlApi = apiUrl;
      LocalStorage.set("token", token);
      LocalStorage.set("api_url", apiUrl);
      this.initAxios();
    },
    logout() {
      this.token = null;
      this.baseUrlApi = null;
      this.devices = [];
      this.sessionApi = null;
      LocalStorage.remove("token");
      LocalStorage.remove("api_url");
      LocalStorage.remove("devices");
    },
    initAxios() {
      this.sessionApi = axios.create({
        baseURL: this.baseUrlApi,
      });
    },
    setDevices(listData) {
      this.devices = listData;
      LocalStorage.set("devices", listData);
    },
    isLoggedin() {
      return this.token !== null && this.baseUrlApi !== null;
    },
  },
});
