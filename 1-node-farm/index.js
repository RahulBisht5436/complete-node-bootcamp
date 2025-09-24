const http = require('http')
const fs = require('fs')
const url = require('url')
const replaceTemplate = require('./starter/modules/replace-modules')
let readError = false
let fileJsonData = null
try {
    fileJsonData = fs.readFileSync(`${__dirname}/starter/dev-data/data.json`, 'utf-8')
} catch (err) {
    readError = true
    const errorMessage = err.message
    console.log('Error reading file:', errorMessage)
}

const templateOverviewData = fs.readFileSync(`${__dirname}/starter/templates/template-overview.html`, 'utf-8');
const templateProductData = fs.readFileSync(`${__dirname}/starter/templates/template-product.html`, 'utf-8');
const templateCardData = fs.readFileSync(`${__dirname}/starter/templates/template-product-card.html`, 'utf-8');
const productData = JSON.parse(fileJsonData);

const server = http.createServer((req, res) => {

    const {query,pathname} = url.parse(req.url, true);

    
    if(pathname === '/' || pathname === '/overview'){
        res.writeHead(200,{'Content-type': 'text/html'})
        const cards = productData.map(el => replaceTemplate(templateCardData, el)).join("");
        const overviewHTML = templateOverviewData.replace('{%PRODUCTCARD%}', cards);
        res.end(overviewHTML)
    }
    else if(pathname === '/product'){
        productId = url.parse(req.url, true).query.id;
        const templateRendered = replaceTemplate(templateProductData, productData[productId]);
        res.writeHead(200,{'Content-type': 'text/html'})
        res.end(templateRendered)
    }
    else if(pathname === '/api'){
        
            if (readError) {
                res.writeHead(500, { 'Content-type': 'application/json' })
                res.end(JSON.stringify({ error: 'Could not read data file' }))
                return
            }
            
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