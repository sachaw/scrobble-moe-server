export const base64Decode = (str: string) => {
  return Buffer.from(str, "base64").toString("utf-8");
};

export const base64Encode = (str: string) => {
  return Buffer.from(str).toString("base64");
};
