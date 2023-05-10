import Tokens from "@/utils/chrome-storage/tokens";
import HttpClientProtected from "./http/http-client-protected";
import { API } from "./main";

interface IGetMeResponse {
  request_num: number;
  data: { email: string };
}

export interface IGetPartBody {
  limit: number;
  offset: number;
}

export interface IWord {
  word: string;
  translate: string;
  context?: string;
  homeURL?: string;
}

export interface IFullWord extends IWord {
  userId: number;
  createdAt: string;
  countUses: number;
  studyFrom: string;
  id: number;
}

export default class MainApiProtected extends HttpClientProtected {
  private static classInstance?: MainApiProtected;

  private constructor() {
    super(API);
  }

  public static getInstance() {
    if (!this.classInstance) {
      this.classInstance = new MainApiProtected();
    }

    return this.classInstance;
  }

  public getMe = () => this.protectedGet<IGetMeResponse>("/auth/me1");

  public getLogout = () => Tokens.getInstance().clear();

  public postNewWord = (body: IWord) =>
    this.protectedPost<IFullWord>("/card", body);

  //collections
  // public getCollectionsList = (
  //   params: IGetPartBody | undefined = { limit: 20, offset: 0 }
  // ) =>
  //   this.instance.get<IFullCollection[]>("/collections/findAllForUser", {
  //     params,
  //   });

  // public postNewCollection = (body: ICollection) =>
  //   this.instance.post<IFullCollection>("/collections", body);

  //cards & collections relation

  // public postCardsToCollection = (body: { id: number; cardIds: number[] }) =>
  //   this.instance.post<ICollectionWithCards>(
  //     "/collections/addCardsToCollection",
  //     body
  //   );

  //deepl
  public postTranslate = (body: { text: string }) =>
    this.protectedPost<{ translate: string }>("/deepl/translate", body);
}
