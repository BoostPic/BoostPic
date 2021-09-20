/**
 * Extension Fronend logic injected into the Google Images page
 * or boostpic popup page.
 *
 * Mindset:
 * User clicks the camera icon on Google Images, register the relevant
 * listeners and detect user's paste action, then send the image data to
 * the extension background via onMessage Channel, when the callback url
 * is received, render it to the input box.
 *
 * @author Leslie-Wong-H
 * @email 79917148leslie@gmail.com
 */
class uploadImage {
    constructor() {
        // this.imgUrl is the key to the upload state chain promise interval function
        this.imgUrl = "";
        this.refreshIntervalId = undefined;
        this.imageBlob = null;
        this.loadingTimeoutIdPool = [];
    }
    LoadingStateOne(value) {
        return new Promise((resolve, reject) => {
            console.log(`Loading state: ${value[0]}`);
            var imgUrlText = document.querySelector(imgUrlTextBoxId);
            if (this.imgUrl == "") {
                imgUrlText.value = value[0];
                this.loadingTimeoutIdPool.push(window.setTimeout(resolve, 500, value));
            }
            else {
                imgUrlText.value = this.imgUrl;
                this.loadingTimeoutIdPool.forEach((timer) => {
                    clearTimeout(timer);
                });
                this.loadingTimeoutIdPool.splice(0);
                reject("Image url received!");
            }
        });
    }
    LoadingStateTwo(value) {
        return new Promise((resolve, reject) => {
            console.log(`Loading state: ${value[1]}`);
            var imgUrlText = document.querySelector(imgUrlTextBoxId);
            if (this.imgUrl == "") {
                imgUrlText.value = value[1];
                this.loadingTimeoutIdPool.push(window.setTimeout(resolve, 500, value));
            }
            else {
                imgUrlText.value = this.imgUrl;
                this.loadingTimeoutIdPool.forEach((timer) => {
                    clearTimeout(timer);
                });
                this.loadingTimeoutIdPool.splice(0);
                reject("Image url received!");
            }
        });
    }
    LoadingStateThree(value) {
        return new Promise((resolve, reject) => {
            console.log(`Loading state: ${value[2]}`);
            var imgUrlText = document.querySelector(imgUrlTextBoxId);
            if (this.imgUrl == "") {
                imgUrlText.value = value[2];
                this.loadingTimeoutIdPool.push(window.setTimeout(resolve, 500, value));
            }
            else {
                imgUrlText.value = this.imgUrl;
                this.loadingTimeoutIdPool.forEach((timer) => {
                    clearTimeout(timer);
                });
                this.loadingTimeoutIdPool.splice(0);
                reject("Image url received!");
            }
        });
    }
    /**
     * stop the promise chain
     */
    chainError(err) {
        console.log(err);
        return Promise.reject(err);
    }
    chromeSendMessage(payloads) {
        chrome.runtime.sendMessage(payloads, (res) => {
            this.imgUrl = res;
            console.log(this.imgUrl);
            clearInterval(this.refreshIntervalId);
            // To prevent that it happens to halt at "  Image uploading ..."
            setTimeout(() => {
                var imgUrlText = document.querySelector(imgUrlTextBoxId);
                imgUrlText.value = this.imgUrl;
            }, 1000);
            // double check to clear interval to prevent infinite error loop of LoadingStateOne
            // Hope it works.
            setTimeout(() => {
                clearInterval(this.refreshIntervalId);
            }, 500);
            console.log("Stop uploading state message");
        });
    }
    /**
     * trigger
     */
    trigger() {
        // clear this.imgUrl first to prevent error
        this.imgUrl = "";
        console.log("UploadImage begins");
        const imgUrlText = document.querySelector(imgUrlTextBoxId);
        const uploadState = [
            "  Image uploading .",
            "  Image uploading ..",
            "  Image uploading ...",
        ];
        const showLoadingState = new Promise((resolve, reject) => {
            console.log("Showing loading state");
            if (this.imgUrl == "") {
                resolve(uploadState);
            }
            else {
                imgUrlText.value = this.imgUrl;
                reject("Image url received!");
            }
        });
        imgUrlText.value = "  Image uploading ";
        this.refreshIntervalId = setInterval(() => {
            showLoadingState
                .then(this.LoadingStateOne.bind(this), this.chainError.bind(this))
                .then(this.LoadingStateTwo.bind(this), this.chainError.bind(this))
                .then(this.LoadingStateThree.bind(this), this.chainError.bind(this))
                .catch(() => {
                clearInterval(this.refreshIntervalId);
            });
        }, 1600);
        // In case the following chrome.runtime.sendMessage does not recevie response
        setTimeout(() => {
            clearInterval(this.refreshIntervalId);
            if (!imgUrlText.value.startsWith("http")) {
                imgUrlText.value = "  Timeout Error. Please try again";
            }
        }, 12000);
        // Prepare image blob url to send to background.js
        /* (Browser specific. For Chrome we need to convert Blob to a blobUrl
            so as to trigger runtime.sendMessage, while for firefox runtime.sendMessage can send blob file directly.)
            reference: https://stackoverflow.com/questions/24193578/pass-input-file-to-background-script
        */
        // Crossbrowser support for URL
        const URLObj = window.URL || webkitURL;
        // Creates a DOMString containing a URL representing the object given in the parameter
        // namely the original Blob
        const blobUrl = URLObj.createObjectURL(this.imageBlob);
        console.log(blobUrl);
        // For Firefox add-on
        const isFirefox = typeof InstallTrigger !== "undefined";
        if (isFirefox) {
            const reader = new FileReader();
            reader.readAsDataURL(this.imageBlob);
            reader.onloadend = () => {
                const base64data = String(reader.result);
                // console.log(base64data);
                this.chromeSendMessage(base64data);
            };
        }
        else {
            // For chrome extension
            this.chromeSendMessage(blobUrl);
        }
    }
    /**
     * imageBlobSetter
     */
    imageBlobSetter(imageBlob) {
        console.log(this);
        this.imageBlob = imageBlob;
        if (Boolean(this.imageBlob)) {
            this.trigger.bind(this);
            this.trigger();
        }
    }
}
function keyMapper(callbackList, options) {
    const delay = options.hasOwnProperty("keystrokeDelay") &&
        options.keystrokeDelay >= 300 &&
        options.keystrokeDelay;
    const keystrokeDelay = delay || 1000;
    const eventOneType = (options.hasOwnProperty("eventOneType") && options.eventOneType) ||
        "keydown";
    const eventTwoType = (options.hasOwnProperty("eventTwoType") && options.eventTwoType) || "paste";
    const eventThreeType = (options.hasOwnProperty("eventThreeType") && options.eventThreeType) ||
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
        }
        else {
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
        if ((searchbyimageDiv.style.display == "block" ||
            searchbyimageDiv.style.display == "") &&
            (pasteimageurlDiv.style.display == "block" ||
                pasteimageurlDiv.style.display == "") &&
            uploadanimageDiv.style.display == "none") {
            // callbackList.forEach(callback => callback(buffer));
            callbackList[1](buffer);
        }
    });
    // Listen to paste event and get image data
    window.addEventListener(eventTwoType, (event) => {
        // make sure that Search By Image Box is displayed and focuses on Paste image URL.
        var searchbyimageDiv = document.querySelector(searchbyimageDivId);
        var pasteimageurlDiv = document.querySelector(pasteimageurlDivId);
        var uploadanimageDiv = document.querySelector(uploadanimageDivId);
        if ((searchbyimageDiv.style.display == "block" ||
            searchbyimageDiv.style.display == "") &&
            (pasteimageurlDiv.style.display == "block" ||
                pasteimageurlDiv.style.display == "") &&
            uploadanimageDiv.style.display == "none") {
            // callbackList.forEach(callback => callback(buffer));
            const uploadImageInstance = new uploadImage();
            callbackList[0](event, uploadImageInstance.imageBlobSetter.bind(uploadImageInstance));
        }
    }, false);
    // clean text box content when Search by Image box loses focus
    document.addEventListener(eventThreeType, () => {
        setTimeout(() => {
            var searchbyimageDiv = document.querySelector(searchbyimageDivId);
            if (searchbyimageDiv == null ||
                searchbyimageDiv.style.display == "none") {
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
            callback(null);
        }
    }
    var items = pasteEvent.clipboardData.items;
    if (items == undefined) {
        if (typeof callback == "function") {
            callback(null);
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
            if (textString.startsWith("http")
            // && textString.match(/\.(jpeg|jpg|gif|png|svg)$/)
            ) {
                console.log("User pastes an image url");
                callback(null);
            }
            // User pastes base64 data
            else if (textString.startsWith("data:image")) {
                console.log("User pastes base64 data");
                callback(null);
            }
            // exception
            else {
                var imgUrlText = document.querySelector(imgUrlTextBoxId);
                imgUrlText.value = "  Not an image url or no image at clipboard ";
                console.log("Not an image url or no image at clipboard");
                callback(null);
            }
        });
    }
    else if (items[0].type.indexOf("image") != -1) {
        // Retrieve image on clipboard as blob
        const blob = items[0].getAsFile();
        if (typeof callback == "function") {
            callback(blob);
        }
    }
    else {
        var imgUrlText = document.querySelector(imgUrlTextBoxId);
        imgUrlText.value = "  Not an image url or no image at clipboard ";
        console.log("Not an image url or no image at clipboard");
        callback(null);
    }
}
function detectEnter(keySequence) {
    const userInput = keySequence.join("").toLowerCase();
    if (userInput == "enter") {
        console.log('Detect "Enter"');
    }
}
console.log("Execution commences");
var searchbyimagebtn = document.querySelector("div[aria-label='Search by image']");
// suitable for google image homepage and the page of search by image results
if (searchbyimagebtn) {
    var imgUrlTextBoxId = "#Ycyxxc";
    var searchbyimageDivId = "#QDMvGf";
    var pasteimageurlDivId = "#dRSWfb";
    var uploadanimageDivId = "#FQt3Wc";
}
else {
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
