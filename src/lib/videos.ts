import { db } from "~/server/db";
import { cache } from "react";
import { desc, ilike } from "drizzle-orm";
import { videos } from "~/server/db/schema";

export type VideoRow = {
  id: string;
  title: string;
  description: string;
  viewCount: number;
  duration: number;
  publishedAt: Date;
};

export const getVideos = cache(async (): Promise<VideoRow[]> => {
  console.log("Fetching videos from DB");
  return db.query.videos.findMany({
    columns: {
      id: true,
      title: true,
      description: true,
      viewCount: true,
      duration: true,
      publishedAt: true,
    },
    where: ilike(videos.title, "%tiny desk%"),
    orderBy: [desc(videos.publishedAt)],
  });
});
