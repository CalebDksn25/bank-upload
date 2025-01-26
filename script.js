// Trigger the hidden file input when the upload button is clicked
document.getElementById("upload-button").addEventListener("click", () => {
  document.getElementById("file-input").click();
});

// Handle the file selection and upload
document
  .getElementById("file-input")
  .addEventListener("change", async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const strategy = document.getElementById("optionsDropdown").value;
    if (!strategy) {
      alert("Please select an investment strategy!");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("investment_strategy", strategy);

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

      // Store the LLM data in localStorage
      if (data.llm_data) {
        localStorage.setItem("llmData", JSON.stringify(data.llm_data));
      }

      // Display upload success message
      document.getElementById("uploaded-file").innerHTML = `
        <a href="#" onclick="downloadFile()">File Uploaded Successfully</a>
        <button class="delete-button" onclick="deleteFile()">Delete</button>
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
