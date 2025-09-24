const http = require('http')
const fs = require('fs')
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
function replaceTemplate(template, product) {
    let output = template.replace(/{%PRODUCTNAME%}/g, product.productName);
    output = output.replace(/{%IMAGE%}/g, product.image);
    output = output.replace(/{%PRICE%}/g, product.price);
    output = output.replace(/{%FROM%}/g, product.from);
    output = output.replace(/{%NUTRIENTS%}/g, product.nutrients);
    output = output.replace(/{%QUANTITY%}/g, product.quantity);
    output = output.replace(/{%DESCRIPTION%}/g, product.description);
    output = output.replace(/{%ID%}/g, product.id);
    // Handle organic/non-organic
    if (!product.organic) {
        output = output.replace(/{%NOTORGANIC%}/g, 'not-organic');
    } else {
        output = output.replace(/{%NOTORGANIC%}/g, '');
    }
    return output;
}


const server = http.createServer((req, res) => {




    
    if(req.url === '/' || req.url === '/overview'){
        res.writeHead(200,{'Content-type': 'text/html'})
        const cards = productData.map(el => replaceTemplate(templateCardData, el)).join("");
        const overviewHTML = templateOverviewData.replace('{%PRODUCTCARD%}', cards);
        res.end(overviewHTML)
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