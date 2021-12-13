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

declare const InstallTrigger: any;

interface GoogleImagesDomElements {
  searchbyimagebtn: HTMLElement;
  imgUrlTextBoxId: string;
  searchbyimageDivId: string;
  pasteimageurlDivId: string;
  uploadanimageDivId: string;
}

interface Options {
  eventOneType: string;
  eventTwoType: string;
  eventThreeType: string;
  keystrokeDelay: number;
}

class uploadImage {
  public imgUrl: string;
  public refreshIntervalId: NodeJS.Timer | undefined;
  public responseTimeoutId: NodeJS.Timer | undefined;
  public imageBlob: Blob | null;
  public loadingTimeoutIdPool: Array<number>;
  constructor(public GoogleImagesDomElements: GoogleImagesDomElements) {
    // this.imgUrl is the key to the upload state chain promise interval function
    this.imgUrl = "";
    this.refreshIntervalId = undefined;
    this.responseTimeoutId = undefined;
    this.imageBlob = null;
    this.loadingTimeoutIdPool = [];
  }

  private LoadingStateOne(value: unknown): string | PromiseLike<string> {
    return new Promise((resolve, reject) => {
      console.log(`Loading state: ${value[0]}`);
      var imgUrlText = document.querySelector<HTMLInputElement>(
        this.GoogleImagesDomElements.imgUrlTextBoxId
      );
      if (this.imgUrl == "") {
        imgUrlText.value = value[0];
        this.loadingTimeoutIdPool.push(window.setTimeout(resolve, 500, value));
      } else {
        imgUrlText.value = this.imgUrl;
        this.loadingTimeoutIdPool.forEach((timer) => {
          clearTimeout(timer);
        });
        this.loadingTimeoutIdPool.splice(0);
        reject("Image url received!");
      }
    });
  }

  private LoadingStateTwo(value: unknown): string | PromiseLike<string> {
    return new Promise((resolve, reject) => {
      console.log(`Loading state: ${value[1]}`);
      var imgUrlText = document.querySelector<HTMLInputElement>(
        this.GoogleImagesDomElements.imgUrlTextBoxId
      );
      if (this.imgUrl == "") {
        imgUrlText.value = value[1];
        this.loadingTimeoutIdPool.push(window.setTimeout(resolve, 500, value));
      } else {
        imgUrlText.value = this.imgUrl;
        this.loadingTimeoutIdPool.forEach((timer) => {
          clearTimeout(timer);
        });
        this.loadingTimeoutIdPool.splice(0);
        reject("Image url received!");
      }
    });
  }

  private LoadingStateThree(value: unknown): string | PromiseLike<string> {
    return new Promise((resolve, reject) => {
      console.log(`Loading state: ${value[2]}`);
      var imgUrlText = document.querySelector<HTMLInputElement>(
        this.GoogleImagesDomElements.imgUrlTextBoxId
      );
      if (this.imgUrl == "") {
        imgUrlText.value = value[2];
        this.loadingTimeoutIdPool.push(window.setTimeout(resolve, 500, value));
      } else {
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
  private chainError(err: string): Promise<never> {
    console.log(err);
    return Promise.reject(err);
  }

  private chromeSendMessage(payloads: string): void {
    chrome.runtime.sendMessage(payloads, (res) => {
      this.imgUrl = res;
      console.log(this.imgUrl);
      clearInterval(this.refreshIntervalId);
      // To prevent that it happens to halt at "  Image uploading ..."
      setTimeout(() => {
        var imgUrlText = document.querySelector<HTMLInputElement>(
          this.GoogleImagesDomElements.imgUrlTextBoxId
        );
        imgUrlText.value = this.imgUrl;
      }, 1000);
      // double check to clear interval to prevent infinite error loop of LoadingStateOne
      // Hope it works.
      setTimeout(() => {
        clearInterval(this.refreshIntervalId);
        clearTimeout(this.responseTimeoutId);
      }, 500);
      console.log("Stop uploading state message");
    });
  }

  /**
   * trigger
   */
  public trigger(): void {
    // clear this.imgUrl first to prevent error
    this.imgUrl = "";
    console.log("UploadImage begins");
    const imgUrlText = document.querySelector<HTMLInputElement>(
      this.GoogleImagesDomElements.imgUrlTextBoxId
    );
    const uploadState = [
      "  Image uploading .",
      "  Image uploading ..",
      "  Image uploading ...",
    ];
    const showLoadingState = new Promise((resolve, reject) => {
      console.log("Showing loading state");
      if (this.imgUrl == "") {
        resolve(uploadState);
      } else {
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
    this.responseTimeoutId = setTimeout(() => {
      clearInterval(this.refreshIntervalId);
      if (!imgUrlText.value.startsWith("http")) {
        if (imgUrlText.value.startsWith("  Some")) {
          imgUrlText.value = "  Some error happened. Please try again";
        } else {
          imgUrlText.value = "  Timeout Error. Please try again";
        }
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
    } else {
      // For chrome extension
      this.chromeSendMessage(blobUrl);
    }
  }

  /**
   * imageBlobSetter
   */
  public imageBlobSetter(imageBlob: Blob | undefined) {
    console.log(this);
    this.imageBlob = imageBlob;
    if (Boolean(this.imageBlob)) {
      this.trigger.bind(this);
      this.trigger();
    }
  }
}

function keyMapper(
  callbackList: Function[],
  options: Options,
  GoogleImagesDomElements: GoogleImagesDomElements
): void {
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
  document.addEventListener(eventOneType, (event: any): void => {
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
    var searchbyimageDiv = document.querySelector<HTMLElement>(
      GoogleImagesDomElements.searchbyimageDivId
    );
    var pasteimageurlDiv = document.querySelector<HTMLElement>(
      GoogleImagesDomElements.pasteimageurlDivId
    );
    var uploadanimageDiv = document.querySelector<HTMLElement>(
      GoogleImagesDomElements.uploadanimageDivId
    );
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
      var searchbyimageDiv = document.querySelector<HTMLElement>(
        GoogleImagesDomElements.searchbyimageDivId
      );
      var pasteimageurlDiv = document.querySelector<HTMLElement>(
        GoogleImagesDomElements.pasteimageurlDivId
      );
      var uploadanimageDiv = document.querySelector<HTMLElement>(
        GoogleImagesDomElements.uploadanimageDivId
      );
      if (
        (searchbyimageDiv.style.display == "block" ||
          searchbyimageDiv.style.display == "") &&
        (pasteimageurlDiv.style.display == "block" ||
          pasteimageurlDiv.style.display == "") &&
        uploadanimageDiv.style.display == "none"
      ) {
        // callbackList.forEach(callback => callback(buffer));
        const uploadImageInstance = new uploadImage(GoogleImagesDomElements);
        callbackList[0](
          event,
          uploadImageInstance.imageBlobSetter.bind(uploadImageInstance),
          GoogleImagesDomElements
        );
      }
    },
    false
  );

  // clean text box content when Search by Image box loses focus
  document.addEventListener(eventThreeType, () => {
    setTimeout(() => {
      var searchbyimageDiv = document.querySelector<HTMLElement>(
        GoogleImagesDomElements.searchbyimageDivId
      );
      if (
        searchbyimageDiv == null ||
        searchbyimageDiv.style.display == "none"
      ) {
        var imgUrlText = document.querySelector<HTMLInputElement>(
          GoogleImagesDomElements.imgUrlTextBoxId
        );
        imgUrlText.value = "";
        console.log("Clean text box content");
      }
    }, 300);
  });
}

function retrieveImageFromClipboardAsBlob(
  pasteEvent: ClipboardEvent,
  callback: Function,
  GoogleImagesDomElements: GoogleImagesDomElements
): void {
  if (!pasteEvent.clipboardData) {
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
      if (
        textString.startsWith("http")
        // && textString.match(/\.(jpeg|jpg|gif|png|svg)$/)
      ) {
        console.log("User pastes an image url");
        callback(null);
      }
      // User pastes base64 data
      else if (textString.startsWith("data:image")) {
        console.log("User pastes base64 data");
        // callback(null);
        // Split the base64 string in data and contentType
        const block = textString.split(";");
        // Get the content type of the image
        const contentType = block[0].split(":")[1];
        // get the real base64 content of the file
        const realData = block[1].split(",")[1]; // In this case "R0lGODlhPQBEAPeoAJosM...."
        // Convert it to a blob to upload
        const blobData = b64toBlob(realData, contentType);
        callback(blobData);
      }
      // exception
      else {
        var imgUrlText = document.querySelector<HTMLInputElement>(
          GoogleImagesDomElements.imgUrlTextBoxId
        );
        imgUrlText.value = "  Not an image url or no image at clipboard ";
        console.log("Not an image url or no image at clipboard");
        callback(null);
      }
    });
  } else if (items[0].type.indexOf("image") != -1) {
    // Retrieve image on clipboard as blob
    const blob = items[0].getAsFile();
    if (typeof callback == "function") {
      callback(blob);
    }
  } else {
    var imgUrlText = document.querySelector<HTMLInputElement>(
      GoogleImagesDomElements.imgUrlTextBoxId
    );
    imgUrlText.value = "  Not an image url or no image at clipboard ";
    console.log("Not an image url or no image at clipboard");
    callback(null);
  }
}

function detectEnter(keySequence: string[]): void {
  const userInput = keySequence.join("").toLowerCase();
  if (userInput == "enter") {
    console.log('Detect "Enter"');
  }
}

/**
 * Convert a base64 string in a Blob according to the data and contentType.
 *
 * @param b64Data Pure base64 string without contentType
 * @param contentType the content type of the file i.e (image/jpeg - image/png - text/plain)
 * @param sliceSize SliceSize to process the byteCharacters
 * @return Blob
 */
function b64toBlob(
  b64Data: string,
  contentType: string = "",
  sliceSize: number = 512
): Blob {
  const byteCharacters = atob(b64Data);
  let byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);

    let byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    const byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }
  const blob = new Blob(byteArrays, { type: contentType });
  return blob;
}

function debounce(callback: Function, interval: number): Function {
  let timeCounter = 0;
  let timeoutId = null;
  return function (...args) {
    if (timeCounter === 0) {
      timeoutId = setTimeout(() => {
        timeoutId = null;
        timeCounter = 0;
      }, interval);
      timeCounter++;
      return callback(...args);
    } else {
      if (timeoutId) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          timeoutId = null;
          timeCounter = 0;
        }, interval);
        timeCounter++;
      } else {
        timeCounter++;
        return callback(...args);
      }
    }
  };
}

/**
 * *********************
 */
console.log("Execution commences");
/**
 * *********************
 */

const GoogleImagesDomElements: GoogleImagesDomElements = {
  searchbyimagebtn: document.querySelector("div[aria-label='Search by image']"),
  imgUrlTextBoxId: "",
  searchbyimageDivId: "",
  pasteimageurlDivId: "",
  uploadanimageDivId: "",
};

// suitable for google image homepage and the page of search by image results
if (GoogleImagesDomElements.searchbyimagebtn) {
  GoogleImagesDomElements.imgUrlTextBoxId = "#Ycyxxc";
  GoogleImagesDomElements.searchbyimageDivId = "#QDMvGf";
  GoogleImagesDomElements.pasteimageurlDivId = "#dRSWfb";
  GoogleImagesDomElements.uploadanimageDivId = "#FQt3Wc";
} else {
  // suitable for the image tab page of google search results via vanilla string searc
  // and custom google images search input box at popup.html
  GoogleImagesDomElements.searchbyimagebtn =
    document.querySelector("div.mp5Tqb");
  GoogleImagesDomElements.imgUrlTextBoxId = "input.TIjxY";
  GoogleImagesDomElements.searchbyimageDivId = "div.fWfAye";
  GoogleImagesDomElements.pasteimageurlDivId = "div.P9ipme[jsname='zMVKPd']";
  GoogleImagesDomElements.uploadanimageDivId = "div.P9ipme[jsname='EBSqGc']";
}

// console.log(GoogleImagesDomElements);

const debouncedRetrieveImageFromClipboardAsBlob = debounce(
  retrieveImageFromClipboardAsBlob,
  1500
);

GoogleImagesDomElements.searchbyimagebtn.addEventListener("click", () => {
  setTimeout(() => {
    const imgUrlTextBox = document.querySelector(
      GoogleImagesDomElements.imgUrlTextBoxId
    );
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

      keyMapper(
        [debouncedRetrieveImageFromClipboardAsBlob, detectEnter],
        options,
        GoogleImagesDomElements
      );
    });

    const event = new MouseEvent("click", {
      view: window,
      bubbles: true,
      cancelable: true,
    });
    imgUrlTextBox.dispatchEvent(event);
  }, 300);
});

// Special execution for custom google images search
// input box at popup.html
if (
  GoogleImagesDomElements.searchbyimagebtn.getAttribute("place") === "popup"
) {
  const event = new MouseEvent("click", {
    view: window,
    bubbles: true,
    cancelable: true,
  });

  GoogleImagesDomElements.searchbyimagebtn.dispatchEvent(event);

  const getImagesSearchResultBtn = document.querySelector("input.asfTh");

  getImagesSearchResultBtn.addEventListener("click", () => {
    const imgUrlTextBox = document.querySelector<HTMLInputElement>(
      GoogleImagesDomElements.imgUrlTextBoxId
    );

    const textString = imgUrlTextBox.value;

    if (textString.startsWith("http")) {
      window.open(
        `https://images.google.com/searchbyimage?image_url=${textString}&encoded_image=&image_content=&filename=&hl=en`,
        "_blank"
      );
    }
  });
}
