// Trigger the hidden file input when the upload button is clicked
document.getElementById("upload-button-1").addEventListener("click", () => {
  document.getElementById("file-input").click();
});

// Handle the file selection and upload
document
  .getElementById("file-input")
  .addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const dropdown = document.getElementById("optionsDropdown");
    const strategy = dropdown.value; // Use value instead of text
    if (!strategy) {
      alert("Please select an investment strategy!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("investment_strategy", strategy); // Append the selected strategy value

    // Show the loading spinner
    document.getElementById("loading-spinner").style.display = "block";

    try {
      const response = await fetch(
        "http://127.0.0.1:8000/upload-bank-statement",
        {
          method: "POST",
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Upload successful:", data);

      // Store the LLM data and investment strategy in localStorage
      if (data.llm_data) {
        localStorage.setItem("llmData", JSON.stringify(data.llm_data));
      }
      if (data.investment_strategy) {
        // Added storing investment_strategy
        localStorage.setItem("investment_strategy", data.investment_strategy);
      }

      // Display upload success message
      document.getElementById("uploaded-file").innerHTML = `
        <a href="#" onclick="downloadFile()">File Uploaded Successfully</a>
        <button class="delete-button" onclick="deleteFile()">X</button>
      `;

      // Enable the "Get Analysis" button
      document.getElementById("next-page-button").disabled = false;
    } catch (error) {
      console.error("Error uploading file:", error);
      alert("There was an error uploading your file. Please try again.");
    } finally {
      // Hide the loading spinner
      document.getElementById("loading-spinner").style.display = "none";
    }
  });

// Handle the "Get Analysis" button click to navigate to result.html
document
  .getElementById("next-page-button")
  .addEventListener("click", (event) => {
    event.preventDefault(); // Prevent form submission
    window.location.href = "result.html";
  });

// Optional: Implement downloadFile and deleteFile functions as needed
document
  .getElementById("optionsDropdown")
  .addEventListener("change", function () {
    const selectedValue = this.value;

    console.log("Selected value:", selectedValue);
  });
