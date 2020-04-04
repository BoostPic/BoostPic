"use strict";

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.startsWith("blob")) {
//     console.log("RECEIVED");
//     sendResponse("https://i.loli.net/2020/04/04/b3ZcipV61gySJ8w.png");
//     console.log(message);

//     // let blob = await fetch(message).then(r => r.blob());
//   }
// });

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.startsWith("blob")) {
    console.log("RECEIVED");
    getBase64Url(request).then((res) => {
      console.log("Arrived here");
      // Acquired from https://stackoverflow.com/questions/18650168/convert-blob-to-base64/18650249#
      var reader = new FileReader();
      reader.readAsDataURL(res);
      reader.onloadend = function () {
        var base64data = reader.result;
        console.log(base64data);
        sendResponse(base64data);
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
  console.log("asfas" + key);
  return key;
}

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

// const postOptions = (
//   fileName: string,
//   image: Buffer,
//   apiToken: string
// ): any => {
//   return {
//     method: "POST",
//     url: "https://sm.ms/api/v2/upload",
//     headers: {
//       contentType: "multipart/form-data",
//       "User-Agent": "PicGo",
//       Authorization: apiToken,
//     },
//     formData: {
//       smfile: {
//         value: image,
//         options: {
//           filename: fileName,
//         },
//       },
//       ssl: "true",
//     },
//   };
// };

// const handle = async (ctx: PicGo): Promise<PicGo> => {
//   const smmsConfig = ctx.getConfig("picBed.smms.token");
//   if (!smmsConfig) {
//     throw new Error(
//       "Can't find smms config, please provide api token, see https://sm.ms/home/apitoken"
//     );
//   }
//   const imgList = ctx.output;
//   for (let i in imgList) {
//     let image = imgList[i].buffer;
//     if (!image && imgList[i].base64Image) {
//       image = Buffer.from(imgList[i].base64Image, "base64");
//     }
//     const postConfig = postOptions(imgList[i].fileName, image, smmsConfig);
//     let body = await ctx.Request.request(postConfig);
//     body = JSON.parse(body);
//     if (body.code === "success") {
//       delete imgList[i].base64Image;
//       delete imgList[i].buffer;
//       imgList[i]["imgUrl"] = body.data.url;
//     } else if (
//       body.code === "image_repeated" &&
//       typeof body.images === "string"
//     ) {
//       // do extra check since this error return is not documented at https://doc.sm.ms/#api-Image-Upload
//       delete imgList[i].base64Image;
//       delete imgList[i].buffer;
//       imgList[i]["imgUrl"] = body.images;
//     } else {
//       ctx.emit("notification", {
//         title: "上传失败",
//         body: body.message,
//       });
//       throw new Error(body.message);
//     }
//   }
//   return ctx;
// };
