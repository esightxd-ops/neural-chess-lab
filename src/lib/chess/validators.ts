import { z } from "zod";

// Chess.com username rules at the API boundary. Extracted so tests can
// import without pulling in the server-fn module.
export const UsernameSchema = z
  .string()
  .trim()
  .min(2)
  .max(40)
  .regex(/^[a-zA-Z0-9_-]+$/, "Invalid Chess.com username");

// MVP import caps — kept here so they have a single source of truth.
export const MAX_MONTHS = 6;
export const MAX_GAMES = 400;
