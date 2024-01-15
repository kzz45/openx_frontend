import Vue from "vue";
import Router from "vue-router";

Vue.use(Router);

import Layout from "@/layout";

// import k8sRoute from "@/router/k8s";

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

  // {
  //   path: "/",
  //   component: Layout,
  //   redirect: "/dashboard",
  //   children: [
  //     {
  //       path: "dashboard",
  //       name: "Dashboard",
  //       component: () => import("@/views/dashboard/index"),
  //       meta: { title: "首页", icon: "home" },
  //     },
  //   ],
  // },

  {
    path: "/",
    component: () => import("@/views/dashboard/namespace"),
  },

];

export const asyncRouter = [
  // ...k8sRoute,
  // 404 page must be placed at the end !!!
  { path: "*", redirect: "/404", hidden: true },
];

const createRouter = () =>
  new Router({
    // mode: "history", // require service support
    scrollBehavior: () => ({ y: 0 }),
    routes: constantRoutes.concat(asyncRouter),
    // routes: constantRoutes,
  });

const router = createRouter();

export function resetRouter() {
  const newRouter = createRouter();
  router.matcher = newRouter.matcher; // reset router
}

export default router;
