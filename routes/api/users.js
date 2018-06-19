const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const passport = require("passport");
//load User model
const User = require("../../models/User");

//get secret key
const keys = require("../../config/keys");

//@router   Get api/users/test
//@desc     Test User router
//@access   Public
router.get("/test", (req, res) => res.json({ msg: "Users Works" }));

//@router   Post api/users/register
//@desc     Register User router
//@access   Public
router.post("/register", (req, res) => {
  User.findOne({ email: req.body.email }).then(user => {
    if (user) {
      return res.status(400).json({ email: "Email is already exist" });
    } else {
      const avatar = gravatar.url(req.body.email, {
        s: "200", //Size
        r: "pg", //Rating
        d: "mm" //Default
      });

      const newUser = new User({
        name: req.body.name,
        email: req.body.email,
        avatar: avatar,
        password: req.body.password
      });

      bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
          if (err) throw err;
          newUser.password = hash;
          newUser
            .save() // this come from mongoose
            .then(user => res.json(user)) // this is the promis
            .catch(err => console.log(err));
        });
      });
    }
  });
});

//@router   Post api/users/login
//@desc     Login User router
//@access   Public
router.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  User.findOne({ email }) // email : email but can write only email with es6
    .then(user => {
      // callback with promis
      //Check for User
      if (!user) {
        return res.status(404).json({ email: "user not found" });
      }

      // Check for password
      bcrypt.compare(password, user.password).then(isMatch => {
        if (isMatch) {
          // res.json({ msg: "Success" });
          const payload = { id: user.id, name: user.name, avatar: user.avatar };
          jwt.sign(
            payload,
            keys.secretOrKey,
            { expiresIn: 3600 },
            (err, token) => {
              res.json({
                success: true,
                token: "Bearer " + token
              });
            }
          );
        } else {
          return res.status(400).json({ password: "Password incorrect" });
        }
      });
    });
});

//@router   Get api/users/current
//@desc     Return current User
//@access   Private
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    // res.json({ msg: "Success" });
    // res.json(req.user);
    res.json({
      id: req.user.id,
      name: req.user.name,
      email: req.user.email
    });
  }
);

module.exports = router;
