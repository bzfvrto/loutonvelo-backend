var express = require("express");
const User = require("../models/users");
var router = express.Router();
const bcrypt = require("bcrypt");

/* GET users listing. */
router.get("/", function (req, res, next) {
    res.send("respond with a resource");
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(req.body);
    const user = await User.findOne({ email: email })
        .select("password")
        .select("email")
        .select("role")
        .select("firstName")
        .select("lastName");
    console.log("user", user);
    if (!user || !bcrypt.compareSync(password, user.password)) {
        return res.sendStatus(401);
    }
    user.username = `${user.firstName} ${user.lastName}`;
    return res.json({ data: { result: true, user: user } });
});

router.post("/register", async (req, res) => {
    const { firstName, lastName, email, password } = req.body;
    const user = await User.findOne({ email: email });
    if (user) {
        return res.sendStatus(409);
    }

    const newUser = new User({
        firstName,
        lastName,
        email,
        password: bcrypt.hashSync(password, 10),
    });

    const createdUser = await newUser.save();

    return res.json({ data: { result: true, user: createdUser } });
});

router.put("/update-account", async (req, res) => {
    const { userId } = req.body;
    console.log(userId);
    const updatedUser = await User.findOneAndUpdate({ _id: userId }, { role: "reseller" });
    console.log(updatedUser);
    return res.json({ data: { result: true, user: updatedUser } });
});

module.exports = router;
