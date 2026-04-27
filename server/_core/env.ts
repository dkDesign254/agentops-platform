export const ENV = {
  // Platform / app identity
  appId: process.env.VITE_APP_ID ?? "",

  // JWT cookie sessions (tRPC protectedProcedure)
  cookieSecret: process.env.JWT_SECRET ?? "",

  // Database (Drizzle direct connection)
  databaseUrl: process.env.DATABASE_URL ?? "",

  isProduction: process.env.NODE_ENV === "production",

  // LLM gateway (Forge / Gemini)
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",

  // Make.com runtime dispatch
  makeApiKey: process.env.MAKE_API_KEY ?? "",

  // Airtable (server-side only — never exposed to browser)
  airtableApiKey: process.env.AIRTABLE_API_KEY ?? "",
  airtableBaseId: process.env.AIRTABLE_BASE_ID ?? "app4DDa3zvaGspOhz",
};
