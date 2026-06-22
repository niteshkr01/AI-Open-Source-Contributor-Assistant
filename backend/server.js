const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { GoogleGenerativeAI } = require("@google/generative-ai");

const app = express();

app.use(cors());
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.post("/explain", async (req, res) => {
  try {
    const { issue } = req.body;

    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
    });

    const result = await model.generateContent(
      `Explain this GitHub issue in simple terms for a beginner developer in 5-6 short lines:

${issue}`
    );

    const text = result.response.text();

    res.json({
      explanation: text,
    });

  } catch (error) {
    console.log(error);

    res.status(500).json({
      error: "Gemini explanation failed",
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});