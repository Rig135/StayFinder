const mongoose = require('mongoose');
const cities = require('./cities');
const {places, descriptors } = require('./seedHelpers');
const Listing = require('../models/listing');

mongoose.connect('mongodb://127.0.0.1:27017/stay-finder');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
});

const sample = array => array[Math.floor(Math.random() * array.length)];

const seedDB = async() =>{
    await Listing.deleteMany({});
    for(let i=0;i<50;i++){
        const random417 = Math.floor(Math.random() * 417 );
        const listing = new Listing({
            location: `${cities[random417].city}, ${cities[random417].state}`,
            title: `${sample(descriptors)} ${sample(places)}`
        })
        await listing.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})