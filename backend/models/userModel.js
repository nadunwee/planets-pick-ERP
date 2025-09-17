const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcrypt");

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    level: {
      type: String,
      default: "", // start blank
    },
    role: {
      type: String,
      required: true,
    },
    approved: {
      type: Boolean,
      default: false, // always start unapproved
    },
  },
  { timestamps: true }
);

// static register method
userSchema.statics.register = async function ({
  name,
  email,
  password,
  department,
  role,
  approved = false,
  level = "",
}) {
  // validation
  if (!email || !password || !name || !department || !role) {
    throw Error("All required fields must be filled");
  }
  if (!validator.isEmail(email)) {
    throw Error("Email is not valid");
  }

  const exists = await this.findOne({ email });
  if (exists) {
    throw Error("Email already in use");
  }

  // hash password
  // const salt = await bcrypt.genSalt(10);
  // const hash = await bcrypt.hash(password, salt);

  // create user
  const user = await this.create({
    name,
    email,
    password: password,
    department,
    role,
    approved,
    level,
  });

  return user;
};

// static login method
userSchema.statics.login = async function (email, password) {
  if (!email || !password) {
    throw Error("All fields must be filled");
  }

  const user = await this.findOne({ email });
  if (!user) {
    throw Error("Incorrect Email");
  }

  // const match = await bcrypt.compare(password, user.password);
  // if (!match) {
  //   throw Error("Incorrect Password");
  // }

  return user;
};

module.exports = mongoose.model("User", userSchema);
