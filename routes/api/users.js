const express = require("express");
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");
const { check, validationResult } = require("express-validator");

// @route   POST api/users
//@desc     create a new user with post
//@access   Public

const User = require("../../models/User");

router.post(
  "/",
  [
    check("name", "Please enter name").not().isEmpty(),
    check("email", "Please enter valid email").isEmail(),
    check(
      "password",
      "Please enter valid password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;

    try {
      //Check if user already exists
      let user = await User.findOne({ email });
      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      //Get the users gravatar
      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      //CREATE THE USER
      user = new User({
        name,
        email,
        password,
        avatar,
      });

      //Use brcrypt to hash sensitive information
      //HASH THE PASSWORD
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
      //SAVE THE USER IN DB
      await user.save();

      //GET THE PAYLOAD INCLUDING THE USER ID
      const payload = {
        user: {
          id: user.id,
        },
      };

      //return jsonwebtoken to frontend to get user logged in right away
      jwt.sign(
        payload,
        config.get("jwtToken"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          //IF NO ERROR WE SEND TOKEN BACK TO CLIENT
          res.json({ token });
        }
      );
    } catch (err) {
      console.log(err.message);
      res.status(500).send("Server error");
    }
  }
);

module.exports = router;
