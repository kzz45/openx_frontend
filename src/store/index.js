import Vue from "vue";
import Vuex from "vuex";
import k8s from "./modules/k8s";
import getters from "./getters";
import app from "./modules/app";
import user from "./modules/user";
import settings from "./modules/settings";

Vue.use(Vuex);

const store = new Vuex.Store({
  modules: {
    app,
    settings,
    user,
    k8s,
  },
  getters,
});

export default store;
