import { Messages } from "../@types/Constants";

export const secretKey = "alsdfkjl3jf9sd3h03ru3fs90e8u3fhsdifj" as const;

type Response<R> = (response: { data: R }) => void;
type Callback<T, R> = (
  data: T,
  response: Response<R>,
  sender: chrome.runtime.MessageSender
) => void;

interface Request<T> {
  secret: string;
  msg: Messages;
  data: T;
}

export const messageListener = <T = undefined, R = undefined>(
  msg: Messages,
  callback: Callback<T, R>,
  isAsync?: boolean
) => {
  chrome.runtime.onMessage.addListener(
    (req: Request<T>, sender, response: Response<R>) => {
      if (req.secret === secretKey) {
        if (req.msg === msg) {
          callback(req.data, response, sender);
          if (!isAsync) return;
          return true;
        }
      }
    }
  );
};
