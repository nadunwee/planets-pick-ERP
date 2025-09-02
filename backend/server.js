require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const userRoutes = require("./routes/user.js");

const app = express();

//Access to fetch at 'http://localhost:4000/register' from origin 'http://localhost:5173' has been blocked by CORS policy
app.use(cors());

// middleware
app.use(express.json()); // <-- parse JSON request body
app.use((req, res, next) => {
  console.log(`Server js ${req.path}, ${req.method}`);
  next();
});

// routes
app.use("/api/user", userRoutes);

// Connect to database
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log("Connected to DB and listening on port", process.env.PORT);
    });
  })
  .catch((error) => {
    console.log(error);
  });
