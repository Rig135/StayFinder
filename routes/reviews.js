const express = require('express');
const router = express.Router({ mergeParams: true}); //routers get different params so we dont have access to listing id


const catchAsync = require('../utils/catchAsync');
const ExpressError = require('../utils/ExpressError');

const Listing = require('../models/listing');
const {reviewSchema} = require('../schemas.js');
const Review = require('../models/review.js');


const validateReview = (req,res,next)=> {
    // validating Review Data on server side using joi,in a middleware
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    } else{
        next();
    }
}

router.post('/', validateReview, catchAsync(async(req,res)=>{
    const listing = await Listing.findById(req.params.id);
    const review = new Review(req.body.review);
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    req.flash('success','Created new review!');
    res.redirect(`/listings/${listing._id}`);
}));

router.delete('/:reviewId', catchAsync(async(req,res)=>{
    const {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});  //The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully deleted review!');
    res.redirect(`/listings/${id}`);
}));

 module.exports = router;