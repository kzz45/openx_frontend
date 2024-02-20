import Vue from "vue";
import Router from "vue-router";
import Layout from "@/layout";

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

  {
    path: "/openx",
    name: "OpenX",
    component: Layout,
    redirect: "/openx/openx",
    meta: {
      title: "OpenX",
      icon: "x",
    },
    children: [
      {
        path: "openx",
        name: "OPENX",
        component: () => import("@/views/k8s/openx/openx"),
        meta: {
          title: "应用列表",
          icon: "build",
        },
      },
      {
        path: "alb",
        name: "Alb",
        component: () => import("@/views/k8s/openx/cloudLoadBalancer"),
        meta: {
          title: "负载均衡",
          icon: "cm",
        },
      },
      {
        path: "acl",
        name: "Acl",
        component: () => import("@/views/k8s/openx/cloudAccessControl"),
        meta: {
          title: "访问控制",
          icon: "cm",
        },
      },
      {
        path: "affinity",
        name: "Affinity",
        component: () => import("@/views/k8s/openx/affinity"),
        meta: {
          title: "亲和性",
          icon: "svc",
        },
      },
      {
        path: "toleration",
        name: "Toleration",
        component: () => import("@/views/k8s/openx/toleration"),
        meta: {
          title: "容忍性",
          icon: "cm",
        },
      },
      // {
      //   path: "test",
      //   name: "Test",
      //   component: () => import("@/views/k8s/app/test"),
      //   meta: {
      //     title: "测试",
      //     icon: "cm",
      //   },
      // },
    ],
  },

  {
    path: "/corev1",
    component: Layout,
    meta: { title: "核心应用", icon: "corev1" },
    children: [
      {
        path: "pod",
        name: "Pod",
        component: () => import("@/views/k8s/corev1/pod"),
        meta: {
          title: "容器列表",
          icon: "pod",
        },
      },
      {
        path: "service",
        name: "Service",
        component: () => import("@/views/k8s/corev1/service"),
        meta: {
          title: "服务列表",
          icon: "svc",
        },
      },
      {
        path: "configmap",
        name: "ConfigMap",
        component: () => import("@/views/k8s/corev1/config"),
        meta: {
          title: "配置字典",
          icon: "cm",
        },
      },

      {
        path: "secret",
        name: "Secret",
        component: () => import("@/views/k8s/corev1/secret"),
        meta: {
          title: "密文列表",
          icon: "secret",
        },
      },

      {
        path: "serviceaccount",
        name: "ServiceAccount",
        component: () => import("@/views/k8s/corev1/serviceaccount"),
        meta: {
          title: "服务账户",
          icon: "serviceaccount",
        },
      },
      {
        path: "event",
        name: "Event",
        component: () => import("@/views/k8s/corev1/event"),
        meta: {
          title: "事件中心",
          icon: "event",
        },
      },
      {
        path: "node",
        name: "Node",
        component: () => import("@/views/k8s/corev1/node"),
        meta: {
          title: "节点列表",
          icon: "node",
        },
      },
      {
        path: "namespace",
        name: "Namespace",
        component: () => import("@/views/k8s/corev1/namespace"),
        meta: {
          title: "命名空间",
          icon: "node",
        },
      },
    ],
  },
  {
    hidden: true,
    path: "/term",
    component: () => import("@/views/k8s/terminal.vue"),
  },
  {
    hidden: true,
    path: "/log",
    component: () => import("@/views/k8s/log.vue"),
  },
  // 这里就不需要了
  // {
  //   path: "/appsv1",
  //   component: Layout,
  //   meta: { title: "原生应用", icon: "kubernetes" },
  //   children: [
  //     {
  //       path: "deploy",
  //       name: "Deploy",
  //       component: () => import("@/views/k8s/appsv1/deployment"),
  //       meta: {
  //         title: "Deployment",
  //         icon: "deploy",
  //       },
  //     },
  //     {
  //       path: "statefulset",
  //       name: "StatefulSet",
  //       component: () => import("@/views/k8s/appsv1/statefulset"),
  //       meta: {
  //         title: "StatefulSet",
  //         icon: "sts",
  //       },
  //     },
  //   ],
  // },

  {
    path: "/rbacv1",
    component: Layout,
    meta: { title: "角色控制", icon: "auth" },
    children: [
      {
        path: "clusterrole",
        name: "ClusterRole",
        component: () => import("@/views/k8s/rbacv1/clusterrole"),
        meta: {
          title: "集群角色",
          icon: "deployment",
        },
      },
      {
        path: "clusterrolebinding",
        name: "ClusterRoleBinding",
        component: () => import("@/views/k8s/rbacv1/clusterrolebinding"),
        meta: {
          title: "角色绑定",
          icon: "build",
        },
      },
    ],
  },
];

export const asyncRouter = [
  // ...k8sRoute,
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
