const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const Tour = require('./../../Models/tourModel.js');


const DB = process.env.DATABASE.replace('<PASSWORD>', process.env.DATABASE_PASSWORD);

mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false
  })
  .then(() => console.log('DB connection successful!'));


const tours = fs.readFileSync(`${__dirname}/tours-simple.json`, 'utf-8');


// LEARN HOW TO IMPORT DATA INTO THE DATABASE
const importData = async () => {
  try {
    await Tour.create(JSON.parse(tours));
    console.log('Data successfully loaded!');
  } catch (err) {
    console.log(err);
  }
}

// LEARN HOW TO DELETE ALL THE DATA FROM THE DATABASE
const deleteData = async () => {
  try {
    await Tour.deleteMany();
    console.log('Data successfully deleted!');
  }
  catch (err) {
    console.log(err);
  }
}