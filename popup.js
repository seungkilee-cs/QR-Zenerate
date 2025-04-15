document.addEventListener("DOMContentLoaded", () => {
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    const url = tabs[0].url;
    const qrCodeElement = document.getElementById("qrcode");
    new QRCode(qrCodeElement, {
      text: url,
      width: 128,
      height: 128,
    });
  });
});
