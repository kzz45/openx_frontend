import store from "@/store";
import { cloneDeep } from "lodash";
import { Notification } from "element-ui";
import protoRoot from "@/proto/proto";
const protoApi = protoRoot.k8s.io.api;
const protoRbac = protoRoot.k8s.io.api.rbac;
const protoRequest =
  protoRoot.github.com.kzz45.discovery.pkg.openx.aggregator.proto;

export const binaryToStr = (fileData) => {
  let dataString = "";
  Ï;
  for (let i = 0; i < fileData.length; i++) {
    dataString += String.fromCharCode(fileData[i]);
  }
  return dataString;
};

function metadata_check(metadata) {
  let result = [];
  if (!metadata.name) {
    result.push({
      key: "metadata.name",
      tips: "metadata.name is require!",
    });
  }
  return result;
}

function spec_check(spec) {
  let result = [];
  // if(spec.replicas !== 0 && !spec.replicas){
  //     result.push({
  //         key: 'spec.replicas', tips: 'spec.replicas is require!'
  //     })
  // }
  // if(spec.replicas < 0){
  //     result.push({
  //         key: 'spec.replicas', tips: 'spec.replicas need to be greater than or equal to 0'
  //     })
  // }
  return result;
}

function validate(gvk, message) {
  let resultList = [];
  const metaCheck = metadata_check(message.metadata);
  const specCheck = spec_check(message.spec);

  resultList.push(...metaCheck, ...specCheck);
  if (resultList.length > 0) {
    Notification({
      message: resultList[0].tips,
      type: "error",
    });
    return false;
  } else {
    return true;
  }
}

export function returnResourceList(msg, nameSpace, gvk) {
  const result = protoRequest.Response.decode(msg);
  if (result.verb === "ping") return;
  let resultGvk = result.groupVersionKind;
  let protoFetch = {};
  if (gvk.group.startsWith("openx")) {
    protoFetch = protoSargeras[gvk.version];
  } else if (gvk.group.startsWith("rbac")) {
    protoFetch = protoRbac[gvk.version];
  } else if (gvk.group === "jingx") {
    protoFetch = protoGuldan[gvk.version];
  } else if (gvk.group.startsWith("metrics")) {
    protoFetch = protoMetrics[gvk.version];
  } else {
    protoFetch = protoApi[gvk.group][gvk.version];
  }
  if (!resultGvk.group) {
    resultGvk.group = "core";
  }
  const gvkStr = `${resultGvk.group}-${resultGvk.version}-${resultGvk.kind}`;
  const requestGvk = `${gvk.group}-${gvk.version}-${gvk.kind}`;
  if (gvkStr === requestGvk && result.namespace === nameSpace) {
    switch (result.verb) {
      case "list":
        return protoFetch[`${gvk.kind}List`].decode(result.raw).items;
      default:
        break;
    }
  }
}

export function returnResource(
  msg,
  nameSpace,
  gvk,
  loadCallback,
  refreshCallback,
  getList
) {
  const result = protoRequest.Response.decode(msg);
  if (result.verb === "watch") return;
  if (result.verb === "ping") return;
  let resultGvk = result.groupVersionKind;
  let protoFetch = {};
  if (gvk.group.startsWith("openx")) {
    protoFetch = protoSargeras[gvk.version];
  } else if (gvk.group.startsWith("rbac")) {
    protoFetch = protoRbac[gvk.version];
  } else if (gvk.group === "jingx") {
    protoFetch = protoGuldan[gvk.version];
  } else if (gvk.group.startsWith("metrics")) {
    protoFetch = protoMetrics[gvk.version];
  } else {
    protoFetch = protoApi[gvk.group][gvk.version];
  }
  if (!resultGvk.group) {
    resultGvk.group = "core";
  }
  const gvkStr = `${resultGvk.group}-${resultGvk.version}-${resultGvk.kind}`;
  const requestGvk = `${gvk.group}-${gvk.version}-${gvk.kind}`;
  if (gvkStr === requestGvk && result.namespace === nameSpace) {
    loadCallback();
    if (result.code === 401) {
      Notification({
        title: "权限不足",
        message: `gvk: ${gvkStr}, verb: ${result.verb}`,
        type: "error",
        duration: 0,
      });
      // router.replace({ name: "Index" });
      return;
    }
    switch (result.verb) {
      case "create":
        if (result.code === 0) {
          Notification({
            title: "新增成功",
            message: "success",
            type: "success",
            duration: 2000,
          });
        } else {
          Notification({
            title: "新增失败",
            message: binaryToStr(result.raw),
            type: "error",
            duration: 3000,
          });
        }
        if (typeof getList === "function") {
          getList();
        }
        break;
      case "update":
        if (result.code === 0) {
          Notification({
            title: "修改成功",
            message: "success",
            type: "success",
            duration: 2000,
          });
        } else {
          Notification({
            title: "修改失败",
            message: binaryToStr(result.raw),
            type: "error",
            duration: 3000,
          });
        }
        if (typeof getList === "function") {
          getList();
        }
        break;
      case "delete":
        if (result.code === 0) {
          Notification({
            title: "删除成功",
            message: "success",
            type: "success",
            duration: 2000,
          });
        } else {
          Notification({
            title: "删除失败",
            message: binaryToStr(result.raw),
            type: "error",
            duration: 3000,
          });
        }
        if (typeof getList === "function") {
          getList();
        }
        break;
      case "list":
        return protoFetch[`${gvk.kind}List`].decode(result.raw).items;
      case "watch":
        const watchEvent = protoRequest.WatchEvent.decode(result.raw);
        if (typeof refreshCallback === "function") {
          const decodeRaw = protoFetch[`${gvk.kind}`].decode(watchEvent.raw);
          refreshCallback(watchEvent.type, decodeRaw);
        }
        break;
      default:
        break;
    }
  }
}

export function deleteSocketData(gvk, item) {
  let protoFetch = {};
  if (gvk.group.startsWith("openx")) {
    protoFetch = protoSargeras[gvk.version];
  } else if (gvk.group.startsWith("rbac")) {
    protoFetch = protoRbac[gvk.version];
  } else if (gvk.group === "jingx") {
    protoFetch = protoGuldan[gvk.version];
  } else {
    protoFetch = protoApi[gvk.group][gvk.version];
  }
  const createData = {
    metadata: item.metadata,
  };
  const message = protoFetch[gvk.kind].create(createData);
  const param = protoFetch[gvk.kind].encode(message).finish();
  return param;
}

export function updateSocketData(gvk, item) {
  let protoFetch = {};
  if (gvk.group.startsWith("openx")) {
    protoFetch = protoSargeras[gvk.version];
  } else if (gvk.group.startsWith("rbac")) {
    protoFetch = protoRbac[gvk.version];
  } else if (gvk.group === "jingx") {
    protoFetch = protoGuldan[gvk.version];
  } else {
    protoFetch = protoApi[gvk.group][gvk.version];
  }
  const message = cloneDeep(protoFetch[gvk.kind].create(item));
  // if (message.spec?.applications) {
  //   checkThrall(message.spec.applications);
  // }
  if (validate(gvk, message)) {
    const param = protoFetch[gvk.kind].encode(message).finish();
    return param;
  }
  return false;
}
