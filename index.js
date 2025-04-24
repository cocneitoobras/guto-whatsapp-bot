const express = require("express");
const axios = require("axios");
require("dotenv").config();

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/webhook", async (req, res) => {
  const message = req.body.message?.body;
  const sender = req.body.message?.from;

  if (!message || !sender) return res.sendStatus(200);

  console.log("Mensagem recebida:", message);

  const prompt = `Responda como se fosse o Guto, corretor e dono de construtora, direto, educado, simpático. Mensagem recebida: "${message}"`;

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-3.5-turbo",
        messages: [{ role: "user", content: prompt }],
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        },
      }
    );

    const reply = response.data.choices[0].message.content;

    await axios.post(`${process.env.ZAPI_INSTANCE}/send-message`, {
      phone: sender,
      message: reply,
    }, {
      headers: {
        "Content-Type": "application/json",
        "apikey": process.env.ZAPI_TOKEN,
      }
    });

    res.sendStatus(200);
  } catch (error) {
    console.error("Erro ao responder:", error.message);
    res.sendStatus(500);
  }
});

app.get("/", (req, res) => res.send("GutoBot está rodando!"));
app.listen(PORT, () => console.log(`Rodando na porta ${PORT}`));