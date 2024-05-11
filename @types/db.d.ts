declare global {
  namespace DB {
    interface Role {
      id?: number;
      roleKeyword?: string;
      roleName?: string;
      roleColor?: string;
      roleIcon?: string;
      roleAvatar?: string;
      cardBackground?: string;
    }
  }
}

export {};
