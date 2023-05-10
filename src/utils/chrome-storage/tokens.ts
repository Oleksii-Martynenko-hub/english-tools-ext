import ChromeStorage from "./chrome-storage";

enum Locals {
  ACCESS_TOKEN = "access_token",
  REFRESH_TOKEN = "refresh_token",
}

export default class Tokens extends ChromeStorage<Locals, string> {
  private static instance?: Tokens;

  private constructor() {
    super();
  }

  public static getInstance() {
    if (!this.instance) {
      this.instance = new Tokens();
    }

    return this.instance;
  }

  public async getAccessToken() {
    const res = await this.get(Locals.ACCESS_TOKEN);

    return res[Locals.ACCESS_TOKEN] || null;
  }

  public setAccessToken(accessToken: string) {
    return this.set({ [Locals.ACCESS_TOKEN]: accessToken });
  }

  public async getRefreshToken() {
    const res = await this.get(Locals.REFRESH_TOKEN);

    return res[Locals.REFRESH_TOKEN] || null;
  }

  public setRefreshToken(refreshToken: string) {
    return this.set({ [Locals.REFRESH_TOKEN]: refreshToken });
  }

  public clear() {
    this.clearItems([Locals.ACCESS_TOKEN, Locals.REFRESH_TOKEN]);
  }
}
