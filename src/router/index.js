import Vue from "vue";
import Router from "vue-router";
import Layout from "@/layout";

Vue.use(Router);

export const constantRoutes = [
  {
    hidden: true,
    path: "/login",
    component: () => import("@/views/login/index"),
  },

  {
    hidden: true,
    path: "/404",
    component: () => import("@/views/404"),
  },

  {
    path: "/",
    component: () => import("@/views/dashboard/namespace"),
    meta: { title: "首页", icon: "home" },
  },

  // 这里的就是本平台特有的
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
          icon: "x",
        },
      },
      {
        path: "alb",
        name: "Alb",
        component: () => import("@/views/k8s/openx/cloudLoadBalancer"),
        meta: {
          title: "负载均衡",
          icon: "slb",
        },
      },
      {
        path: "acl",
        name: "Acl",
        component: () => import("@/views/k8s/openx/cloudAccessControl"),
        meta: {
          title: "访问控制",
          icon: "acl",
        },
      },
      {
        path: "affinity",
        name: "Affinity",
        component: () => import("@/views/k8s/openx/affinity"),
        meta: {
          title: "亲和性",
          icon: "affinity",
        },
      },
      {
        path: "toleration",
        name: "Toleration",
        component: () => import("@/views/k8s/openx/toleration"),
        meta: {
          title: "容忍性",
          icon: "toleration",
        },
      },
      {
        hidden: true,
        path: "mysql",
        name: "MySQL",
        component: () => import("@/views/k8s/openx/mysql"),
        meta: {
          title: "MySQL",
          icon: "mysql",
        },
      },
      {
        hidden: true,
        path: "redis",
        name: "Redis",
        component: () => import("@/views/k8s/openx/redis"),
        meta: {
          title: "Redis",
          icon: "redis",
        },
      },
      {
        hidden: true,
        path: "etcd",
        name: "Etcd",
        component: () => import("@/views/k8s/openx/etcd"),
        meta: {
          title: "Etcd",
          icon: "etcd",
        },
      },
      // {
      //   path: "test",
      //   name: "Test",
      //   component: () => import("@/views/k8s/app/test"),
      //   meta: {
      //     title: "测试",
      //   },
      // },
    ],
  },

  // 这里的就是原生 K8S 中的
  {
    path: "/corev1",
    component: Layout,
    meta: { title: "原生应用", icon: "corev1" },
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

  // terminal 终端
  {
    hidden: true,
    path: "/term",
    component: () => import("@/views/k8s/terminal.vue"),
  },

  // 日志
  {
    hidden: true,
    path: "/log",
    component: () => import("@/views/k8s/log.vue"),
  },

  // 这里暂时不需要了 OpenX 代替
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

  // 这两个也基本是管理员才会看到的
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
          icon: "clusterrole",
        },
      },
      {
        path: "clusterrolebinding",
        name: "ClusterRoleBinding",
        component: () => import("@/views/k8s/rbacv1/clusterrolebinding"),
        meta: {
          title: "角色绑定",
          icon: "clusterrolebinding",
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
