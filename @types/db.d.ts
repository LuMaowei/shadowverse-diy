declare global {
  namespace DB {
    interface UserAttributes {
      id?: number;
      userId: number;
      account: string;
      token: string;
      avatar?: string;
      email?: string;
      regisTime: string;
      updateTime: string;
    }

    interface UserInfo {
      id: number;
      account: string;
      avatar?: string;
      email?: string;
      regisTime: string;
      updateTime: string;
    }
  }
}

export {};
