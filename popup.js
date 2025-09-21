document.addEventListener("DOMContentLoaded", function () {
  const urlInput = document.getElementById("current-url");
  const generateBtn = document.getElementById("generate-btn");
  const downloadBtn = document.getElementById("download-btn");
  const qrContainer = document.getElementById("qr-code");
  const status = document.getElementById("status");
  let currentUrl = "";

  function checkQRCodeLibrary() {
    return typeof qrcode !== "undefined";
  }

  function isRestrictedScheme(u) {
    try {
      return [
        "about:",
        "moz-extension:",
        "chrome:",
        "chrome-extension:",
        "resource:",
      ].some((s) => u.startsWith(s));
    } catch (e) {
      return true;
    }
  }

  function getSafeTabUrl(tab) {
    const u = tab.pendingUrl || tab.url || "";
    if (!u) return "";
    if (isRestrictedScheme(u)) return "";
    return u;
  }

  function getCurrentTabUrl() {
    return new Promise((resolve, reject) => {
      const api = typeof browser !== "undefined" ? browser : chrome;
      api.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (api.runtime.lastError) {
          reject(new Error(api.runtime.lastError.message));
          return;
        }
        if (!tabs || tabs.length === 0) {
          reject(new Error("No active tab found"));
          return;
        }
        const tab = tabs[0];
        const safe = getSafeTabUrl(tab);
        if (safe) {
          resolve(safe);
          return;
        }
        reject(new Error("This page's URL is restricted or unavailable"));
      });
    });
  }

  function normalizeUrlForQR(u) {
    try {
      const urlObj = new URL(u);
      urlObj.hash = "";
      return urlObj.toString();
    } catch (e) {
      return u;
    }
  }

  function generateQRCode(url) {
    try {
      if (!checkQRCodeLibrary()) {
        throw new Error(
          "QRCode library not loaded. Please check if qrcode.min.js is properly included.",
        );
      }
      if (!url || url.length === 0) {
        throw new Error("URL is empty or invalid");
      }

      qrContainer.innerHTML = "";

      const safeUrl = normalizeUrlForQR(url);

      const qr = qrcode(0, "M");
      qr.addData(safeUrl);
      qr.make();

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const moduleCount = qr.getModuleCount();
      const cellSize = 6;
      const margin = cellSize * 4;

      canvas.width = moduleCount * cellSize + margin * 2;
      canvas.height = moduleCount * cellSize + margin * 2;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#000000";
      for (let row = 0; row < moduleCount; row++) {
        for (let col = 0; col < moduleCount; col++) {
          if (qr.isDark(row, col)) {
            ctx.fillRect(
              margin + col * cellSize,
              margin + row * cellSize,
              cellSize,
              cellSize,
            );
          }
        }
      }

      qrContainer.appendChild(canvas);

      status.textContent = "QR code generated successfully!";
      status.className = "status success";
      downloadBtn.style.display = "inline-block";
    } catch (error) {
      status.textContent =
        "Error generating QR code: " +
        (error && error.message ? error.message : "Unknown error");
      status.className = "status error";
      console.error("QR generation error:", error);
    }
  }

  function downloadQRCode() {
    try {
      const canvas = qrContainer.querySelector("canvas");
      if (canvas) {
        const link = document.createElement("a");
        link.download = "qr-code-" + Date.now() + ".png";
        link.href = canvas.toDataURL("image/png");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        status.textContent = "QR code downloaded!";
        status.className = "status success";
      } else {
        throw new Error("No QR code canvas found");
      }
    } catch (error) {
      status.textContent = "Error downloading QR code: " + error.message;
      status.className = "status error";
      console.error("Download error:", error);
    }
  }

  async function init() {
    try {
      if (!checkQRCodeLibrary()) {
        status.textContent =
          "Error: QRCode library not loaded. Please check installation.";
        status.className = "status error";
        return;
      }
      status.textContent = "Loading current tab URL...";
      currentUrl = await getCurrentTabUrl();
      urlInput.value = currentUrl;
      status.textContent = "Ready to generate QR code";
      status.className = "status";
    } catch (error) {
      status.textContent =
        "Error getting current tab URL: " +
        (error && error.message ? error.message : "Unknown error");
      status.className = "status error";
      console.error("Init error:", error);
    }
  }

  generateBtn.addEventListener("click", function () {
    if (currentUrl) {
      generateQRCode(currentUrl);
    } else {
      status.textContent = "No URL available to generate QR code";
      status.className = "status error";
    }
  });

  downloadBtn.addEventListener("click", downloadQRCode);

  init();
});
