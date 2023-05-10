import HttpClient from "./http/http-client";

export interface IAuthBody {
  email: string;
  password: string;
}

export interface ITokens {
  accessToken: string;
  refreshToken: string;
}
export const API = "https:super-anki.herokuapp.com/api";

export default class MainApi extends HttpClient {
  private static classInstance?: MainApi;

  private constructor() {
    super(API);
  }

  public static getInstance() {
    if (!this.classInstance) {
      this.classInstance = new MainApi();
    }

    return this.classInstance;
  }

  public login = (body: IAuthBody) => this.post<ITokens>("/auth/login", body);
}
