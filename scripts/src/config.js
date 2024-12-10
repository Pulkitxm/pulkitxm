import { z } from "zod";
import path from "path";

export const BlogSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  publishedAt: z.string(),
  coverImage: z.object({
    url: z.string().url(),
  }),
});

export const BlogsResponseSchema = z.object({
  data: z.object({
    publication: z.object({
      posts: z.object({
        edges: z.array(z.object({ node: BlogSchema })),
      }),
    }),
  }),
});

export const READMEFILE_PATH = path.resolve(
  path.dirname(new URL(import.meta.url).pathname),
  "../../README.md"
);