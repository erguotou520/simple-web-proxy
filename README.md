# 一个简单的http_proxy服务器

基于Nodejs的简单http_proxy，给`ss(r)`的`socks`服务做代理比较有用。

## 安装

```bash
yarn add simple-web-proxy
```

## 使用

```js
const proxyServer = require('simple-web-proxy')
// 开启
const server = proxyServer({
  listenHost = 'localhost',
  listenPort = 12333,
  socksHost = 'localhost',
  socksPort = 1080,
  socksUsername,
  socksPassword
})
// 关闭
server.close()
```