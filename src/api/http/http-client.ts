import Tokens from "@/utils/chrome-storage/tokens";
import { ITokens } from "../main";
// import axios, { AxiosInstance, AxiosResponse } from "axios";
// import refreshTokens from "./refresh-tokens";
// import adapter from 'axios/lib/adapters';

interface IResponse<T> {
  status: number;
  message: string;
  data?: T;
}

interface HttpClientConfig {
  headers: HeadersInit;
}

export type HttpRequestArgs = {
  method: string;
  route: string;
  body?: any;
  headers: HeadersInit;
};

export type HttpRequest = <R>(args: HttpRequestArgs) => Promise<IResponse<R>>;

export default abstract class HttpClient {
  protected readonly url: string;
  protected config: HttpClientConfig;

  protected constructor(baseURL: string) {
    this.url = baseURL;
    this.config = {
      headers: { "Content-Type": "application/json;charset=UTF-8" },
    };
  }

  protected request: HttpRequest = async ({
    method,
    route,
    body = undefined,
    headers,
    // ,params?: T | null
  }) => {
    try {
      const response = await fetch(this.url + route, {
        method,
        body: JSON.stringify(body),
        headers: {
          ...this.config.headers,
          ...headers,
        },
      });

      return await response.json();
    } catch (error) {
      return Promise.reject(error);
    }
  };

  protected post = async <R>(
    route: string,
    body?: any,
    headers: HeadersInit = {}
  ) => {
    return await this.request<R>({
      method: "POST",
      route,
      body: body || null,
      headers,
    });
  };

  protected get = async <R>(route: string, headers: HeadersInit = {}) => {
    return await this.request<R>({
      method: "GET",
      route,
      body: null,
      headers,
    });
  };
}
