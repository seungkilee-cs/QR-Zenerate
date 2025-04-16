document.addEventListener("DOMContentLoaded", () => {
  const qrCodeElement = document.getElementById("qrcode");
  const urlInput = document.getElementById("urlInput");
  const generateBtn = document.getElementById("generateBtn");

  function generateQRCode(url) {
    // Clear previous QR code
    qrCodeElement.innerHTML = "";
    new QRCode(qrCodeElement, {
      text: url,
      width: 128,
      height: 128,
    });
  }

  // Optionally, pre-fill with current tab's URL if running as extension
  if (window.browser && browser.tabs) {
    browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
      const currentUrl = tabs[0].url;
      urlInput.value = currentUrl;
      generateQRCode(currentUrl);
    });
  } else {
    // Standalone: Optionally set a default value
    urlInput.value = "";
  }

  generateBtn.addEventListener("click", () => {
    if (urlInput.validity.valid && urlInput.value.trim() !== "") {
      generateQRCode(urlInput.value.trim());
    } else {
      alert("Please enter a valid URL.");
    }
  });
});
