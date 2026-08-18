const {listingSchema, reviewSchema} = require('./schemas.js');
const ExpressError = require('./utils/ExpressError.js');
const Listing = require('./models/listing.js');
const Review = require('./models/review.js');


module.exports.isLoggedIn = (req,res,next)=>{
    if(!req.isAuthenticated()){
        //storing the url they were requesting before being sent to login page
        req.session.returnTo = req.originalUrl;
        req.flash('error','You must be signed in first!');
        return res.redirect('/login');
    }
    next();
}

module.exports.storeReturnTo = (req,res,next)=>{
    if(req.session.returnTo){
        res.locals.returnTo = req.session.returnTo;
    }

    next();
}

module.exports.validateListing = (req,res,next)=>{
    //validating Schema/ Data on server side using joi, in a middleware
    const { error } = listingSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    } else{
        next();
    }
}

// Author verification Middleware function
module.exports.isAuthor = async(req,res,next) =>{
    const {id} = req.params;
    const listing = await Listing.findById(id);

    if(!listing.author.equals(req.user._id)){
        req.flash('error', 'You do not have permissions for this task!');
        return res.redirect(`/listings/${id}`);
    }

    next();
}


module.exports.isReviewAuthor = async(req,res,next) =>{
    const { id, reviewId} = req.params;
    const review = await Review.findById(reviewId);

    if(!review.author.equals(req.user._id)){
        req.flash('error', 'You do not have permissions for this task!');
        return res.redirect(`/listings/${id}`);
    }

    next();
}


module.exports.validateReview = (req,res,next)=> {
    // validating Review Data on server side using joi,in a middleware
    const {error} = reviewSchema.validate(req.body);
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg,400);
    } else{
        next();
    }
}
