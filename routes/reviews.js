const express = require('express');
const router = express.Router({ mergeParams: true}); //routers get different params so we dont have access to listing id


const catchAsync = require('../utils/catchAsync');

const Listing = require('../models/listing');
const Review = require('../models/review.js');

const reviewController = require('../controllers/reviews.js');

const {validateReview, isLoggedIn, isReviewAuthor} = require('../Middleware.js');

router.post('/',isLoggedIn, validateReview, catchAsync(reviewController.createReview));

router.delete('/:reviewId', isLoggedIn, isReviewAuthor, catchAsync(reviewController.deleteReview));

 module.exports = router;