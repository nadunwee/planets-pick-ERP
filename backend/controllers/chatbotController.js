const axios = require("axios");

exports.chat = async (req, res) => {
  try {
    const { message, metrics } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }
    
    const response = await axios.post("http://localhost:5001/chatbot", {
      message,
      metrics
    });
    
    res.json(response.data);
  } catch (err) {
    console.error("❌ AI chatbot error:", err.message);
    
    // Return a fallback response if AI service is unavailable
    res.json({
      success: true,
      response: null, // Let frontend handle with its built-in responses
      predictions: []
    });
  }
};
