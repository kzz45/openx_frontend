import Layout from "@/layout";
import { asyncRoutes, constantRoutes } from "@/router";

const state = {
  routes: [],
  addRoutes: [],
};

const mutations = {
  SET_ROUTES: (state, routes) => {
    state.addRoutes = routes;
    state.routes = constantRoutes.concat(routes);
  },
};

const actions = {
  generateRoutes({ commit }, ns) {
    return new Promise((resolve) => {
      const accessedRoutes = [];
      const rule = JSON.parse(String(localStorage.getItem("clusterRole")));

      const gvkRule = rule[ns];
      const gvkList = [];
      for (const gv in gvkRule) {
        const kinds = gvkRule[gv].gvk;
        for (const gvkind of kinds) {
          const gvSplit = gv.split("/");
          if (gvSplit[0] !== "jingx" && gvSplit[0] !== "native") {
            gvkList.push({
              gv: `${gvSplit[0] || "core"}-${gvSplit[1]}`,
              kind: gvkind.kind,
              verbs: gvkind.verbs,
            });
          }
        }
      }
      gvkList.sort((gvka, gvkb) => {
        const nameA = `${gvka.gv}-${gvka.kind}`.toUpperCase();
        const nameB = `${gvkb.gv}-${gvkb.kind}`.toUpperCase();
        if (nameA < nameB) {
          return -1;
        }
        if (nameA > nameB) {
          return 1;
        }
        return 0;
      });
      for (let one of gvkList) {
        console.log(ns, one.gv, one.kind, "=====");
        accessedRoutes.push({
          name: `${ns}${one.gv}${one.kind}`,
          path: `/${ns}/${one.gv}-${one.kind}`,
          component: Layout,
        });
        // router.addRoute({
        //   name: `${ns}${one.gv}${one.kind}`,
        //   path: `/${ns}/${one.gv}-${one.kind}`,
        //   component: Layout,
        // });
      }

      commit("SET_ROUTES", accessedRoutes);
      resolve(accessedRoutes);
    });
  },
};

export default {
  namespaced: true,
  state,
  mutations,
  actions,
};
