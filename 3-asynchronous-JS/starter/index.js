const fs = require('fs').promises;

const AsyncFunc = async () => {
    let timer = await fs.readFile(`${__dirname}/dog.txt`, 'utf-8');

    return timer;
};
AsyncFunc().then((data) => {
    console.log(data);
});