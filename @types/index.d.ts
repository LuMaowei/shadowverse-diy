// Record相关：https://blog.csdn.net/weixin_38080573/article/details/92838045
declare type IAnyObject = Record<string, any>;

declare type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};
