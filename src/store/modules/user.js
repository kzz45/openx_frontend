import store from "@/store";
import { login, logout, getInfo } from "@/api/user";
import { k8slogin, connectSocket, initRules } from "@/api/k8s";
import {
  getToken,
  setToken,
  removeToken,
  getTokenExpire,
  setTokenExpire,
} from "@/utils/auth";
import { resetRouter } from "@/router";

const getDefaultState = () => {
  return {
    token: getToken(),
    token_expire: "",
    name: "",
    avatar: "",
  };
};

const state = getDefaultState();

const mutations = {
  RESET_STATE: (state) => {
    Object.assign(state, getDefaultState());
  },
  SET_TOKEN: (state, token) => {
    state.token = token;
  },
  SET_TOKEN_EXPIRE: (state, expireAt) => {
    state.token_expire = expireAt;
  },
  SET_NAME: (state, name) => {
    state.name = name;
  },
  SET_AVATAR: (state, avatar) => {
    state.avatar = avatar;
  },
};

const actions = {
  // user login
  login({ commit }, userInfo) {
    const { username, password } = userInfo;
    return new Promise((resolve, reject) => {
      k8slogin({ username: username.trim(), password: password })
        .then((response) => {
          localStorage.setItem(
            "clusterRole",
            JSON.stringify(initRules(response.clusterRole.spec.rules))
          );

          commit("SET_TOKEN", response.token);
          commit("SET_TOKEN_EXPIRE", response.expireAt);
          setToken(response.token);
          setTokenExpire(response.expireAt);
          connectSocket(response.token, store);
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  // get user info
  getInfo({ commit, state }) {
    return new Promise((resolve, reject) => {
      getInfo(state.token)
        .then((response) => {
          const { data } = response;

          if (!data) {
            return reject("Verification failed, please Login again.");
          }

          const { name, avatar } = data;

          commit("SET_NAME", name);
          commit("SET_AVATAR", avatar);
          resolve(data);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },

  // user logout
  logout({ commit, state }) {
    removeToken(); // must remove  token  first
    resetRouter();
    localStorage.removeItem("k8s_token");
    localStorage.removeItem("k8s_token_expire");
    localStorage.removeItem("clusterRole");
    commit("RESET_STATE");
  },

  // remove token
  resetToken({ commit }) {
    return new Promise((resolve) => {
      removeToken(); // must remove  token  first
      commit("RESET_STATE");
      resolve();
    });
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
