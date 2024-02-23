# K8S管理平台

<!-- ## 本地运行

```sh
npm cache clean --force
npm install -D
npm run dev
``` -->

## 功能

一些常见的功能比如在阿里云或者腾讯云上的创建删除更新等等原生的动作都有

1. 批量删除应用，这个在其他的管理平台如 kuboard 上也都有，没什么新鲜的
2. 批量重启应用，无非就是重新部署，也没啥新鲜的
   1. 但是我这边的差异化是做了一个暂停应用和启动应用
   2. 这里的场景是游戏中的踢玩家下线
3. 批量复制应用
   1. 这个在阿里云上没有，在 kuboard 上有，但是是一个个复制的
   2. 所以我这边的差异化就是，可以多个复制，可以复制关联的对象
   3. 这里的场景是假如一个 namespace 是一个开发环境的话，复制一个开发环境就很快了
4. 批量修改应用，这个在阿里云上没有，在 kuboard 上也没有
   1. 假设场景，批量修改应用的镜像版本
   2. 批量给应用加上一些环境变量
   3. 批量给应用加上监控的 Annotations
   4. 批量给应用挂载卷

以下是一些私有的功能

1. 应用可以配置自动更新
2. 指定阿里云或者腾讯云的负责均衡，来自动创建 loadbalance service
3. 指定应用的亲和性和容忍性配置
4. 可部署 MySQL Redis 等数据库服务

## 部署
