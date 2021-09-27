/**
 * Detect the current tab url and change tool bar icon from gray
 * to colorful if it is a google images page.
 *
 */
class chromeTabDetector {
  public tabURL: string;
  public matchIndicator: boolean;
  public matchURL: string[];
  constructor() {
    this.tabURL = "";
    this.matchIndicator = false;
    this.matchURL = [
      "://images.google.com/",
      "://images.google..*",
      "://images.google.co..*/",
      "://images.google.com..*/",
      "://google.com/imghp",
      "://google.com/.*tbm=isch",
      "://google.com/.*tbs=sbi",
      "://www.google.com/imghp",
      "://www.google.com/.*tbm=isch",
      "://www.google.com/.*tbs=sbi",
      "://www.google..*/imghp",
      "://www.google..*/.*tbm=isch",
      "://www.google..*/.*tbs=sbi",
      "://www.google.co..*/imghp",
      "://www.google.co..*/.*tbm=isch",
      "://www.google.co..*/.*tbs=sbi",
      "://www.google.com..*/imghp",
      "://www.google.com..*/.*tbm=isch",
      "://www.google.com..*/.*tbs=sbi",
    ];
  }

  private chromeTabsQuery() {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      this.tabURL = tabs[0].url;
      this.matchIndicator = false;
      for (let tempUrl in this.matchURL) {
        const re = new RegExp(this.matchURL[tempUrl]);
        if (this.tabURL.match(re)) {
          chrome.browserAction.setIcon({
            path: { 19: "images/boostPic_19.png" },
          });
          chrome.browserAction.setIcon({
            path: { 38: "images/boostPic_38.png" },
          });
          this.matchIndicator = true;
          break;
        }
      }
      if (!this.matchIndicator) {
        chrome.browserAction.setIcon({
          path: { 19: "images/boostPic_19_gray.png" },
        });
        chrome.browserAction.setIcon({
          path: { 38: "images/boostPic_38_gray.png" },
        });
      }
      console.log(tabs[0].url);
    });
  }

  private tabsOnActivated() {
    chrome.tabs.onActivated.addListener((tab) => {
      this.chromeTabsQuery();
      console.log("onActivated", tab);
    });
  }

  private tabsOnCreated() {
    chrome.tabs.onCreated.addListener((tab) => {
      this.chromeTabsQuery();
      console.log("onCreated", tab);
    });
  }

  private tabsOnUpdated() {
    chrome.tabs.onUpdated.addListener((tab) => {
      this.chromeTabsQuery();
      console.log("onUpdated", tab);
    });
  }

  private tabsOnMoved() {
    chrome.tabs.onMoved.addListener((tab) => {
      this.chromeTabsQuery();
      console.log("onMoved", tab);
    });
  }

  private tabsOnReplaced() {
    chrome.tabs.onReplaced.addListener((tab) => {
      this.chromeTabsQuery();
      console.log("onReplaced", tab);
    });
  }

  public registerAllTabsListeners() {
    this.tabsOnActivated();
    this.tabsOnCreated();
    this.tabsOnUpdated();
    this.tabsOnMoved();
    this.tabsOnReplaced();
  }
}

const tabDetector = new chromeTabDetector();
tabDetector.registerAllTabsListeners();

/**
 * retrive blob url and uplaod image, then send smms url back
 *
 */
class chromeSmmsMessageListener {
  public smmsResponseUrl: string;
  constructor() {
    // Shared variable used to distinguish the return result of promise race
    this.smmsResponseUrl = "";
  }

  private async getBase64Url(blobUrl: string): Promise<Blob> {
    const key = await fetch(blobUrl).then((r) => r.blob());
    console.log("Successfully execute getBase64Url");
    return key;
  }

  /**
   * Convert a base64 string in a Blob according to the data and contentType.
   *
   * @param b64Data Pure base64 string without contentType
   * @param contentType the content type of the file i.e (image/jpeg - image/png - text/plain)
   * @param sliceSize SliceSize to process the byteCharacters
   * @return Blob
   */
  private b64toBlob(
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

  private delayPromise(ms: number): Promise<Function> {
    return new Promise(function (resolve) {
      setTimeout(resolve, ms);
    });
  }

  private timeoutPromise(
    promise: Promise<string>,
    ms: number
  ): Promise<string> {
    const timeout = this.delayPromise(ms).then(function () {
      return Promise.reject(
        new TimeoutError("Operation timed out after " + ms + " ms")
      );
    });
    return Promise.race([promise, timeout]);
  }

  private cancelableXHR(blobData: Blob, apiToken: string): cancelableXHRObj {
    const xhr = new XMLHttpRequest();

    const promise = new Promise(function (
      resolve: (value: string) => void,
      reject
    ) {
      const uploadUrl = "https://sm.ms/api/v2/upload";
      const formData = new FormData();
      formData.append("smfile", blobData, "image.png");
      formData.append("file_id", "0");
      xhr.open("POST", uploadUrl, true);
      xhr.setRequestHeader("Authorization", apiToken);
      xhr.send(formData);
      xhr.onreadystatechange = () => {
        if (xhr.readyState == 4 && xhr.status == 200) {
          if (xhr.responseText != "") {
            resolve(xhr.responseText);
            console.log(xhr.responseText);
          }
        }
      };
      xhr.onerror = () => {
        reject(new Error(xhr.statusText));
      };
      xhr.onabort = () => {
        reject(new Error("abort this request"));
      };
    });
    const abort = function () {
      // execute abort if request not end
      if (xhr.readyState !== XMLHttpRequest.UNSENT) {
        xhr.abort();
      }
    };
    return {
      promise: promise,
      abort: abort,
    };
  }

  private smmsUrlPromiseRacer(
    base64data: string | ArrayBuffer,
    sendResponse: Function
  ): void {
    if (typeof base64data === "string") {
      // base64 to blob object to upload

      // Split the base64 string in data and contentType
      const block = base64data.split(";");
      // Get the content type of the image
      const contentType = block[0].split(":")[1];
      // get the real base64 content of the file
      const realData = block[1].split(",")[1]; // In this case "R0lGODlhPQBEAPeoAJosM...."
      // Convert it to a blob to upload
      const blobData = this.b64toBlob(realData, contentType);

      // console.log("blobData", blobData);

      // Yes, I just bury it here on purpose. SM.MS is a free and public-available image bucket service.
      const apiToken = "rd1v9rtYAyQW7yHgykZvj97S3LygVW0I";
      // const imgUrl = getSMMSImageUrl(blobData, apiToken, sendResponse);

      const object = this.cancelableXHR(blobData, apiToken);
      // main
      this.timeoutPromise(object.promise, 8000)
        .then((contents) => {
          this.smmsResponseUrl = "";
          if (contents != "") {
            const responseJSON = JSON.parse(contents);
            if (responseJSON.code === "success") {
              this.smmsResponseUrl = responseJSON.data.url;
              sendResponse(responseJSON.data.url);
              console.log("Contents", responseJSON);
              return;
            } else if (responseJSON.code === "image_repeated") {
              this.smmsResponseUrl = responseJSON.images;
              sendResponse(responseJSON.images);
              console.log("Contents", responseJSON);
              return;
            }
          }
        })
        .catch((error) => {
          if (error instanceof TimeoutError) {
            if (this.smmsResponseUrl.startsWith("http")) {
              return;
            } else {
              object.abort();
              sendResponse("  Timeout Error. Please try again");
              // promseRaceTimeout = false;
              console.log(error);
              return;
            }
          }
          console.log("XHR Error :", error);
          sendResponse("  Some error happened. Please try again");
          return;
        });
    } else {
      sendResponse("  Some error happened. Please try again");
    }
  }

  /**
   * triggerChromeSmmsMessageListener
   */
  public triggerChromeSmmsMessageListener() {
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      if (request.startsWith("blob")) {
        console.log("CHROME RECEIVED");
        this.getBase64Url(request).then((res) => {
          console.log("Arrived here");

          const reader = new FileReader();
          reader.readAsDataURL(res);
          reader.onloadend = () => {
            const base64data = reader.result;
            this.smmsUrlPromiseRacer(base64data, sendResponse);
          };
        });
      } else if (request.startsWith("data:image")) {
        console.log("FIREFOX RECEIVED");

        this.smmsUrlPromiseRacer(request, sendResponse);
      }
      return true; // return true to indicate that you want to send a response asynchronously
    });
  }
}

function TimeoutError(arguments: string): void {
  // TypeError: CreateListFromArrayLike called on non-object
  // https://stackoverflow.com/a/41354496/8808175
  const superInstance = Error.apply(null, [arguments]);
  copyOwnFrom(this, superInstance);
}
TimeoutError.prototype = Object.create(Error.prototype);
TimeoutError.prototype.constructor = TimeoutError;

function copyOwnFrom(target: any, source: any): any {
  Object.getOwnPropertyNames(source).forEach(function (propName) {
    Object.defineProperty(
      target,
      propName,
      Object.getOwnPropertyDescriptor(source, propName)
    );
  });
  return target;
}

interface cancelableXHRObj {
  promise: Promise<string>;
  abort: Function;
}

const smmsMessageListener = new chromeSmmsMessageListener();
smmsMessageListener.triggerChromeSmmsMessageListener();
