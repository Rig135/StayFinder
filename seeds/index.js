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
        const price = Math.floor(Math.random() * 4000) + 1000;
        // const imageId = Math.floor(Math.random() * 1000);

        const listing = new Listing({
            title: `${sample(descriptors)} ${sample(places)}`,
            author: '6a79fbb58697f5dcc4d7d89e',     //default author of every listing
            location: `${cities[random417].city}, ${cities[random417].state}`,
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random417].longitude,
                    cities[random417].latitude,
                ]
            },
            // image: `https://picsum.photos/400?random=${Math.random()}`,
            // image: `https://picsum.photos/id/${imageId}/400/300`,

            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Unde iure odio modi officia, reiciendis non eius doloremque placeat corrupti ex numquam? Sed, in! Vitae libero cum dolore atque pariatur iste.',
            price: price,
            images: [
                {
                    url: 'https://res.cloudinary.com/enrlyidw/image/upload/v1787146970/StayFinder/xvdjw4zyvwy5ldwnfzfz.png',
                    filename: 'StayFinder/xvdjw4zyvwy5ldwnfzfz'
                },
                {
                    url: 'https://res.cloudinary.com/enrlyidw/image/upload/v1787146972/StayFinder/bzdqkalz2u6a7sggzxod.png',
                    filename: 'StayFinder/bzdqkalz2u6a7sggzxod'
                }
            ]
        })
        await listing.save();
    }
}

seedDB().then(()=>{
    mongoose.connection.close();
})