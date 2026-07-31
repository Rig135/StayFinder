const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const listingSchema = new Schema({
    title: String,
    image: String,
    price: Number,
    description: String,
    location: String,
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