"use strict";

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.startsWith("blob")) {
    console.log("RECEIVED");
    sendResponse(message);
  }
});
