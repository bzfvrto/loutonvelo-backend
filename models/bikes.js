const mongoose = require("mongoose");

const PictureSchema = mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
});

const BikeSchema = mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            maxLength: [100, "Name cannot be more than 100 characters"],
        },
        brand: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "brands",
        },
        model: {
            type: String,
            required: true,
        },
        seats: {
            type: Number,
            required: true,
            default: 1,
        },
        availability: {
            type: String,
            enum: ["available", "unavailable", "reserved", "under_reparation"],
        },
        pictures: {
            type: [PictureSchema],
        },
        year: {
            type: Date,
            required: true,
            default: Date.now.year,
        },
        color: {
            type: String,
            required: false,
        },
        description: {
            type: String,
            required: false,
            trim: true,
        },
        externalLink: {
            type: String,
            required: false,
        },
        floorPrice: {
            type: Number,
            required: false,
        },
        pricePerHour: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

const Bike = mongoose.model("bikes", BikeSchema);

module.exports = Bike;
