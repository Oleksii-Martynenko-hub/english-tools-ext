import MainApi from "../api/main";
import { Messages } from "../@types/Constants";
import { store } from "../utils/chrome-storage";
import { messageListener, secretKey } from "../utils/message-listener";
import MainApiProtected from "../api/main-protected";

console.log("from back");

export interface IUser {
  email: string;
  password: string;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}

const mainApiProtected = MainApiProtected.getInstance();

const handleOnCompleteListener: (
  details: chrome.webNavigation.WebNavigationFramedCallbackDetails
) => void = ({ tabId, url }) => {
  chrome.scripting.executeScript({
    target: { tabId },
    files: ["./content-script.js"],
  });
};

const handleOnConnectListener: (port: chrome.runtime.Port) => void = (port) => {
  if (port.name === secretKey) {
    port.onMessage.addListener(async ({ msg, data }, port) => {
      try {
        if (msg === "event selected word" && data["word"]) {
          const { data: translate } = await mainApiProtected.postTranslate({
            text: data.word as string,
          });

          port.postMessage({
            msg: "word successfully translated",
            data: { translate },
          });
        }
        if (msg === "event submit card" && data["card"] && port.sender) {
          const { data: card } = await mainApiProtected.postNewWord({
            ...data.card,
            homeURL: port.sender?.url,
          });

          port.postMessage({
            msg: "card successfully added",
            data: { card },
          });
        }
      } catch (error) {
        console.error(error);
      }
    });
  }
};

const loadScript = (callback?: VoidFunction) => {
  store.get("isLoggedIn").then(({ isLoggedIn }) => {
    if (isLoggedIn) {
      if (callback) {
        callback();
        return;
      }
      chrome.webNavigation.onCompleted.addListener(handleOnCompleteListener);
    }
  });
};

chrome.runtime.onInstalled.addListener(async () => {
  try {
    chrome.runtime.onConnect.addListener(handleOnConnectListener);

    const { data } = await mainApiProtected.getMe();

    loadScript();
  } catch (_) {
    store.set({ isLoggedIn: false });

    chrome.storage.onChanged.addListener((changes, areaName) => {
      if (areaName === "sync" && changes["isLoggedIn"] !== undefined) {
        loadScript();

        loadScript(() => {
          chrome.tabs.query({ currentWindow: true, active: true }, (tabs) => {
            const tabId = tabs.length > 0 ? tabs[0].id || 0 : 0;
            chrome.scripting.executeScript({
              target: { tabId },
              files: ["./content-script.js"],
            });
          });
        });

        if (
          changes.isLoggedIn.newValue === false &&
          changes.isLoggedIn.oldValue === true
        ) {
          chrome.webNavigation.onCompleted.removeListener(
            handleOnCompleteListener
          );
          chrome.runtime.onConnect.removeListener(handleOnConnectListener);
        }
      }
    });
  }
});
