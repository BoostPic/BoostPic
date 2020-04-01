"use strict";

const PicGo = require("picgo");
const picgo = new PicGo();

var imgUrl = "";

const uploadState = [
  "  Image uploading .",
  "  Image uploading ..",
  "  Image uploading ..."
];

console.log("Prepare");

const searchbyimagebtn = document.querySelector("div.LM8x9c");

searchbyimagebtn.addEventListener("click", () => {
  setTimeout(() => {
    const imgUrlTextBox = document.getElementById("Ycyxxc");
    if (imgUrlTextBox == null) {
      console.log("Search by image box not show up!");
      return;
    }

    console.log(`Get imgUrlTextBox: ${imgUrlTextBox}`);

    imgUrlTextBox.addEventListener("click", () => {
      const options = {
        eventType: "keydown",
        keystrokeDelay: 1000
      };

      keyMapper([uploadImage, detectEnter], options);
    });
  }, 300);
});

function keyMapper(callbackList, options) {
  const delay =
    options.hasOwnProperty("keystrokeDelay") &&
    options.keystrokeDelay >= 300 &&
    options.keystrokeDelay;
  const keystrokeDelay = delay || 1000;
  const eventType =
    (options.hasOwnProperty("eventType") && options.eventType) || "keydown";

  let state = {
    buffer: [],
    lastKeyTime: Date.now()
  };

  document.addEventListener(eventType, event => {
    const key = event.key.toLowerCase();

    let buffer = [];

    const currentTime = Date.now();
    if (currentTime - state.lastKeyTime > keystrokeDelay) {
      buffer = [key];
    } else {
      buffer = [...state.buffer, key];
    }
    console.log(buffer);
    state = { buffer: buffer, lastKeyTime: currentTime };

    // make sure that Search By Image Box is displayed and focuses on Paste image URL.
    var searchbyimageDiv = document.querySelector("#QDMvGf");
    var pasteimageurlDiv = document.querySelector("#dRSWfb");
    var uploadanimageDiv = document.querySelector("#FQt3Wc");
    if (
      (searchbyimageDiv.style.display == "block" ||
        searchbyimageDiv.style.display == "") &&
      (pasteimageurlDiv.style.display == "block" ||
        pasteimageurlDiv.style.display == "") &&
      uploadanimageDiv.style.display == "none"
    ) {
      callbackList.forEach(callback => callback(buffer));
    }
  });
}

function LoadingStateOne(message) {
  return new Promise((resolve, reject) => {
    console.log(`Loading state: ${message[0]}`);
    var imgUrlText = document.getElementById("Ycyxxc");
    imgUrlText.value = message[0];
    setTimeout(resolve, 500, message);
  });
}

function LoadingStateTwo(message) {
  return new Promise((resolve, reject) => {
    console.log(`Loading state: ${message[1]}`);
    var imgUrlText = document.getElementById("Ycyxxc");
    imgUrlText.value = message[1];
    setTimeout(resolve, 500, message);
  });
}

function LoadingStateThree(message) {
  return new Promise((resolve, reject) => {
    console.log(`Loading state: ${message[2]}`);
    var imgUrlText = document.getElementById("Ycyxxc");
    imgUrlText.value = message[2];
    setTimeout(resolve, 500, message);
  });
}

function uploadImage(keySequence) {
  const userInput = keySequence.join("").toLowerCase();

  if (userInput == "controlv" || userInput == "commandv") {
    console.log("Enter uploadImage");
    setTimeout(() => {
      var imgUrlText = document.getElementById("Ycyxxc");

      const textString = String(imgUrlText.value);

      if (textString == "" && imgUrl == "") {
        const showLoadingState = new Promise((resolve, reject) => {
          console.log("Showing loading state");
          resolve(uploadState, imgUrlText);
        });
        imgUrlText.value = "  Image uploading ";
        const refreshIntervalId = setInterval(() => {
          showLoadingState
            .then(LoadingStateOne)
            .then(LoadingStateTwo)
            .then(LoadingStateThree);
        }, 1600);
        picgo
          .upload()
          .then(() => {
            clearInterval(refreshIntervalId);
            var imgUrlText = document.getElementById("Ycyxxc");
            imgUrl = picgo.output[0].imgUrl;
            imgUrlText.value = imgUrl;
            console.log(imgUrl);
          })
          .catch(() => {
            clearInterval(refreshIntervalId);
            var imgUrlText = document.getElementById("Ycyxxc");
            imgUrlText.value = "  No image is copied at Clipboard ";
            console.log("No image is copied at Clipboard ");
          });
      } else if (textString.startsWith("http")) {
        // User pastes Image URL. Do nothing.
        console.log("User pastes a http link");
        return;
      } else {
        var imgUrlText = document.getElementById("Ycyxxc");
        imgUrlText.value = "  Not an image url or no image at clipboard ";
        console.log("Not an image url or no image at clipboard");
      }
    }, 500);
  }
}

function detectEnter(keySequence) {
  const userInput = keySequence.join("").toLowerCase();
  if (userInput == "enter") {
    console.log('Detect "Enter"');
    imgUrl = "";
  }
}
