"use strict";

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.startsWith("blob")) {
    console.log("RECEIVED");
    getBase64Url(request).then((res) => {
      console.log("Arrived here");
      // Acquired from https://stackoverflow.com/questions/18650168/convert-blob-to-base64/18650249#
      const reader = new FileReader();
      reader.readAsDataURL(res);
      reader.onloadend = function () {
        const base64data = reader.result;
        console.log(base64data);

        // base64 to blob object to upload, inspired from https://ourcodeworld.com/articles/read/322/how-to-convert-a-base64-image-into-a-image-file-and-upload-it-with-an-asynchronous-form-using-jquery

        // Split the base64 string in data and contentType
        const block = base64data.split(";");
        // Get the content type of the image
        const contentType = block[0].split(":")[1];
        // get the real base64 content of the file
        const realData = block[1].split(",")[1]; // In this case "R0lGODlhPQBEAPeoAJosM...."
        // Convert it to a blob to upload
        const blobData = b64toBlob(realData, contentType);

        const apiToken = "rd1v9rtYAyQW7yHgykZvj97S3LygVW0I";
        const imgUrl = getSMMSImageUrl(blobData, apiToken);
        console.log(`Send Response: ${imgUrl}`);
        sendResponse(imgUrl);
      };
    });
  }
  return true; // return true to indicate that you want to send a response asynchronously
});

// Inspired from https://stackoverflow.com/questions/44056271/chrome-runtime-onmessage-response-with-async-await
async function getBase64Url(blobUrl) {
  // var key = await requestsBlob(blobUrl);
  // Modern way to get blob object from blob url, acquired from https://stackoverflow.com/questions/11876175/how-to-get-a-file-or-blob-from-an-object-url
  var key = await fetch(blobUrl).then((r) => r.blob());
  // await .....
  console.log("Successfully execute getBase64Url");
  return key;
}

/**
 * Convert a base64 string in a Blob according to the data and contentType.
 *
 * @param b64Data {String} Pure base64 string without contentType
 * @param contentType {String} the content type of the file i.e (image/jpeg - image/png - text/plain)
 * @param sliceSize {Int} SliceSize to process the byteCharacters
 * @see http://stackoverflow.com/questions/16245767/creating-a-blob-from-a-base64-string-in-javascript
 * @return Blob
 */
function b64toBlob(b64Data, contentType, sliceSize) {
  contentType = contentType || "";
  sliceSize = sliceSize || 512;

  var byteCharacters = atob(b64Data);
  var byteArrays = [];

  for (var offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    var slice = byteCharacters.slice(offset, offset + sliceSize);

    var byteNumbers = new Array(slice.length);
    for (var i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    var byteArray = new Uint8Array(byteNumbers);

    byteArrays.push(byteArray);
  }

  var blob = new Blob(byteArrays, { type: contentType });
  return blob;
}

function base64ToArrayBuffer(base64) {
  var binary_string = window.atob(base64);
  var len = binary_string.length;
  var bytes = new Uint8Array(len);
  for (var i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
}

function getSMMSImageUrl(blobData, apiToken) {
  const xhr = new XMLHttpRequest();
  const uploadUrl = "https://sm.ms/api/v2/upload";
  const formData = new FormData();
  formData.append("smfile", blobData, "image.png");
  formData.append("file_id", "0");
  xhr.open("POST", uploadUrl, true);
  xhr.setRequestHeader("Authorization", apiToken);
  xhr.onreadystatechange = () => {
    if (xhr.readyState == 4 && xhr.status == 200) {
      console.log(xhr.responseText);
      const responseJson = JSON.parse(xhr.responseText);
      //   return responseJson.data.url;
      return "200";
    }
  };
  xhr.send(formData);
}

/*
 *
 * For line 53
 *
 */
// function requestsBlob(blobUrl) {
//   const xhr = new XMLHttpRequest();
//   xhr.open("GET", blobUrl, true);
//   xhr.responseType = "blob";
//   xhr.onload = function (e) {
//     if (this.status == 200) {
//       const myBlob = this.response;
//       // myBlob is now the blob that the object URL pointed to.
//       var reader = new FileReader();
//       reader.readAsDataURL(myBlob);
//       reader.onloadend = function () {
//         var base64data = reader.result;
//         console.log(base64data);
//         // sendResponse(base64data);
//         return base64data;
//       };
//     }
//   };
//   xhr.send();
// }
