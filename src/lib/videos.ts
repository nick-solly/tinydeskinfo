import { db } from "~/server/db";
import { cache } from "react";
import { type VideoRow } from "~/lib/schemas";
import { desc, ilike } from "drizzle-orm";
import { videos } from "~/server/db/schema";

export const getVideos = cache(
  async (): Promise<VideoRow[]> =>
    db.query.videos.findMany({
      columns: {
        id: true,
        title: true,
        viewCount: true,
        duration: true,
        publishedAt: true,
      },
      where: ilike(videos.title, "%tiny desk%"),
      orderBy: [desc(videos.publishedAt)],
    }),
);
