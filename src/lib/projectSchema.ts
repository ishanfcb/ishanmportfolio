import { z } from "zod";

const sectionSchema = z.object({
  type: z.enum(["text", "image", "video", "heading"]),
  size: z.enum(["h", "f", "t", "t2", "q", "s", "1"]),
  text: z.array(z.string()).optional(),
  src: z.string().optional(),
  alt: z.string().optional(),
  style: z.string().optional(),
  controls: z.boolean().optional(),
  poster: z.string().optional(),
});

const sectionGroupSchema = z.object({
  sections: z.array(sectionSchema),
});

const creditSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  url: z.string().url(),
});

export const projectSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  year: z.number().int().min(1900).max(2100),
  tags: z.array(z.string()).min(1),
  description: z.string().min(1),
  thumbnail: z.string().min(1),
  thumbnailWidth: z.number().int().positive(),
  thumbnailHeight: z.number().int().positive(),
  size: z.enum(["1x1", "1x2", "2x1", "2x2"]),
  position: z.number().int().min(1).max(6).optional(),
  order: z.number().int().min(0).optional(),
  featured: z.boolean().optional().default(false),
  featuredOrder: z.number().int().optional(),
  locked: z.boolean().optional().default(false),
  interactiveUrl: z.string().url().optional(),
  githubUrl: z.string().url().optional(),
  credits: z.array(creditSchema).optional(),
  content: z.array(sectionGroupSchema),
});

export type ProjectData = z.infer<typeof projectSchema>;

// Type for the listing/card view (without full content)
export type ProjectMeta = Omit<ProjectData, "content">;
