const express = require('express');
const router = express.Router({ mergeParams: true}); //routers get different params so we dont have access to listing id


const catchAsync = require('../utils/catchAsync');

const Listing = require('../models/listing');
const Review = require('../models/review.js');

const {validateReview, isLoggedIn, isReviewAuthor} = require('../Middleware.js');

router.post('/',isLoggedIn, validateReview, catchAsync(async(req,res)=>{
    const listing = await Listing.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    listing.reviews.push(review);
    await review.save();
    await listing.save();
    req.flash('success','Created new review!');
    res.redirect(`/listings/${listing._id}`);
}));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(async(req,res)=>{
    const {id, reviewId} = req.params;
    await Listing.findByIdAndUpdate(id, {$pull: {reviews: reviewId}});  //The $pull operator removes from an existing array all instances of a value or values that match a specified condition.
    await Review.findByIdAndDelete(reviewId);
    req.flash('success','Successfully deleted review!');
    res.redirect(`/listings/${id}`);
}));

 module.exports = router;