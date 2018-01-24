const http = require('http')
const url = require('url')
const socks = require('socks')

module.exports = function startProxy ({
  listenHost = 'localhost',
  listenPort = 12333,
  socksHost = 'localhost',
  socksPort = 1080,
  socksUsername,
  socksPassword
}) {
  const proxy = {
    ipaddress: socksHost,
    port: socksPort,
    type: 5,
    authentication: { username: socksUsername || '', password: socksPassword || '' }
  }

  function request (uReq, uRes) {
    const u = url.parse(uReq.url)
  
    const socksAgent = new socks.Agent({
      proxy: proxy,
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
    }).on('error', e => {
      uRes.writeHead(500)
      uRes.end('Connection error\n')
    })
    uReq.pipe(pReq)
  }
  
  function connect (uReq, uSocket, uHead) {
    const u = url.parse('http://' + uReq.url)
    const options = {
      proxy: proxy,
      target: { host: u.hostname, port: u.port },
      command: 'connect'
    }
    socks.createConnection(options, (error, pSocket) => {
      if (error) {
        uSocket.write(`HTTP/${uReq.httpVersion} 500 Connection error\r\n\r\n`)
        return
      }
  
      // tunneling to the host
      pSocket.pipe(uSocket);
      uSocket.pipe(pSocket);
  
      pSocket.write(uHead)
      uSocket.write(`HTTP/${uReq.httpVersion} 200 Connection established\r\n\r\n`)
      pSocket.resume()
    })
  }

  return http.createServer()
    .on('connect', connect)
    .on('request', request)
    .listen(listenPort, listenHost)
}