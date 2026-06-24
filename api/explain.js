const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

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
};