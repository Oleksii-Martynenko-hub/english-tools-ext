import { getSelectedText } from "@/utils/get-selected-text";
import { Messages } from "../@types/Constants";
import { store } from "../utils/chrome-storage";
import { messageListener, secretKey } from "../utils/message-listener";
import { sendMessage } from "../utils/send-message";
import components from "@/components/components";

import "@/styles/content-styles.scss";

///////////////////////////////////////////////////////
// if request is wrong, show error message
///////////////////////////////////////////////////////

console.log("from page");

const {
  root,
  btn,
  form,
  inputWord,
  inputTranslate,
  formBtn,
  formCloseBtn,
  formTitle,
} = components;

const port = chrome.runtime.connect({
  name: secretKey,
});

port.onMessage.addListener(({ msg, data }, port) => {
  if (msg === "word successfully translated" && data["translate"]) {
    inputWord.value = selectedWord;
    inputTranslate.value = data.translate.translate;

    form.classList.add("visible");
    btn.classList.remove("visible");
    btn.classList.remove("loading");
    form.style.left = formPos.x + "px";
    form.style.top = formPos.y + "px";
  }

  if (msg === "card successfully added" && data["card"]) {
    form.classList.add("success");
    form.classList.remove("loading");

    setTimeout(() => {
      form.classList.remove("visible");
      form.classList.remove("success");
      isFormVisible = false;
    }, 1000);
  }
});

let selectedWord = "";
let isBtnVisible = false;
let isFormVisible = false;
const btnPos = { x: 0, y: { start: 0, end: 0 } };
const formPos = { x: 0, y: 0 };
const formMovePos = { start: { x: 0, y: 0 }, end: { x: 0, y: 0 } };

// var targetObj: { [key: string]: any } = {};
// var targetProxy = new Proxy(targetObj, {
//   set: function (target, key: string, value) {
//     console.log(`${key} set to ${value}`);
//     target[key] = value;
//     return true;
//   },
// });

document.addEventListener("mousedown", (e) => {
  if (e.target === formTitle) {
    formMovePos.start = { x: e.pageX, y: e.pageY };
    document.addEventListener("mousemove", handleMouseMoveOnForm);
  }

  if (!isBtnVisible) {
    btnPos.y.start = e.pageY;
  }
  cancelSelected(e);
});

document.addEventListener("mouseup", (e) => {
  if (e.target === formTitle) {
    document.removeEventListener("mousemove", handleMouseMoveOnForm);
  }

  if (!isBtnVisible) {
    btnPos.y.end = e.pageY;
    btnPos.x = e.pageX;
    const string = getSelectedText();

    if (
      string &&
      string.split(" ").filter((w) => w).length === 1 &&
      !selectedWord &&
      !isFormVisible
    ) {
      selectedWord = string;
      isBtnVisible = true;

      btn.classList.add("visible");
      btn.style.left = btnPos.x + "px";
      btn.style.top =
        (btnPos.y.end >= btnPos.y.start
          ? btnPos.y.end + 10
          : btnPos.y.end - 60) + "px";

      btn.addEventListener("click", handleOnClickBtn);
    }
  }
});

formBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();

  form.classList.add("loading");

  port.postMessage({
    msg: "event submit card",
    data: {
      card: {
        word: inputWord.value,
        translate: inputTranslate.value,
      },
    },
  });
});

formCloseBtn.addEventListener("click", (e) => {
  e.preventDefault();
  e.stopPropagation();

  form.classList.remove("visible");
  isFormVisible = false;
});

const handleOnClickBtn = (e: MouseEvent) => {
  port.postMessage({
    msg: "event selected word",
    data: { word: selectedWord },
  });

  isFormVisible = true;
  formPos.x = btnPos.x + 46;
  formPos.y =
    btnPos.y.end >= btnPos.y.start ? btnPos.y.end + 10 : btnPos.y.end - 60;

  btn.classList.add("loading");

  cancelSelected(e);
};

const handleMouseMoveOnForm = (e: MouseEvent) => {
  form.style.left = formPos.x + (e.pageX - formMovePos.start.x) + "px";
  form.style.top = formPos.y + (e.pageY - formMovePos.start.y) + "px";
};

const cancelSelected = (e: MouseEvent) => {
  if (e.target !== btn && isBtnVisible) {
    btn.removeEventListener("click", handleOnClickBtn);
    selectedWord = "";
    isBtnVisible = false;
    btn.classList.remove("visible");
    return;
  }
};
