import { z } from "zod";

export const MediaZ = z.object({
  url: z.string().url(),
  public_id: z.string().min(3),
  alt: z.object({ 
    en: z.string().max(140).optional(), 
    ar: z.string().max(140).optional() 
  }).optional(),
  type: z.enum(["image","video"]).optional(),
  poster: z.string().url().optional(),
  duration: z.number().max(300).optional()
});

export const ProjectZ = z.object({
  id: z.string().min(3).regex(/^[a-z0-9-]+$/),
  slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
  status: z.enum(["draft","published"]),
  featured: z.boolean().default(false),
  order: z.number().int().min(0),
  category: z.enum(["commercial","residential","interiors","mixed","hospitality","retail","corporate"]),
  city: z.string().min(2),
  client: z.string().min(2).optional(),
  location: z.string().min(2).optional(),
  dates: z.object({ 
    started: z.string().optional(), 
    completed: z.string().optional() 
  }).optional(),
  title: z.object({ 
    en: z.string().min(2), 
    ar: z.string().min(2) 
  }),
  excerpt: z.object({ 
    en: z.string().min(2).max(280), 
    ar: z.string().min(2).max(280) 
  }),
  description: z.object({ 
    en: z.string().max(8000), 
    ar: z.string().max(8000) 
  }),
  seo: z.object({
    title: z.object({ 
      en: z.string().max(70).optional(), 
      ar: z.string().max(70).optional() 
    }).optional(),
    description: z.object({ 
      en: z.string().max(160).optional(), 
      ar: z.string().max(160).optional() 
    }).optional()
  }).optional(),
  hero: MediaZ,
  thumb: MediaZ.optional(),
  gallery: z.array(MediaZ).max(50),
  videos: z.array(MediaZ).max(20),
  metrics: z.record(z.string(), z.number()).optional(),
  badges: z.array(z.string()).max(20).optional(),
  deleted: z.boolean().default(false)
});

export const PartialProjectZ = ProjectZ.partial();