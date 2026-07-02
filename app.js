const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const Listing = require('./models/listing');


mongoose.connect('mongodb://127.0.0.1:27017/stay-finder');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
});

const app = express();


app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));


app.get('/',(req,res)=>{
    res.render('home');
})

app.get('/makelisting',async (req,res)=>{
    const stay = new Listing({title: 'My Attic',price: '1500', description: 'cheap Stay!'});
    await stay.save();
    res.send(stay);
})


app.listen(3000, ()=>{
    console.log("Serving on port 3000");
})