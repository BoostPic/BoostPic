var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Detect the current tab url and change tool bar icon from gray
 * to colorful if it is a google images page.
 *
 */
class chromeTabDetector {
    constructor() {
        this.tabURL = "";
        this.matchIndicator = false;
        this.matchURL = [
            "://images.google.com/",
            "://images.google..*",
            "://images.google.co..*/",
            "://images.google.com..*/",
            "://google.com/",
            "://google.com/imghp",
            "://google.com/.*tbm=isch",
            "://google.com/.*tbs=sbi",
            "://www.google.com/",
            "://www.google.com/imghp",
            "://www.google.com/.*tbm=isch",
            "://www.google.com/.*tbs=sbi",
            "://www.google..*/",
            "://www.google..*/imghp",
            "://www.google..*/.*tbm=isch",
            "://www.google..*/.*tbs=sbi",
            "://www.google.co..*/",
            "://www.google.co..*/imghp",
            "://www.google.co..*/.*tbm=isch",
            "://www.google.co..*/.*tbs=sbi",
            "://www.google.com..*/",
            "://www.google.com..*/imghp",
            "://www.google.com..*/.*tbm=isch",
            "://www.google.com..*/.*tbs=sbi",
        ];
    }
    chromeTabsQuery() {
        chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
            this.tabURL = tabs[0].url;
            this.matchIndicator = false;
            for (let tempUrl in this.matchURL) {
                const re = new RegExp(this.matchURL[tempUrl]);
                if (this.tabURL.match(re)) {
                    chrome.action.setIcon({
                        path: {
                            19: "../images/boostPic_19.png",
                            38: "../images/boostPic_38.png",
                        },
                    });
                    this.matchIndicator = true;
                    break;
                }
            }
            if (!this.matchIndicator) {
                chrome.action.setIcon({
                    path: {
                        19: "../images/boostPic_19_gray.png",
                        38: "../images/boostPic_38_gray.png",
                    },
                });
            }
            console.log(tabs[0].url);
        });
    }
    tabsOnActivated() {
        chrome.tabs.onActivated.addListener((tab) => {
            this.chromeTabsQuery();
            console.log("onActivated", tab);
        });
    }
    tabsOnCreated() {
        chrome.tabs.onCreated.addListener((tab) => {
            this.chromeTabsQuery();
            console.log("onCreated", tab);
        });
    }
    tabsOnUpdated() {
        chrome.tabs.onUpdated.addListener((tab) => {
            this.chromeTabsQuery();
            console.log("onUpdated", tab);
        });
    }
    tabsOnMoved() {
        chrome.tabs.onMoved.addListener((tab) => {
            this.chromeTabsQuery();
            console.log("onMoved", tab);
        });
    }
    tabsOnReplaced() {
        chrome.tabs.onReplaced.addListener((tab) => {
            this.chromeTabsQuery();
            console.log("onReplaced", tab);
        });
    }
    registerAllTabsListeners() {
        this.tabsOnActivated();
        this.tabsOnCreated();
        this.tabsOnUpdated();
        this.tabsOnMoved();
        this.tabsOnReplaced();
    }
}
const tabDetector = new chromeTabDetector();
tabDetector.registerAllTabsListeners();
function TimeoutError(args) {
    // TypeError: CreateListFromArrayLike called on non-object
    // https://stackoverflow.com/a/41354496/8808175
    const superInstance = Error.apply(null, [args]);
    copyOwnFrom(this, superInstance);
}
TimeoutError.prototype = Object.create(Error.prototype);
TimeoutError.prototype.constructor = TimeoutError;
function copyOwnFrom(target, source) {
    Object.getOwnPropertyNames(source).forEach(function (propName) {
        Object.defineProperty(target, propName, Object.getOwnPropertyDescriptor(source, propName));
    });
    return target;
}
class chromeSmmsMessageListener {
    constructor() {
        // Shared variable used to distinguish the return result of promise race
        this.smmsResponseUrl = "";
    }
    getBase64Url(blobUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const key = yield fetch(blobUrl).then((r) => r.blob());
            console.log("Successfully execute getBase64Url");
            return key;
        });
    }
    /**
     * Convert a base64 string in a Blob according to the data and contentType.
     *
     * @param b64Data Pure base64 string without contentType
     * @param contentType the content type of the file i.e (image/jpeg - image/png - text/plain)
     * @param sliceSize SliceSize to process the byteCharacters
     * @return Blob
     */
    b64toBlob(b64Data, contentType = "", sliceSize = 512) {
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
    delayPromise(ms) {
        return new Promise(function (resolve) {
            setTimeout(resolve, ms);
        });
    }
    timeoutPromise(promise, ms) {
        const timeout = this.delayPromise(ms).then(function () {
            return Promise.reject(new TimeoutError("Operation timed out after " + ms + " ms"));
        });
        return Promise.race([promise, timeout]);
    }
    cancelableFetch(blobData, apiToken) {
        const promise = new Promise(function (resolve, reject) {
            // const uploadUrl = "https://sm.ms/api/v2/upload";
            const uploadUrl = `https://api.imgbb.com/1/upload?expiration=600&key=${apiToken}`;
            const formData = new FormData();
            formData.append("image", blobData, "image.png");
            fetch(uploadUrl, {
                method: "POST",
                // headers: {
                //   Authorization: apiToken,
                // },
                body: formData,
            })
                .then((response) => {
                if (!response.ok) {
                    reject(new Error("Network response was not OK"));
                }
                return response.json();
            })
                .then((data) => {
                resolve(JSON.stringify(data));
                console.log(JSON.stringify(data));
            })
                .catch((error) => {
                reject(new Error(`Network response was not OK. ${error}`));
            });
        });
        return {
            promise: promise,
        };
    }
    smmsUrlPromiseRacer(base64data, sendResponse) {
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
            const apiToken = "3ac6bfb27cea21014fb0ebb9498202cb";
            // const imgUrl = getSMMSImageUrl(blobData, apiToken, sendResponse);
            const object = this.cancelableFetch(blobData, apiToken);
            // main
            this.timeoutPromise(object.promise, 60000)
                .then((contents) => {
                this.smmsResponseUrl = "";
                if (contents != "") {
                    const responseJSON = JSON.parse(contents);
                    if (responseJSON.success === true) {
                        this.smmsResponseUrl = responseJSON.data.url;
                        sendResponse(responseJSON.data.url);
                        console.log("Contents", responseJSON);
                        return;
                    }
                }
            })
                .catch((error) => {
                if (error instanceof TimeoutError) {
                    if (this.smmsResponseUrl.startsWith("http")) {
                        return;
                    }
                    else {
                        sendResponse("  Timeout Error. Please try again");
                        // promseRaceTimeout = false;
                        console.log(error);
                        return;
                    }
                }
                console.log("Fetch Error :", error);
                sendResponse("  Some error happened. Please try again");
                return;
            });
        }
        else {
            sendResponse("  Some error happened. Please try again");
        }
    }
    /**
     * triggerChromeSmmsMessageListener
     */
    triggerChromeSmmsMessageListener() {
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
            }
            else if (request.startsWith("data:image")) {
                console.log("FIREFOX RECEIVED");
                this.smmsUrlPromiseRacer(request, sendResponse);
            }
            return true; // return true to indicate that you want to send a response asynchronously
        });
    }
}
const smmsMessageListener = new chromeSmmsMessageListener();
smmsMessageListener.triggerChromeSmmsMessageListener();
