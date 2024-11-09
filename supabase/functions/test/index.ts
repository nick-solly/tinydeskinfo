// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { count } from "drizzle-orm";
import { videos } from "db/schema.ts";


const connectionString = Deno.env.get('DATABASE_URL')!


Deno.serve(async (req) => {
  const client = postgres(connectionString, { prepare: false });
  const db = drizzle(client);

  const currentVideos = await db.select({ count: count() }).from(videos);

  console.log("Current Video Count:", currentVideos)

  return new Response(
    JSON.stringify(currentVideos),
    { headers: { "Content-Type": "application/json" } },
  )
})

