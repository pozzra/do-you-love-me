     // Get references to all input fields, the dropdown, and the buttons
     const inputs = document.querySelectorAll('input[type="text"], input[type="number"]');
     const genderDropdown = document.getElementById("gender");
     const yesButton = document.querySelector('.yes');
     const noButton = document.querySelector('.no');

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
     function handleYes() {
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

       // Save data to localStorage
       const userData = { username, gender, age, phone };
       localStorage.setItem("userData", JSON.stringify(userData));

       // Redirect to loveme.html
       window.location.href = "loveme.html";
     }

     // Get reference to the "NO" button
     const noButtonRef = document.querySelector('.no');

     // Function to generate random coordinates within the viewport
     function getRandomPosition() {
       const windowWidth = window.innerWidth;
       const windowHeight = window.innerHeight;

       // Generate random X and Y positions
       const randomX = Math.random() * (windowWidth - noButtonRef.offsetWidth);
       const randomY = Math.random() * (windowHeight - noButtonRef.offsetHeight);

       return { x: randomX, y: randomY };
     }

     // Add event listener to move the button on hover
     noButtonRef.addEventListener('mouseenter', () => {
       const { x, y } = getRandomPosition();
       noButtonRef.style.position = 'absolute';
       noButtonRef.style.left = `${x}px`;
       noButtonRef.style.top = `${y}px`;
     });
      // Automatically update the copyright year
      const currentYear = new Date().getFullYear();
      const copyrightElement = document.getElementById("copyright");
      if (copyrightElement) {
        copyrightElement.textContent = `© ${currentYear} Do You Love Me? All rights reserved.`;
      }
     