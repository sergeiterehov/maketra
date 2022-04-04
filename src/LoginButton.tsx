import { runInAction } from "mobx";
import { observer } from "mobx-react-lite";
import { useCallback } from "react";
import styled from "styled-components";
import { API } from "./api";
import { appState, LoginStatus, UserGender } from "./appState";

export const LoginButton = styled(
  observer<{ className?: string }>(({ className }) => {
    const { loginStatus } = appState;

    const loginClickHandler: React.MouseEventHandler<HTMLAnchorElement> =
      useCallback((e) => {
        const popup = window.open(
          e.currentTarget.href,
          "popup",
          "width=600,height=600"
        );

        if (!popup) return;

        runInAction(() => (appState.loginStatus = LoginStatus.InProgress));

        e.preventDefault();
        e.stopPropagation();

        const timer = setInterval(() => {
          const token = /access_token=([^&]+)/.exec(popup.location.hash)?.[1];

          if (!token) return;

          clearInterval(timer);
          popup.onclose = null;
          popup.close();

          API.Auth.yandex(token)
            .then((user) => {
              appState.setUser({
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                sex: user.sex as UserGender,
                yandexAvatarId: user.yandexAvatarId,
                yandexId: user.yandexAvatarId,
              });
            })
            .catch(() => {
              appState.setUser(undefined);
            });
        }, 1000);

        popup.onclose = () => {
          clearInterval(timer);
          runInAction(() => (appState.loginStatus = LoginStatus.Unauthorized));
        };
      }, []);

    return (
      <div className={className}>
        {loginStatus === LoginStatus.Unauthorized && (
          <a
            href={`https://oauth.yandex.ru/authorize?${new URLSearchParams({
              response_type: "token",
              client_id: "2319d9f996224445bd2a66bbe0709364",
              redirect_uri: window.location.origin + "/oauth/yandex",
              display: "popup",
            })}`}
            onClick={loginClickHandler}
          >
            Войти с Яндекс ID
          </a>
        )}
        {loginStatus === LoginStatus.InProgress && <span>Входим...</span>}
        {appState.user && (
          <span>{`${appState.user.lastName} ${appState.user.firstName}`}</span>
        )}
      </div>
    );
  })
).withConfig({
  displayName: "LoginButton",
})`
  cursor: default;

  a {
    color: inherit;
    text-decoration: none;
  }
`;
