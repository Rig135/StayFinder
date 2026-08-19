const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const Listing = require('../models/listing');

const listingController = require('../controllers/listings.js');

const {isLoggedIn, validateListing, isAuthor} = require('../Middleware.js');

const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });


router.get('/', catchAsync(listingController.index));

router.post('/',isLoggedIn, upload.array('image') ,validateListing, catchAsync(listingController.createListing));


router.get('/new', isLoggedIn, listingController.renderNewForm);

router.get('/:id', catchAsync(listingController.showListing));

router.get('/:id/edit',isLoggedIn, isAuthor, catchAsync(listingController.renderEditForm));

router.put('/:id',isLoggedIn,isAuthor, validateListing, catchAsync(listingController.updateListing));

router.delete('/:id',isLoggedIn,isAuthor, catchAsync(listingController.deleteListing));

module.exports = router;