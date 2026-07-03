const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
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
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));


app.get('/',(req,res)=>{
    res.render('home');
});

app.get('/listings', async (req,res)=>{
    const allStays = await Listing.find({});
    res.render('listings/index', {allStays});
});

app.post('/listings', async (req,res)=>{
    const listing = new Listing(req.body.listing);
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
})


app.get('/listings/new', (req,res)=>{
    res.render('listings/new');
});

app.get('/listings/:id', async (req,res)=>{
    const listing = await Listing.findById(req.params.id);
    res.render('listings/show',{ listing });
});

app.get('/listings/:id/edit', async (req,res)=>{
    const listing = await Listing.findById(req.params.id);
    res.render('listings/edit',{ listing });
});

app.put('/listings/:id', async (req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${listing._id}`);
})

app.delete('/listings/:id', async (req,res)=>{
    const {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
})


app.listen(3000, ()=>{
    console.log("Serving on port 3000");
});