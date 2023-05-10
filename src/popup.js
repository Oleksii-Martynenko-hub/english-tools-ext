// Initialize butotn with users's prefered color
let changeColor = document.getElementById("changeColor");

chrome.storage.sync.get("color", ({ color }) => {
  changeColor.style.backgroundColor = color;
});

// When the button is clicked, inject setPageBackgroundColor into current page
changeColor.addEventListener("click", async () => {
  let [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

  chrome.scripting.executeScript({
    target: { tabId: tab.id },
    function: setPageBackgroundColor,
  });
});

// The body of this function will be execuetd as a content script inside the
// current page
function setPageBackgroundColor() {
  chrome.storage.sync.get("color", ({ color }) => {
    document.body.style.backgroundColor = color;
  });
}

// document.addEventListener("click", (e) => {
//   console.log("click");
// })

chrome.runtime.onMessage.addListener((req, sender, callback) => {
  if (req.msg === "ADD_EVENT_SELECTED_TEXT") {
    console.log(req.msg);
    document.addEventListener("click", (e) => {
      console.log("test - " + e.pageY + " : " + e.pageX);
      // chrome.runtime.sendMessage(
      //   { msg: "SELECTED_WORD", word: "test - " + e.pageY + " : " + e.pageX },
      //   (res) => {
      //     console.log(res.msg);
      //   }
      // );
      // callback({ word: "test - " + e.pageY + " : " + e.pageX });
    });
    callback({ msg: "Event listener onclick run!" });
  }
  // if (req.msg === "REMOVE_EVENT_SELECTED_TEXT") {
  //   console.log(req.msg);
  //   document.removeEventListener("click", handleClickEvent(callback));
  //   callback({ msg: "Event listener onclick run!" });
  // }
});

// const handleClickEvent = (callback) => (e) => {
//   callback({ word: "test - " + e.pageY + " : " + e.pageX });
// };
