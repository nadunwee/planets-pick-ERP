const axios = require("axios");

exports.predictFinances = async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5001/predict");
    res.json(response.data);
  } catch (err) {
    console.error("❌ AI prediction error:", err.message);
    res.status(500).json({ error: err.message });
  }
};
