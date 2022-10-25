import { isDev } from "../config";

export function captureException(file: string, ...msg: Array<string>) {
  if (isDev) {
    console.error(file, msg);
  }
}
