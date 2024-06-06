const mongoose = require("mongoose");

const BrandSchema = mongoose.Schema({
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
    timestamps: true,
});

const Brand = mongoose.model("brands", BrandSchema);

module.exports = Brand;
