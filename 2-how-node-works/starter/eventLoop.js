const { CONNREFUSED } = require('dns');
const event = require('events');
const fs = require('fs');
const http = require('http');
const eventEmitter = new event.EventEmitter();  
eventEmitter.on('order-pizza', (size, topping) => {
    console.log(`Order received! Preparing a ${size} pizza with ${topping}`);
});
eventEmitter.emit('order-pizza', 'large', 'mushrooms and bananas');



const server = http.createServer();
server.on('request', (req, res) => {
    console.log('Request received');
    res.end('Request received');
});
console.log( `${__dirname}`);
const readStreamfiles = fs.createReadStream(`${__dirname}/test-file.txt`, 'utf-8');
const writeStreamfiles = fs.createWriteStream(`${__dirname}/test-file-copy.txt`);

readStreamfiles.pipe(writeStreamfiles);

writeStreamfiles.on('finish', () => {
    console.log('File copied successfully using pipe!');
});


