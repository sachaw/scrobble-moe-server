import InfisicalClient from "infisical-node";

export const client = new InfisicalClient({
  token: "your_infisical_token",
});

export const secrets = {
  DATABASE_URL: (await client.getSecret("DATABASE_URL")).secretValue,
  REDIS_URL: (await client.getSecret("REDIS_URL")).secretValue,
  JWT_PUBLIC_KEY: Buffer.from(
    (await client.getSecret("JWT_PUBLIC_KEY")).secretValue,
    "base64",
  ).toString(),
  JWT_PRIVATE_KEY: Buffer.from(
    (await client.getSecret("JWT_PRIVATE_KEY")).secretValue,
    "base64",
  ).toString(),
  ANILIST_ID: (await client.getSecret("ANILIST_ID")).secretValue,
  ANILIST_SECRET: (await client.getSecret("ANILIST_SECRET")).secretValue,
  ANILIST_REDIRECT_URL: (await client.getSecret("ANILIST_REDIRECT_URL"))
    .secretValue,
  RP_ID: (await client.getSecret("RP_ID")).secretValue,
  RP_NAME: (await client.getSecret("RP_NAME")).secretValue,
  RP_ORIGIN: (await client.getSecret("RP_ORIGIN")).secretValue,
  PORT: (await client.getSecret("PORT")).secretValue,
};
