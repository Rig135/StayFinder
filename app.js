const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const catchAsync = require('./utils/catchAsync');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const Listing = require('./models/listing');


mongoose.connect('mongodb://127.0.0.1:27017/stay-finder');
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", ()=>{
    console.log("Database connected");
});

const app = express();


app.engine('ejs',ejsMate);
app.set('view engine','ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({extended:true}));
app.use(methodOverride('_method'));


app.get('/',(req,res)=>{
    res.render('home');
});

app.get('/listings', catchAsync(async (req,res)=>{
    const allStays = await Listing.find({});
    res.render('listings/index', {allStays});
}));

app.post('/listings', catchAsync(async (req,res,next)=>{
    const listing = new Listing(req.body.listing);
    await listing.save();
    res.redirect(`/listings/${listing._id}`);
}))


app.get('/listings/new', (req,res)=>{
    res.render('listings/new');
});

app.get('/listings/:id', catchAsync(async (req,res)=>{
    const listing = await Listing.findById(req.params.id);
    res.render('listings/show',{ listing });
}));

app.get('/listings/:id/edit', catchAsync(async (req,res)=>{
    const listing = await Listing.findById(req.params.id);
    res.render('listings/edit',{ listing });
}));

app.put('/listings/:id', catchAsync(async (req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    res.redirect(`/listings/${listing._id}`);
}));

app.delete('/listings/:id', catchAsync(async (req,res)=>{
    const {id} = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect('/listings');
}));

app.use((err,req,res,next)=>{
    res.send("Oh boy, something went wrong!");
})


app.listen(3000, ()=>{
    console.log("Serving on port 3000");
});