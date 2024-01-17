import axios from "axios";
import store from "@/store";
import protoRoot from "@/proto/proto.js";

const requestproto =
  protoRoot.github.com.kzz45.discovery.pkg.openx.aggregator.proto;
const rbacproto = protoRoot.github.com.kzz45.discovery.pkg.apis.rbac.v1;

async function getService() {
  const cig = await axios.get("config/config.json");
  const env = cig.data;
  let config = {
    baseURL: "https://" + String(env.VUE_APP_BASE_API),
    timeout: 5000,
  };
  const service = axios.create(config);

  service.interceptors.request.use(
    (config) => {
      if (store.getters.token) {
        config.headers["Token"] = localStorage.getItem("k8s_token");
      }
      return config;
    },
    (error) => {
      console.log(error);
      return Promise.reject(error);
    }
  );

  service.interceptors.response.use(
    async (response) => {
      const ab = await response.data.arrayBuffer();
      const buffer = new Uint8Array(ab);
      let resp = requestproto.Response.decode(buffer);

      if (resp.code === 401) {
        console.log("401", resp);
        this.$message({
          message: resp.message,
          type: "error",
          duration: 5 * 1000,
        });
      }
      if (resp.code === 1) {
        console.log("1", resp);
        this.$message({
          message: resp.message,
          type: "error",
          duration: 5 * 1000,
        });
      }

      let gmtData = null;
      // console.log("===", resp);
      if (resp.raw) {
        gmtData = requestproto[`${response.config.params.serviceApi}`].decode(
          resp.raw
        );
      } else {
        gmtData = resp;
      }

      return gmtData;
    },
    (error) => {
      console.log("err" + error);
      this.$message({
        message: error.message,
        type: "error",
        duration: 5 * 1000,
      });
      return Promise.reject(error);
    }
  );
  return service;
}

export async function rbacApi(api, url, gmtParam, decodeApi, encodeApi) {
  // console.log("rbacapi====", api, url, gmtParam, decodeApi, "===", encodeApi);
  let gmtMsg = rbacproto[`${api}`].create(gmtParam);
  let data = rbacproto[`${api}`].encode(gmtMsg).finish();
  if (encodeApi) {
    gmtMsg = rbacproto[`${encodeApi}`].create(gmtParam);
    data = rbacproto[`${encodeApi}`].encode(gmtMsg).finish();
  }

  let gmtData = {
    raw: data,
  };

  let msg = requestproto.Request.create(gmtData);
  const service = await getService();
  return service({
    url: "/authority",
    method: "post",
    data: new Blob([requestproto.Request.encode(msg).finish()]),
    responseType: "blob",
    params: {
      serviceApi: decodeApi || api,
    },
  });
}
