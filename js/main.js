// main.js
const PicGo = require("picgo");
const picgo = new PicGo();


function detectPasteKeyboard(params) {}

function distinguishClipboardContent(params) {}

function uploadPastedImage(params) {}

function detectEnterKeyboard(params) {}

function detectSearchClick(params) {}

function main(params) {}

function my_clock(el) {
  var today = new Date();
  var h = today.getHours();
  var m = today.getMinutes();
  var s = today.getSeconds();
  m = m >= 10 ? m : "0" + m;
  s = s >= 10 ? s : "0" + s;
  el.innerHTML = h + ":" + m + ":" + s;
  setTimeout(function() {
    my_clock(el);
  }, 1000);
}

var clock_div = document.getElementById("clock_div");
my_clock(clock_div);

document.addEventListener("DOMContentLoaded", () => {
  "use strict";

  document.addEventListener("keydown", event => {
    console.log(event.key);
  });
});

