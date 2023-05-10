// eslint-disable-next-line @typescript-eslint/no-unused-vars
import axios from "axios";
export interface IResponse<T = undefined> {
  status: number;
  message: string;
  data: T;
}
declare module "axios" {
  interface AxiosResponse<T = any> extends Promise<IResponse<T>> {}
}
