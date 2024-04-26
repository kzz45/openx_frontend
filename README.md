# K8S管理平台(OpenX)

请移步至 [https://github.com/kzz45/neverdown](https://github.com/kzz45/neverdown)

## OpenX 功能

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
   1. 假设场景，批量修改切换应用的镜像版本
   2. 批量给应用加上一些环境变量
   3. 批量给应用加上监控的 Annotations
   4. 批量给应用挂载卷
5. 创建应用的时候，附带创建 service
   1. 在阿里云或者腾讯云上都可以直接指定云上的 LB 服务来创建 service
   2. 在 kuboard 上没有
   3. 所以我这边的就加上了，新增一个阿里云或者腾讯云的 LB 对象，在创建的时候选择指定的 LB 就可以在对应的云平台上自动创建 service
6. 创建应用的时候，阿里云或者 kuboard 都可以指定亲和性和容忍性之类的配置
   1. 所以我这边就将这两个对象抽离出来，相对来说操作起来更加的方便
   2. 使用场景就是游戏服务在测试的时候需要指定到污节点上来调整时间

以下是一些私有的功能

1. 应用可以配置自动更新
   1. 使用场景是研发在 gitlab 提交代码之后，上传镜像完成就直接自动完成应用的镜像版本更新
2. 可部署 MySQL Redis 等数据库服务

## 部署

## [kuboard 体验](https://kuboard.cn/install/v3/install.html)

个人觉得可能是 kuboard 使用的时间不多还不熟练，我觉得操作起来太烂了，另外整个前面页面看起来糟糕混乱(这里指的是不够简洁)

## [Rancher 体验](https://github.com/rancher/)

使用过 Rancher 的话，为什么还要使用 kuboard 呐，Rancher 的整体风格和体验相当不错(简洁)

## [KubeSphere 体验](https://github.com/kubesphere/kubesphere)

个人偏好 Rancher > KubeSphere > kuboard
