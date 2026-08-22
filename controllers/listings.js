const Listing = require('../models/listing');
const {cloudinary} = require('../cloudinary');

const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req,res)=>{
    const allStays = await Listing.find({});
    res.render('listings/index', {allStays});
};

module.exports.renderNewForm = (req,res)=>{
    res.render('listings/new');
};

module.exports.renderEditForm = async (req,res)=>{
    const listing = await Listing.findById(req.params.id);
    if(!listing){
        req.flash('error','Cannot find the listing!');
        return res.redirect('/listings');
    }
    res.render('listings/edit',{listing});
};

module.exports.createListing = async (req,res,next)=>{


    const geoData = await maptilerClient.geocoding.forward(req.body.listing.location, { limit: 1 });
    console.log(geoData);
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect('/listings/new');
    }

    const listing = new Listing(req.body.listing);
    //adding geoLocation and location on 
    listing.geometry = geoData.features[0].geometry;
    listing.location = geoData.features[0].place_name;
    listing.images = req.files.map(f => ({url: f.path, filename: f.filename}));
    listing.author = req.user._id;
    await listing.save();
    console.log(listing);
    req.flash('success', 'Successfully created a new listing!');
    res.redirect(`/listings/${listing._id}`);
};

module.exports.showListing = async (req,res)=>{
    const listing = await Listing.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author'
        }
    }).populate('author');   //populating reviews and author fields

    if(!listing){
        req.flash('error','Cannot find the listing!');
        return res.redirect('/listings');
    }
    res.render('listings/show',{ listing });
};

module.exports.updateListing = async (req,res)=>{
    const {id} = req.params;

    const geoData = await maptilerClient.geocoding.forward(req.body.listing.location, { limit: 1 });
    // console.log(geoData);
    if (!geoData.features?.length) {
        req.flash('error', 'Could not geocode that location. Please try again and enter a valid location.');
        return res.redirect(`/listings/${id}/edit`);
    }

    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });

    listing.geometry = geoData.features[0].geometry;
    listing.location = geoData.features[0].place_name;

    const imgs = req.files.map(f => ({url: f.path, filename: f.filename}))
    listing.images.push(...imgs);
    await listing.save();

    //deleting the images checked as delete, stored in deleteImages[] array
    if(req.body.deleteImages){
        for(let filename of req.body.deleteImages){
            await cloudinary.uploader.destroy(filename);
        }
        await listing.updateOne({$pull: {images: {filename: {$in: req.body.deleteImages}}}})
    }

    req.flash('success', 'Successfully updated listing');
    res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteListing = async (req,res)=>{
    const {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success','Successfully deleted listing!');
    res.redirect('/listings');
};