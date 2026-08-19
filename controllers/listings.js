const Listing = require('../models/listing');

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
    const listing = new Listing(req.body.listing);
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
    const listing = await Listing.findByIdAndUpdate(id, { ...req.body.listing });
    req.flash('success', 'Successfully updated listing');
    res.redirect(`/listings/${listing._id}`);
};

module.exports.deleteListing = async (req,res)=>{
    const {id} = req.params;
    await Listing.findByIdAndDelete(id);
    req.flash('success','Successfully deleted listing!');
    res.redirect('/listings');
};