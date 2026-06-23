const express = require("express");
const cors = require("cors");
require("dotenv").config();
const Groq = require("groq-sdk");

const app = express();

app.use(cors());
app.use(express.json());

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

app.get("/", (req, res) => {
  res.send("Backend is running");
});

app.post("/explain", async (req, res) => {
  try {
    const { issue } = req.body;

    const response = await groq.chat.completions.create({
     model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: `Explain this GitHub issue in simple terms for a beginner developer in 5-6 short lines:\n\n${issue}`,
        },
      ],
    });

    const text = response.choices[0].message.content;

    res.json({ explanation: text });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "AI explanation failed" });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});