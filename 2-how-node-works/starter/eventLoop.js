const fs = require('fs')
console.log('Hello from the top-level code of eventLoop.js')

setTimeout(() => console.log('0 sec timer'), 0)
setImmediate(() => console.log('Immediate timer'))

fs.readFile(`${__dirname}/test-file.txt`, 'utf-8', (err, data) => {  
    console.log('I/O finished')
    }
)