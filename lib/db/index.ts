import "server-only";

import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";

import * as schema from "./schema";

// HTTP driver: one short request per query, the right fit for serverless functions.
// Created on first use, so the build (which has no DATABASE_URL) never needs it.
let instance: ReturnType<typeof create> | undefined;

function create() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL lipsește");
  return drizzle({ client: neon(url), schema });
}

export function db() {
  instance ??= create();
  return instance;
}

export { schema };
