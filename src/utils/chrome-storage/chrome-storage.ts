// interface IStorage {
//   get(key: string): string | null;
//   set(key: string, value: string): void;
//   remove(key: string): void;
// }

export default abstract class ChromeStorage<T extends string, V extends any> {
  private readonly storage: chrome.storage.SyncStorageArea;

  protected constructor(getStorage = () => chrome.storage.sync) {
    this.storage = getStorage();
  }

  protected async get(key: T) {
    const res = await this.storage.get(key);

    return { [key]: res[key] };
  }

  protected set(items: { [k in T]?: V }) {
    return this.storage.set(items);
  }

  protected clearItem(key: T): void {
    this.storage.remove(key);
  }

  protected clearItems(keys: T[]): void {
    keys.forEach((key) => this.clearItem(key));
  }
}

// type Keys = "user" | "tokens" | "isLoggedIn";

// export const store = {
//   get: <T extends any>(key: string): Promise<{ [k: string]: T }> =>
//     chrome.storage.sync.get(key),
//   set: <T extends any>(items: { [k: string]: T }) =>
//     chrome.storage.sync.set(items),
// };
