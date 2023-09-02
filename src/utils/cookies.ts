import { CookieBuilder, SameSite } from "patissier";

export const generateCooke = (name: string, value: string, expires: number) => {
  const cookie = new CookieBuilder()
    .name(name)
    .value(value)
    .sameSite(SameSite.Strict)
    .maxAge(expires)
    .path("/")
    .httpOnly();

  if (process.env.NODE_ENV === "production") {
    cookie.domain(process.env.RP_ID).secure();
  }

  return cookie.build();
};
