require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const userRoutes = require("./routes/user.js");

const app = express();

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
