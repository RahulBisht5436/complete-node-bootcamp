const app = require('./app')

// LEARN : this is new way to set environment variables
const dotenv = require('dotenv');
dotenv.config({ path: './config.env'  });

const port = process.env.PORT || 3000;

console.log(app.get('env'));
console.log(process.env)

app.listen(port, () => {
    console.log(`App running on port ${port}...`);
});