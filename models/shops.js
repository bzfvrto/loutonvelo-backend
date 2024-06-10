const mongoose = require("mongoose");

const addressSchema = new mongoose.Schema({
    housenumber: {
        type: Number,
        required: false,
    },
    street: {
        type: String,
        required: false,
    },
    city: {
        type: String,
        required: true,
    },
    postcode: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
});

const ShopSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            maxLength: [100, "Name cannot be more than 100 characters"],
        },
        description: {
            type: String,
            required: false,
            trim: true,
        },
        website: {
            type: String,
            required: false,
        },
        address: {
            type: addressSchema,
            required: true,
        },
        user: {
            type: mongoose.Schema.Types.ObjectId,
            refs: "users",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

const Shop = mongoose.model("shops", ShopSchema);

module.exports = Shop;
