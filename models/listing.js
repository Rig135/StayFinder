const mongoose = require('mongoose');
const Review = require('./review');
const user = require('./user');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
    url: String,
    filename: String
});

ImageSchema.virtual('thumbnail').get(function(){
    return this.url.replace('/upload', '/upload/w_200');
})

const opts = { toJSON: { virtuals: true } };

const listingSchema = new Schema({
    title: String,
    images: [ ImageSchema ],
    price: Number,
    description: String,
    location: String,
    geometry: {
        type: {
            type: String,
            enum: ['Point'],    //type must be Point
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review'       //reference to Review model
        }
    ]
}, opts);

listingSchema.virtual('properties.popUpMarkup').get(function () {
    return `
    <strong><a href="/listings/${this._id}">${this.title}</a></strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

listingSchema.post('findOneAndDelete', async function(doc){     //doc -> document that was deleted is passed in
    if(doc){
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        })
    }
})

module.exports = mongoose.model('Listing', listingSchema);