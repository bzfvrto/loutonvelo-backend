const mongoose = require("mongoose");

const UserSchema = mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        select: false,
        trim: true,
        validate: {
            validator: (val) =>
                /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|.(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
                    val
                ),
            message: ({ value }) => `${value} is not a valid email.`,
        },
    },
    password: {
        type: String,
        select: false,
        // this = document
        required: () => this.status !== "pending",
    },
    type: {
        type: String,
        enum: ["admin", "reseller", "user"],
        default: "user",
        required: true,
    },
    timestamps: true,
});

// UserSchema.post("deleteOne", async function () {
//     // this = request / query

//     const userId = this.getFilter()._id;
//     console.log("Post middleware", userId);
//     await Post.deleteMany({ user: userId });
//     await Comment.deleteMany({ user: userId });
// });

const User = mongoose.model("users", userSchema);

module.exports = User;
