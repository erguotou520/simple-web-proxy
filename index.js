const http = require('http')
const url = require('url')
const socks = require('socks')

class HttpProxy {
  constructor (opt) {
    this.opt = Object.assign({}, {
      listenHost: 'localhost',
      listenPort: 12333,
      socksHost: 'localhost',
      socksPort: 1080
    }, opt)
    this.proxy = {
      ipaddress: this.opt.socksHost,
      port: this.opt.socksPort,
      type: 5,
      authentication: {
        username: this.opt.socksUsername || '',
        password: this.opt.socksPassword || ''
      }
    }
  }
  _request (proxy, uReq, uRes) {
    const u = url.parse(uReq.url)
  
    const socksAgent = new socks.Agent({
      proxy,
      target: { host: u.host, port: u.port }
    })
  
    const options = {
      hostname: u.hostname,
      port: u.port || 80,
      path: u.path,
      method: u.method || 'get',
      headers: u.headers,
      agent: socksAgent
    }
    const pReq = http.request(options)
    pReq.on('response', pRes => {
      pRes.pipe(uRes)
      uRes.writeHead(pRes.statusCode, pRes.headers)
      this.emit('request:success')
    }).on('error', e => {
      uRes.writeHead(500)
      uRes.end('Connection error\n')
      this.emit('request:error', e)
    })
    uReq.pipe(pReq)
  }
  
  _connect (proxy, uReq, uSocket, uHead) {
    const u = url.parse('http://' + uReq.url)
    const options = {
      proxy,
      target: { host: u.hostname, port: u.port },
      command: 'connect'
    }
    socks.createConnection(options, (error, pSocket) => {
      if (error) {
        uSocket.write(`HTTP/${uReq.httpVersion} 500 Connection error\r\n\r\n`)
        this.emit('connect:error', error)
        return
      }
  
      // tunneling to the host
      pSocket.pipe(uSocket);
      uSocket.pipe(pSocket);
  
      pSocket.write(uHead)
      uSocket.write(`HTTP/${uReq.httpVersion} 200 Connection established\r\n\r\n`)
      this.emit('connect:success')
      pSocket.resume()
    })
  }
  start () {
    const self = this
    return http.createServer()
      .on('connect', function (...args) {
        self._connect.bind(this)(self.proxy, ...args)
      })
      .on('request', function (...args) {
        self._request.bind(this)(self.proxy, ...args)
      })
      .listen(this.opt.listenPort, this.opt.listenHost)
  }
}

module.exports = function (opt) {
  const proxy = new HttpProxy(opt)
  return proxy.start()
}