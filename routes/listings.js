const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');
const Listing = require('../models/listing');
const {listingSchema, reviewSchema} = require('../schemas.js');

const {isLoggedIn} = require('../Middleware.js');

const validateListing = (req,res,next)=>{
    //validating Schema/ Data on server side using joi, in a middleware
    const { error } = listingSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    } else{
        next();
    }
}

router.get('/', catchAsync(async (req,res)=>{
    const allStays = await Listing.find({});
    res.render('listings/index', {allStays});
}));

router.post('/',isLoggedIn, validateListing, catchAsync(async (req,res,next)=>{
    // if(!req.body.listing) throw new ExpressError('Invalid Listing Data',400);
    const listing = new Listing(req.body.listing);
    await listing.save();
    req.flash('success', 'Successfully created a new listing!');
    res.redirect(`/listings/${listing._id}`);
}))


router.get('/new', isLoggedIn, (req,res)=>{
    res.render('listings/new');
});

router.get('/:id', catchAsync(async (req,res)=>{
    const listing = await Listing.findById(req.params.id).populate('reviews');
    if(!listing){
        req.flash('error','Cannot find the listing!');
        return res.redirect('/listings');
    }
    res.render('listings/show',{ listing });
}));

router.get('/:id/edit',isLoggedIn, catchAsync(async (req,res)=>{
    const listing = await Listing.findById(req.params.id);
    if(!listing){
        req.flash('error','Cannot find the listing!');
        return res.redirect('/listings');
    }
    res.render('listings/edit',{ listing });
}));

router.put('/:id',isLoggedIn, validateListing, catchAsync(async (req,res)=>{
    const {id} = req.params;
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash('success', 'Successfully updated listing');
    res.redirect(`/listings/${listing._id}`);
}));

router.delete('/:id',isLoggedIn, catchAsync(async (req,res)=>{
    const {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success','Successfully deleted listing!');
    res.redirect('/listings');
}));

module.exports = router;