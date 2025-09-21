document.addEventListener("DOMContentLoaded", function () {
  const urlInput = document.getElementById("current-url");
  const generateBtn = document.getElementById("generate-btn");
  const downloadBtn = document.getElementById("download-btn");
  const qrContainer = document.getElementById("qr-code");
  const status = document.getElementById("status");

  let qrCode = null;
  let currentUrl = "";

  function getCurrentTabUrl() {
    return new Promise((resolve, reject) => {
      browser.tabs
        .query({ active: true, currentWindow: true })
        .then((tabs) => {
          if (tabs.length > 0) {
            resolve(tabs[0].url);
          } else {
            reject(new Error("No active tab found"));
          }
        })
        .catch(reject);
    });
  }

  function generateQRCode(url) {
    try {
      // clear previous QR code if any
      qrContainer.innerHTML = "";

      // generate new qr code
      qrCode = new QRCode(qrContainer, {
        text: url,
        width: 200,
        height: 200,
        colorDark: "#000000",
        colorLight: "#ffffff",
        correctLevel: QRCode.CorrectLevel.M,
      });

      status.textContent = "QR code generated successfully!";
      status.className = "status success";
      downloadBtn.style.display = "inline-block";
    } catch (error) {
      status.textContent = "Error generating QR code: " + error.message;
      status.className = "status error";
      console.error("QR generation error:", error);
    }
  }

  function downloadQRCode() {
    try {
      const canvas = qrContainer.querySelector("canvas");
      if (canvas) {
        const link = document.createElement("a");
        link.download = "qr-code.png";
        link.href = canvas.toDataURL();
        link.click();

        status.textContent = "QR code downloaded!";
        status.className = "status success";
      }
    } catch (error) {
      status.textContent = "Error downloading QR code: " + error.message;
      status.className = "status error";
    }
  }

  // initialize the popup
  async function init() {
    try {
      status.textContent = "Loading current tab URL...";
      currentUrl = await getCurrentTabUrl();
      urlInput.value = currentUrl;
      status.textContent = "Ready to generate QR code";
      status.className = "status";
    } catch (error) {
      status.textContent = "Error getting current tab URL: " + error.message;
      status.className = "status error";
      console.error("Init error:", error);
    }
  }

  // event listeners
  generateBtn.addEventListener("click", function () {
    if (currentUrl) {
      generateQRCode(currentUrl);
    } else {
      status.textContent = "No URL available to generate QR code";
      status.className = "status error";
    }
  });

  downloadBtn.addEventListener("click", downloadQRCode);

  // initialize the popup when DOM is loaded
  init();
});
