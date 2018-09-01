# 一个简单的http_proxy服务器

基于Nodejs的简单http_proxy，给`ss(r)`的`socks`服务做代理比较有用。

## 安装

```bash
yarn add simple-web-proxy
```

## 开发

```js
const proxyServer = require('simple-web-proxy')
// 开启
const server = proxyServer({
  listenHost: 'localhost',
  listenPort: 12333,
  socksHost: 'localhost',
  socksPort: 1080,
  socksUsername,
  socksPassword
})
// 关闭
server.close()
// 事件监听
server.on('request:error', console.log)
server.on('request:success', console.log)
server.on('connect:error', console.log)
server.on('connect:success', console.log)
```

## 使用

```bash
export http_proxy="http://127.0.0.1:12333"
export https_proxy="http://127.0.0.1:12333"
curl https://twitter.com
```