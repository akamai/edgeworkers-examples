import md5 from "md5";

export function hash(message: string) {
  return md5(message);
}
