import { observable } from "mobx";

export enum LoginStatus {
  Unauthorized,
  InProgress,
  Authorized,
}

export const appState = observable({
  user: undefined,
  loginStatus: LoginStatus.Unauthorized,
});
