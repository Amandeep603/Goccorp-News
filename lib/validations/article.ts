import { z } from "zod";
import sanitizeHtml from "sanitize-html";

export const articleSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").max(300, "Title is too long"),
  titleHi: z.string().optional().nullable(),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(300, "Slug is too long")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  summary: z.string().min(5, "Summary must be at least 5 characters").max(1000, "Summary is too long"),
  summaryHi: z.string().optional().nullable(),
  content: z.string().min(10, "Content must be at least 10 characters"),
  contentHi: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
  status: z.enum(["draft", "published"]).default("draft"),
  categoryId: z.string().optional().nullable(),
  companyId: z.string().optional().nullable(),
  authorId: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),
  isFeatured: z.boolean().default(false),
});

export type ArticleFormData = z.infer<typeof articleSchema>;

export function sanitizeArticleContent(rawHtml: string): string {
  if (!rawHtml) return "";

  return sanitizeHtml(rawHtml, {
    allowedTags: [
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "p",
      "a",
      "ul",
      "ol",
      "nl",
      "li",
      "b",
      "i",
      "strong",
      "em",
      "strike",
      "code",
      "hr",
      "br",
      "div",
      "table",
      "thead",
      "caption",
      "tbody",
      "tr",
      "th",
      "td",
      "pre",
      "img",
      "span",
    ],
    allowedAttributes: {
      a: ["href", "name", "target", "rel", "title"],
      img: ["src", "srcset", "alt", "title", "width", "height", "loading", "class"],
      span: ["class"],
      p: ["class"],
      div: ["class"],
      h1: ["class"],
      h2: ["class"],
      h3: ["class"],
      h4: ["class"],
      blockquote: ["class"],
    },
    selfClosing: ["img", "br", "hr"],
    allowedSchemes: ["http", "https", "mailto"],
    allowedSchemesByTag: {
      img: ["data", "http", "https"],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
      }),
    },
  });
}

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
