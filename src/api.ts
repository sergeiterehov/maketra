export class APIError extends Error {
  constructor(public response: Response, message?: string) {
    super(message);
  }
}

class Auth {
  static async yandex(token: string): Promise<{
    firstName: string;
    lastName: string;
    email: string;
    sex: string;
    yandexId: string;
    yandexAvatarId: string;
  }> {
    const res = await fetch(`${API.host}/auth/yandex`, {
      method: "POST",
      cache: "no-cache",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        oauthToken: token,
      }),
    });

    if (!res.ok) throw new APIError(res);

    return res.json();
  }
}

class User {
  static async get(): Promise<{
    firstName: string;
    lastName: string;
    email: string;
    sex: string;
    yandexId: string;
    yandexAvatarId: string;
  }> {
    const res = await fetch(`${API.host}/user`, {
      method: "GET",
      cache: "no-cache",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!res.ok) throw new APIError(res);

    return res.json();
  }
}

export class API {
  static host: string = "https://dev.maketra.ru/api";

  static Auth = Auth;
  static User = User;
}
