const Joi = require('joi');
//validating Schema/ Data on server side using joi, in a middleware
module.exports.listingSchema  = Joi.object({
        listing: Joi.object({
            title: Joi.string().required(),
            price: Joi.number().required().min(0),
            image: Joi.string().required(),
            location: Joi.string().required(),
            description: Joi.string().required()
        }).required()
    })