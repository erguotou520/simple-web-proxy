const startProxy = require('./index')

const server = startProxy({
    listenPort: 23333
})
server.once('test', console.log)
// setTimeout(() => {
//     server.close()
// }, 3000)