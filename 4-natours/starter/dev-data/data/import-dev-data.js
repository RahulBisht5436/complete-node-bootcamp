// NOTE : import module 
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('../../Models/tours');

// NOTE : use module 
dotenv.config({path: '../../config.env'});
const DB = process.env.DATABASE.replace('<db_password>', process.env.DATABASE_PASSWORD);
mongoose.connect(DB , {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false          
}).then(() => {
    console.log('DB connection successful!');   
} ).catch((err) => {
    console.log('DB connection failed!', err);
})


const tours = JSON.parse(fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8'));


// NOTE : import data to database
const importData = async () => {
    try {
        await Tour.create(tours);
        console.log('Data successfully loaded!');
    } catch (err) {
        console.log(err);
    }  
 }
// NOTE : delete all data from database
 const deleteData = async () => {
    try {
        await Tour.deleteMany();
        console.log('Data successfully deleted!');
    } catch (err) {
        console.log(err);
    }
}

if(process.argv[2] === '--import'){
    importData();
}else if(process.argv[2] === '--delete'){
    deleteData();
}   

console.log(process.argv);