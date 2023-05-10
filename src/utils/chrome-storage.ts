type Keys = "user" | "tokens" | "isLoggedIn";

export const store = {
  get: <T extends any>(key: Keys): Promise<{ [k in Keys]?: T }> =>
    chrome.storage.sync.get(key),
  set: <T extends any>(items: { [k in Keys]?: T }) =>
    chrome.storage.sync.set(items),
};
