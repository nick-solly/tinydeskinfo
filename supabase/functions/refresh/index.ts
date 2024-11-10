// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import google from "@googleapis/youtube"
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { sql, count } from "drizzle-orm";
import { videos } from "db/schema.ts";


const connectionString = Deno.env.get('DATABASE_URL')!


Deno.serve(async (req) => {

  console.log("Step 1 - Authenticating")

  const googleApiKey = Deno.env.get('GOOGLE_API_KEY')

  if (!googleApiKey) {
    return new Response(
      JSON.stringify({ error: "Missing GOOGLE_API_KEY" }),
      { status: 500, headers: { "Content-Type": "application/json" } })
  }

  const youtube = google.youtube({
    version: 'v3',
    auth: googleApiKey,
  })

  console.log("Step 2 - Get Upload Playlist")

  const res = await youtube.channels.list({
    part: ["contentDetails"],
    forHandle: "@nprmusic",
  })

  const uploadPlaylistId = res.data.items?.[0].contentDetails?.relatedPlaylists?.uploads

  if (!uploadPlaylistId) {
    return new Response(
      JSON.stringify({ error: "Could not find upload playlist" }),
      { status: 500, headers: { "Content-Type": "application/json" } })
  }

  console.log("Step 3 - Fetch Videos")

  async function fetchVideos(uploadPlaylistId: string, nextPageToken: string | null | undefined) {
    const resp = await youtube.playlistItems.list({
      part: ["snippet"],
      playlistId: uploadPlaylistId,
      maxResults: 50,
      ...nextPageToken ? {pageToken: nextPageToken} : {},
    })

    return {
      items: resp.data.items,
      nextPageToken: resp.data.nextPageToken,
    }

  }

  const playlistItems: google.youtube_v3.Schema$PlaylistItem[] = []
  let nextPageToken = null
  let items
  let i = 0

  do {
    console.log(`       - page ${i + 1}`);
    ({ items, nextPageToken } = await fetchVideos(uploadPlaylistId, nextPageToken))
    if (items) {
      playlistItems.push(...items)
    }
    i++
  } while (nextPageToken)

  if (!playlistItems) {
    return new Response(
      JSON.stringify({ error: "Could not find videos" }),
      { status: 500, headers: { "Content-Type": "application/json" } })
  }

  console.log("Step 4 - Fetch Statistics")

  function chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  const videoIds = playlistItems.map((video) => video.snippet?.resourceId?.videoId!)
  const videoIdChunks = chunkArray(videoIds, 50);

  const videoStatsPromises = videoIdChunks.map(chunk =>
    youtube.videos.list({
      part: ["statistics", "snippet", "contentDetails"],
      id: chunk,
    })
  );

  const videoStatsResponses = await Promise.all(videoStatsPromises);
  const videoStats = videoStatsResponses.map(response => response.data.items || []).flat();

  const durationToSeconds = (duration: string) => {
    const match = duration.match(/PT(\d+H)?(\d+M)?(\d+S)?/);
    if (!match) return 0;
    const hours = parseInt(match[1] || "0");
    const minutes = parseInt(match[2] || "0");
    const seconds = parseInt(match[3] || "0");
    return hours * 3600 + minutes * 60 + seconds;
  }

  const dataForUpsert = videoStats
    .map((video) => ({
      id: video.id!,
      title: video.snippet?.title!,
      description: video.snippet?.description || "",
      publishedAt: new Date(video.snippet?.publishedAt!),
      viewCount: Number(video.statistics?.viewCount || 0),
      likeCount: Number(video.statistics?.likeCount || 0),
      favoriteCount: Number(video.statistics?.favoriteCount || 0),
      commentCount: Number(video.statistics?.commentCount || 0),
      duration: durationToSeconds(video.contentDetails?.duration || "PT0S"),
    }))

  console.log("Step 5 - Upsert Data")

  const client = postgres(connectionString, { prepare: false });
  const db = drizzle(client);

  const upsertChunks = chunkArray(dataForUpsert, 1000);

  for (const upsertChunk of upsertChunks) {
    console.log(`       - upserting ${upsertChunk.length} videos`);
    await db
      .insert(videos)
      .values(upsertChunk)
      .onConflictDoUpdate({
        target: videos.id,
        // TODO: https://github.com/drizzle-team/drizzle-orm/issues/1728
        set: {
          title: sql`excluded.title`,
          description: sql`excluded.description`,
          publishedAt: sql`excluded.published_at`,
          viewCount: sql`excluded.view_count`,
          likeCount: sql`excluded.like_count`,
          favouriteCount: sql`excluded.favourite_count`,
          commentCount: sql`excluded.comment_count`,
          duration: sql`excluded.duration`,
        },
      });
  }

  console.log("Done")

  return new Response(
    "SUCCESS",
    { headers: { "Content-Type": "application/json" } },
  )
})

