import { action, observable } from "mobx";

export enum LoginStatus {
  Unauthorized,
  InProgress,
  Authorized,
}

export enum UserGender {
  Male = "male",
  Female = "female",
}

export type User = {
  firstName: string;
  lastName: string;
  email: string;
  sex: UserGender;
  yandexId: string;
  yandexAvatarId: string;
};

export const appState = observable(
  {
    user: undefined as User | undefined,
    loginStatus: LoginStatus.Unauthorized,

    setUser(user?: User) {
      this.user = user;

      if (user) {
        this.loginStatus = LoginStatus.Authorized;
      } else {
        this.loginStatus = LoginStatus.Unauthorized;
      }
    },
  },
  {
    setUser: action,
  }
);
