// import Cookies from "js-cookie";

const TokenKeyName = "k8s_token";
const TokenKeyExpire = "k8s_token_expire";

export function getToken() {
  return localStorage.getItem(TokenKeyName);
}

export function getTokenExpire() {
  return localStorage.getItem(TokenKeyExpire);
}

export function setToken(token) {
  return localStorage.setItem(TokenKeyName, token);
}

export function setTokenExpire(token_expire) {
  return localStorage.setItem(TokenKeyExpire, token_expire);
}

export function removeToken() {
  return localStorage.removeItem(TokenKeyName);
}

export function removeTokenExpire() {
  return localStorage.removeItem(TokenKeyExpire);
}

export function getTimestamp() {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDate();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date + " " + time;
  return dateTime;
}
