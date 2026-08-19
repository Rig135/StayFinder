const mongoose = require('mongoose');
const Review = require('./review');
const user = require('./user');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: String,
    images: [
        {   
            url: String,
            filename: String
        }
    ],
    price: Number,
    description: String,
    location: String,
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