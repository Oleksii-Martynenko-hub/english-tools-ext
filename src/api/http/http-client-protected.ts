import axios, { AxiosRequestConfig } from "axios";
import Tokens from "../../utils/chrome-storage/tokens";
import HttpClient, { HttpRequest, HttpRequestArgs } from "./http-client";
import { IResponse } from "@/@types/axios";
import { ITokens } from "../main";

export default abstract class HttpClientProtected extends HttpClient {
  protected constructor(baseURL: string) {
    super(baseURL);
  }

  protected protectedPost = async <R>(
    route: string,
    body?: any,
    headers: HeadersInit = {}
  ) => {
    return await this.protectedRequest<R>({
      method: "POST",
      route,
      body: body || null,
      headers,
    });
  };

  protected protectedGet = async <R>(
    route: string,
    headers: HeadersInit = {}
  ) => {
    return await this.protectedRequest<R>({
      method: "GET",
      route,
      headers,
    });
  };

  private protectedRequest = async <R>(args: HttpRequestArgs) => {
    return await this.handleRequest<R>(this.request, args);
  };

  private handleRequest = async <R>(
    request: HttpRequest,
    args: HttpRequestArgs
  ) => {
    try {
      const tokens = Tokens.getInstance();

      const accessToken = await tokens.getAccessToken();
      if (!accessToken) {
        throw { status: 400, message: "User doesn't authorize!" };
      }

      this.config.headers = {
        ...this.config.headers,
        Authorization: `Bearer ${accessToken}`,
      };

      const response = await request<R>({
        ...args,
        headers: this.config.headers,
      });

      if (response.status === 200) {
        return response;
      }

      throw { response };
    } catch (error) {
      return this.handleResponseError<R>(error, request, args);
    }
  };

  private handleResponseError = async <R>(
    e: any,
    request: HttpRequest,
    args: HttpRequestArgs
  ) => {
    const status = e.response ? e.response.status : null;
    const msg = e?.response?.message;

    const tokens = Tokens.getInstance();
    const currentRefreshToken = await tokens.getRefreshToken();

    if (
      status === 400 &&
      (msg === "Forbidden" ||
        msg === "Token was expired" ||
        msg === "Refresh token already used" ||
        msg === "User doesn't authorize!") &&
      currentRefreshToken
    ) {
      try {
        const newTokens = await this.refreshTokens(currentRefreshToken);

        if (newTokens) {
          const { accessToken, refreshToken } = newTokens;

          tokens.setAccessToken(accessToken);
          tokens.setRefreshToken(refreshToken);

          this.config.headers = {
            ...this.config.headers,
            Authorization: `Bearer ${accessToken}`,
          };

          const res = await request<R>({
            ...args,
            headers: this.config.headers,
          });

          return res;
        }
      } catch (_) {
        tokens.clear();

        return Promise.reject(e);
      }
    }

    return Promise.reject(e);
  };

  private async refreshTokens(currentRefreshToken: string) {
    try {
      const response = await fetch(this.url + "/auth/refresh", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Bearer ${currentRefreshToken}`,
        },
      });
      const res = await response.json();

      if (res?.data && res?.data.accessToken && res?.data.refreshToken)
        return res?.data;
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
