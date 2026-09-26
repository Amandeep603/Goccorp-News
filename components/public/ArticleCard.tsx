import Image from "next/image";
import Link from "next/link";
import ArticleImagePlaceholder from "./ArticleImagePlaceholder";

export interface PublicArticleCardProps {
  id: string;
  title: string;
  titleHi?: string | null;
  slug: string;
  summary?: string | null;
  summaryHi?: string | null;
  excerpt?: string | null;
  imageUrl?: string | null;
  category?: string | { name: string; slug: string } | null;
  company?:
  | string
  | {
    id?: string;
    name: string;
    slug: string;
    sector?: string | null;
    type?: string | null;
  }
  | null;
  author?: string | { name: string } | null;
  date?: string;
  publishedAt?: Date | string | null;
  createdAt?: Date | string;
}

export function getBadgeColor(categoryName?: string | null) {
  const cat = (categoryName || "").toLowerCase();
  if (cat.includes("comp")) {
    return "bg-navy/10 text-navy border-navy/20";
  }
  if (cat.includes("market")) {
    return "bg-green/10 text-green border-green/20";
  }
  if (
    cat.includes("sector") ||
    cat.includes("power") ||
    cat.includes("oil") ||
    cat.includes("defence") ||
    cat.includes("telecom") ||
    cat.includes("rail") ||
    cat.includes("steel") ||
    cat.includes("aviation")
  ) {
    return "bg-saffron/10 text-saffron border-saffron/20";
  }
  if (cat.includes("gov") || cat.includes("state") || cat.includes("polic")) {
    return "bg-gray-800/10 text-gray-800 border-gray-800/20";
  }
  return "bg-gray-100 text-gray-700 border-gray-200";
}

export function getCompanyRatnaBadge(
  company?:
    | string
    | {
      name?: string | null;
      sector?: string | null;
      type?: string | null;
    }
    | null
) {
  if (!company || typeof company === "string") return null;
  const raw = ((company as any).type || company.sector || "").toLowerCase();
  if (raw.includes("maharatna")) {
    return {
      label: "MAHARATNA",
      classes: "bg-amber-100 text-amber-900 border-amber-300 font-bold",
    };
  }
  if (raw.includes("navratna")) {
    return {
      label: "NAVRATNA",
      classes: "bg-slate-100 text-slate-800 border-slate-300 font-bold",
    };
  }
  if (raw.includes("mini") || raw.includes("miniratna")) {
    return {
      label: "MINI RATNA",
      classes: "bg-amber-950/10 text-amber-900 border-amber-600/30 font-bold",
    };
  }
  return null;
}

export default function ArticleCard({
  article,
  lang,
}: {
  article: PublicArticleCardProps;
  lang?: string;
}) {
  const categoryName =
    typeof article.category === "string"
      ? article.category
      : article.category?.name || "News";

  const authorName =
    typeof article.author === "string"
      ? article.author
      : article.author?.name || "Editorial Staff";

  const displayDate =
    article.date ||
    (article.publishedAt
      ? new Date(article.publishedAt).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
      : new Date(article.createdAt || Date.now()).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      }));

  const isHi = lang === "hi";
  const displayTitle = isHi && article.titleHi?.trim() ? article.titleHi : article.title;
  const displayExcerpt = isHi && article.summaryHi?.trim()
    ? article.summaryHi
    : (article.summary || article.excerpt || "");
  const hasValidImage = Boolean(article.imageUrl && article.imageUrl.trim() !== "");
  const ratnaBadge = getCompanyRatnaBadge(article.company);

  return (
    <article className="group py-3.5 border-b border-gray-200 last:border-b-0 flex items-start justify-between gap-3.5 sm:gap-4 transition-colors">
      {/* Text takes most of the width */}
      <div className="flex-1 min-w-0">
        {/* Badges strip: Category + optional Ratna badge */}
        <div className="flex items-center gap-1.5 mb-1 flex-wrap">
          <span
            className={`inline-block px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-xs border ${getBadgeColor(
              categoryName
            )}`}
          >
            {categoryName}
          </span>

          {ratnaBadge && (
            <span
              className={`inline-block px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-wider rounded-xs border ${ratnaBadge.classes}`}
            >
              {ratnaBadge.label}
            </span>
          )}
        </div>

        {/* Title */}
        <h3
          className="font-playfair font-bold text-navy group-hover:text-saffron transition-colors text-base sm:text-[17px] leading-snug line-clamp-2 sm:line-clamp-3 break-words mb-1"
          title={displayTitle}
        >
          <Link href={`/article/${article.slug}`}>{displayTitle}</Link>
        </h3>

        {/* Summary */}
        {displayExcerpt && (
          <p className="font-sans text-xs sm:text-sm text-gray-600 line-clamp-2 leading-relaxed mb-2">
            {displayExcerpt}
          </p>
        )}

        {/* Metadata */}
        <div className="flex items-center gap-2 text-[11px] text-gray-500 font-sans">
          <span className="font-medium text-gray-700 truncate max-w-[140px]">{authorName}</span>
          <span>•</span>
          <span className="shrink-0">{displayDate}</span>
        </div>
      </div>

      {/* Small square thumbnail (~80-100px) */}
      <Link
        href={`/article/${article.slug}`}
        className="w-20 h-20 sm:w-24 sm:h-24 shrink-0 rounded-xs overflow-hidden bg-navy relative block border border-gray-100 group-hover:border-navy/40 transition-colors"
        aria-label={displayTitle}
      >
        {hasValidImage ? (
          <Image
            src={article.imageUrl!}
            alt={displayTitle}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 80px, 96px"
            className="object-cover group-hover:scale-105 transition-transform duration-300"
            unoptimized={article.imageUrl!.startsWith("/uploads/") || article.imageUrl!.includes("blob.vercel-storage.com")}
          />
        ) : (
          <ArticleImagePlaceholder iconClassName="w-7 h-7 text-white/25" />
        )}
      </Link>
    </article>
  );
}
