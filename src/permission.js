import router from "./router";
import store from "./store";
import { Message } from "element-ui";
import NProgress from "nprogress"; // progress bar
import "nprogress/nprogress.css"; // progress bar style
import { getToken, getTokenExpire, getTimestamp } from "@/utils/auth"; // get token from cookie
import getPageTitle from "@/utils/get-page-title";
import { Notification } from "element-ui";

NProgress.configure({ showSpinner: false }); // NProgress Configuration

const whiteList = ["/login"]; // no redirect whitelist

router.beforeEach(async (to, from, next) => {
  // start progress bar
  NProgress.start();

  // set page title
  document.title = getPageTitle(to.meta.title);

  // determine whether the user has logged in
  const hasToken = getToken();
  const hasTokenExpire = getTokenExpire();
  const timenow = new Date().getTime() / 1000;

  if (timenow < hasTokenExpire) {
    if (to.path === "/login") {
      next({ path: "/" });
      NProgress.done();
    } else {
      // const hasGetUserInfo = store.getters.name;
      const hasGetUserInfo = "admin";
      if (hasGetUserInfo) {
        // const ns = localStorage.getItem("ns");
        // const accessRoutes = await store.dispatch(
        //   "permission/generateRoutes",
        //   ns
        // );
        // console.log(accessRoutes, "====accessRoutes");
        // router.addRoute(accessRoutes);

        // next({ ...to, replace: true });
        next();
      } else {
        try {
          next();
        } catch (error) {
          await store.dispatch("user/resetToken");
          Message.error(error || "Has Error");
          next(`/login?redirect=${to.path}`);
          NProgress.done();
        }
      }
    }
  } else {
    if (whiteList.indexOf(to.path) !== -1) {
      next();
    } else {
      next(`/login?redirect=${to.path}`);
      NProgress.done();
    }
  }
});

router.afterEach(() => {
  NProgress.done();
});
