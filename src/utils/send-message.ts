import { Messages } from "../@types/Constants";
import { secretKey } from "./message-listener";

interface Args<T, R> {
  tabId?: number;
  msg: Messages;
  data?: T;
  responseCallback?: (data: R) => void;
}

export const sendMessage = <T = undefined, R = undefined>({
  tabId,
  msg,
  data,
  responseCallback,
}: Args<T, R>) => {
  const callback: (res: { data: R }) => void = (res) => {
    if (!window.chrome.runtime.lastError) {
      if (res) {
        if (res.data && responseCallback) responseCallback(res.data);
      }
    }
  };

  if (tabId)
    chrome.tabs.sendMessage(tabId, { secret: secretKey, msg, data }, callback);
  if (!tabId)
    chrome.runtime.sendMessage({ secret: secretKey, msg, data }, callback);
};
