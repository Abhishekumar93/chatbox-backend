import "express";

declare module "express" {
  export interface Response {
    userId?: string;
  }
}
