declare global {
  namespace Windows {
    type Base = {
      width?: number;
      height?: number;
      minWidth?: number;
      minHeight?: number;
      title?: string;
      frame?: boolean;
      center?: boolean;
      resizable?: boolean;
      modal?: boolean;
    };

    type SearchType = { [key: string]: string };
  }
}

export {};
