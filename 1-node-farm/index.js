const http = require('http')
const fs = require('fs')
let readError = false
let fileJsonData = null
try {
    fileJsonData = fs.readFileSync(`${__dirname}/starter/dev-data/data.json`, 'utf-8')
    console.log(fileJsonData, "uasusdstudyat")
} catch (err) {
    readError = true
    const errorMessage = err.message
    console.log('Error reading file:', errorMessage)
}
const server = http.createServer((req, res) => {

    if(req.url === '/' || req.url === '/overview'){
        res.end('This is the overview')
    }
    else if(req.url === '/product'){
        res.end('This is the product')
    }
    else if(req.url === '/api'){
        
            if (readError) {
                res.writeHead(500, { 'Content-type': 'application/json' })
                res.end(JSON.stringify({ error: 'Could not read data file' }))
                return
            }
            
            const productData = JSON.parse(fileJsonData)
            res.writeHead(200, { 'Content-type': 'application/json' })
            res.end(JSON.stringify(productData))
        
    }else{
        res.writeHead(404, {
            'Content-type': 'text/html',
        })
        res.end('This is the error page')
    }
})

server.listen(8000, '127.0.0.1', () => {
    console.log('Listening to requests on port 8000')
})