"use strict";

// const PicGo = require("picgo");
// const picgo = new PicGo();

// set imgUrl to golbal to be compaible with the upload state chain promise interval function
var imgUrl = "";

console.log("Execution commences");

var searchbyimagebtn = document.querySelector("div.LM8x9c");
// suitable for google image homepage and the page of search by image results
if (searchbyimagebtn) {
  var imgUrlTextBoxId = "#Ycyxxc";
  var searchbyimageDivId = "#QDMvGf";
  var pasteimageurlDivId = "#dRSWfb";
  var uploadanimageDivId = "#FQt3Wc";
} else {
  // suitable for the image tab page of google search results via vanilla string search
  searchbyimagebtn = document.querySelector("div.mp5Tqb");
  var imgUrlTextBoxId = "input.TIjxY";
  var searchbyimageDivId = "div.fWfAye";
  var pasteimageurlDivId = "div.P9ipme[jsname='zMVKPd']";
  var uploadanimageDivId = "div.P9ipme[jsname='EBSqGc']";
}

// console.log(searchbyimagebtn);

searchbyimagebtn.addEventListener("click", () => {
  setTimeout(() => {
    const imgUrlTextBox = document.querySelector(imgUrlTextBoxId);
    if (imgUrlTextBox == null) {
      console.log("Search by image box not show up!");
      return;
    }

    console.log(`Get imgUrlTextBox: ${imgUrlTextBox}`);

    imgUrlTextBox.addEventListener("click", () => {
      const options = {
        eventOneType: "keydown",
        eventTwoType: "paste",
        eventThreeType: "click",
        keystrokeDelay: 1000,
      };

      keyMapper([retrieveImageFromClipboardAsBlob, detectEnter], options);
    });

    const event = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    imgUrlTextBox.dispatchEvent(event);
  }, 300);
});

function keyMapper(callbackList, options) {
  const delay =
    options.hasOwnProperty("keystrokeDelay") &&
    options.keystrokeDelay >= 300 &&
    options.keystrokeDelay;
  const keystrokeDelay = delay || 1000;
  const eventOneType =
    (options.hasOwnProperty("eventOneType") && options.eventOneType) ||
    "keydown";
  const eventTwoType =
    (options.hasOwnProperty("eventTwoType") && options.eventTwoType) || "paste";
  const eventThreeType =
    (options.hasOwnProperty("eventThreeType") && options.eventThreeType) ||
    "click";

  let state = {
    buffer: [],
    lastKeyTime: Date.now(),
  };

  // Used only for "enter" key press
  document.addEventListener(eventOneType, (event) => {
    const key = event.key.toLowerCase();

    let buffer = [];

    const currentTime = Date.now();
    if (currentTime - state.lastKeyTime > keystrokeDelay) {
      buffer = [key];
    } else {
      buffer = [...state.buffer, key];
    }
    // console.log(buffer);
    state = {
      buffer: buffer,
      lastKeyTime: currentTime,
    };

    // make sure that Search By Image Box is displayed and focuses on Paste image URL.
    var searchbyimageDiv = document.querySelector(searchbyimageDivId);
    var pasteimageurlDiv = document.querySelector(pasteimageurlDivId);
    var uploadanimageDiv = document.querySelector(uploadanimageDivId);
    if (
      (searchbyimageDiv.style.display == "block" ||
        searchbyimageDiv.style.display == "") &&
      (pasteimageurlDiv.style.display == "block" ||
        pasteimageurlDiv.style.display == "") &&
      uploadanimageDiv.style.display == "none"
    ) {
      // callbackList.forEach(callback => callback(buffer));
      callbackList[1](buffer);
    }
  });

  // Listen to paste event and get image data
  window.addEventListener(
    eventTwoType,
    (event) => {
      // make sure that Search By Image Box is displayed and focuses on Paste image URL.
      var searchbyimageDiv = document.querySelector(searchbyimageDivId);
      var pasteimageurlDiv = document.querySelector(pasteimageurlDivId);
      var uploadanimageDiv = document.querySelector(uploadanimageDivId);
      if (
        (searchbyimageDiv.style.display == "block" ||
          searchbyimageDiv.style.display == "") &&
        (pasteimageurlDiv.style.display == "block" ||
          pasteimageurlDiv.style.display == "") &&
        uploadanimageDiv.style.display == "none"
      ) {
        // callbackList.forEach(callback => callback(buffer));
        callbackList[0](event, uploadImage);
      }
    },
    false
  );

  // clean text box content when Search by Image box loses focus
  document.addEventListener(eventThreeType, () => {
    setTimeout(() => {
      var searchbyimageDiv = document.querySelector(searchbyimageDivId);
      if (
        searchbyimageDiv == null ||
        searchbyimageDiv.style.display == "none"
      ) {
        var imgUrlText = document.querySelector(imgUrlTextBoxId);
        imgUrlText.value = "";
        console.log("Clean text box content");
      }
    }, 300);
  });
}

function retrieveImageFromClipboardAsBlob(pasteEvent, callback) {
  if (pasteEvent.clipboardData == false) {
    if (typeof callback == "function") {
      callback(undefined);
    }
  }

  var items = pasteEvent.clipboardData.items;

  if (items == undefined) {
    if (typeof callback == "function") {
      callback(undefined);
    }
  }

  console.log(items[0]);

  // Analyze the first item at the clipboard
  if (items[0].type == "text/plain") {
    var textString = "";
    items[0].getAsString((e) => {
      console.log(e);
      textString = e;

      // User pastes an image url
      if (
        textString.startsWith("http")
        // && textString.match(/\.(jpeg|jpg|gif|png|svg)$/)
      ) {
        console.log("User pastes an image url");
        callback(undefined);
      }
      // User pastes base64 data
      else if (textString.startsWith("data:image")) {
        console.log("User pastes base64 data");
        callback(undefined);
      }
      // exception
      else {
        var imgUrlText = document.querySelector(imgUrlTextBoxId);
        imgUrlText.value = "  Not an image url or no image at clipboard ";
        console.log("Not an image url or no image at clipboard");
        callback(undefined);
      }
    });
  } else if (items[0].type.indexOf("image") != -1) {
    // Retrieve image on clipboard as blob
    const blob = items[0].getAsFile();
    if (typeof callback == "function") {
      callback(blob);
    }
  } else {
    var imgUrlText = document.querySelector(imgUrlTextBoxId);
    imgUrlText.value = "  Not an image url or no image at clipboard ";
    console.log("Not an image url or no image at clipboard");
    callback(undefined);
  }
}

function uploadImage(imageBlob) {
  if (imageBlob) {
    // clear imgUrl first to prevent error
    imgUrl = "";
    console.log("UploadImage begins");
    var imgUrlText = document.querySelector(imgUrlTextBoxId);
    const uploadState = [
      "  Image uploading .",
      "  Image uploading ..",
      "  Image uploading ...",
    ];
    const showLoadingState = new Promise((resolve, reject) => {
      console.log("Showing loading state");
      if (imgUrl == "") {
        resolve(uploadState);
      } else {
        imgUrlText.value = imgUrl;
        reject("Image url received!");
      }
    });
    imgUrlText.value = "  Image uploading ";
    const refreshIntervalId = setInterval(() => {
      showLoadingState
        .then(LoadingStateOne, chainError)
        .then(LoadingStateTwo, chainError)
        .then(LoadingStateThree, chainError);
    }, 1600);

    // In case the following chrome.runtime.sendMessage does not recevie response
    setTimeout(() => {
      clearInterval(refreshIntervalId);
    }, 12000);
    setTimeout(() => {
      var imgUrlText = document.querySelector(imgUrlTextBoxId);
      if (!imgUrlText.value.startsWith("http")) {
        imgUrlText.value = "  Timeout Error. Please try again";
      }
    }, 12500);

    // Prepare image blob url to send to background.js

    /* (Browser specific. For Chrome we need to convert Blob to a blobUrl
        so as to trigger runtime.sendMessage, while for firefox runtime.sendMessage can send blob file directly.)
        reference: https://stackoverflow.com/questions/24193578/pass-input-file-to-background-script
    */

    // Crossbrowser support for URL
    const URLObj = window.URL || webkitURL;
    // Creates a DOMString containing a URL representing the object given in the parameter
    // namely the original Blob
    const blobUrl = URLObj.createObjectURL(imageBlob);
    console.log(blobUrl);

    // For Firefox add-on
    const isFirefox = typeof InstallTrigger !== "undefined";

    if (isFirefox) {
      console.log("come have me");
      const reader = new FileReader();
      reader.readAsDataURL(imageBlob);
      reader.onloadend = function () {
        const base64data = reader.result;
        console.log(base64data);
        chrome.runtime.sendMessage(base64data, (res) => {
          imgUrl = res;
          console.log(imgUrl);
          clearInterval(refreshIntervalId);
          // To prevent that it happens to halt at "  Image uploading ..."
          setTimeout(() => {
            var imgUrlText = document.querySelector(imgUrlTextBoxId);
            imgUrlText.value = imgUrl;
          }, 1000);
          // double check to clear interval to prevent infinite error loop of LoadingStateOne
          // Hope it works.
          setTimeout(() => {
            clearInterval(refreshIntervalId);
          }, 500);
          console.log("Stop uploading state message");
        });
      };
    } else {
      // For chrome extension
      chrome.runtime.sendMessage(blobUrl, (res) => {
        imgUrl = res;
        console.log(imgUrl);
        clearInterval(refreshIntervalId);
        // To prevent that it happens to halt at "  Image uploading ..."
        setTimeout(() => {
          var imgUrlText = document.querySelector(imgUrlTextBoxId);
          imgUrlText.value = imgUrl;
        }, 1000);
        // double check to clear interval to prevent infinite error loop of LoadingStateOne
        // Hope it works.
        setTimeout(() => {
          clearInterval(refreshIntervalId);
        }, 500);
        console.log("Stop uploading state message");
        // var imgUrlText = document.querySelector(imgUrlTextBoxId);
        // imgUrl will tirgger LoadingStateThree function to display image url
        // imgUrlText.value = "";
        // while (imgUrlText.value !== imgUrl) {
        //   imgUrlText.value = imgUrl;
        //   console.log(imgUrl);
        // }
      });
    }
  }
}

// stop the promise chain, construed from Vinnyq12,
// https://stackoverflow.com/questions/20714460/break-promise-chain-and-call-a-function-based-on-the-step-in-the-chain-where-it#comment70198570_35503793
function chainError(err) {
  console.log(err);
  return Promise.reject(err);
}

function LoadingStateOne(message) {
  return new Promise((resolve, reject) => {
    console.log(`Loading state: ${message[0]}`);
    var imgUrlText = document.querySelector(imgUrlTextBoxId);
    if (imgUrl == "") {
      imgUrlText.value = message[0];
      setTimeout(resolve, 500, message);
    } else {
      imgUrlText.value = imgUrl;
      reject("Image url received!");
    }
  });
}

function LoadingStateTwo(message) {
  return new Promise((resolve, reject) => {
    console.log(`Loading state: ${message[1]}`);
    var imgUrlText = document.querySelector(imgUrlTextBoxId);
    if (imgUrl == "") {
      imgUrlText.value = message[1];
      setTimeout(resolve, 500, message);
    } else {
      imgUrlText.value = imgUrl;
      reject("Image url received!");
    }
  });
}

function LoadingStateThree(message) {
  return new Promise((resolve, reject) => {
    console.log(`Loading state: ${message[2]}`);
    var imgUrlText = document.querySelector(imgUrlTextBoxId);
    if (imgUrl == "") {
      imgUrlText.value = message[2];
      setTimeout(resolve, 500, message);
    } else {
      imgUrlText.value = imgUrl;
      reject("Image url received!");
    }
  });
}

function detectEnter(keySequence) {
  const userInput = keySequence.join("").toLowerCase();
  if (userInput == "enter") {
    console.log('Detect "Enter"');
  }
}
