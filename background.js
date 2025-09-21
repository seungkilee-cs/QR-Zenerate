browser.runtime.onInstalled.addListener(() => {
  console.log("QR Zenerate extension installed");
});

browser.contextMenus.create({
  id: "generate-qr",
  title: "Generate QR Code for this page",
  contexts: ["page"],
});

browser.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "generate-qr") {
    browser.browserAction.openPopup();
  }
});
