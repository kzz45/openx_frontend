import Vue from "vue";
import Router from "vue-router";
import k8sRoute from "./k8s";
Vue.use(Router);

export const constantRoutes = [
  {
    path: "/login",
    component: () => import("@/views/login/index"),
    hidden: true,
  },

  {
    path: "/404",
    component: () => import("@/views/404"),
    hidden: true,
  },

  {
    path: "/",
    component: () => import("@/views/dashboard/namespace"),
    meta: { title: "首页", icon: "home" },
  },
];

export const asyncRouter = [
  ...k8sRoute,
  // 404 page must be placed at the end !!!
  { path: "*", redirect: "/404", hidden: true },
];

const createRouter = () =>
  new Router({
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes.concat(asyncRouter),
  });

const router = createRouter();

export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher; // reset router
}

export default router;
