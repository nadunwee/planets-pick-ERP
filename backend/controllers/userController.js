const jwt = require("jsonwebtoken");

const User = require("../models/userModel.js");
const { log } = require("console");

const createToken = (_id) => {
  return jwt.sign({ _id }, process.env.SECRET);
};

async function loginUser(req, res) {
  const { email, password } = req.body;

  try {
    const user = await User.login(email, password);
    // create a token
    const name = user.name;
    const token = createToken(user._id);
    const type = user.type;
    console.log(type);
    res.status(200).json({ email, token, name, type });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

// Get all users
async function getAllUsers(req, res) {
  try {
    const items = await User.find();
    res.status(200).json(items);
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
}

async function editUserApproval(req, res) {
  const { id } = req.params;
  const { approved } = req.body; // expected: true, false, or "rejected"

  try {
    const user = await User.findByIdAndUpdate(id, { approved }, { new: true });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.status(200).json(user);
  } catch (error) {
    console.error("Error updating user approval:", error);
    res.status(500).json({ error: "Failed to update user approval" });
  }
}

// const registerUser = async (req, res) => {
//   const { name, email, password } = req.body;
//   const date = await User.findOne({ email });

//   try {
//     const user = await User.register(name, email, password);
//     // create a token
//     const token = createToken(user._id);
//     res.status(200).json({ name, email, token });
//   } catch (error) {
//     res.status(400).json({ error: error.message });
//   }
// };

// const deleteUser = async (req, res) => {
//   const { id } = req.params;

//   if (!mongoose.Types.ObjectId.isValid(id)) {
//     return res
//       .status(400)
//       .json({ error: "NO such a contact (mongoose ID is invalid)" });
//   }

//   const user = await User.findOneAndDelete({ _id: id });

//   if (!user) {
//     return res
//       .status(400)
//       .json({ error: "NO such a contact (contact ID is invalid)" });
//   }

//   res.status(200).json(user);
// };

module.exports = { loginUser, getAllUsers, editUserApproval };
