import { Newspaper } from "lucide-react";

interface ArticleImagePlaceholderProps {
  className?: string;
  iconClassName?: string;
}

export default function ArticleImagePlaceholder({
  className = "",
  iconClassName = "w-10 h-10",
}: ArticleImagePlaceholderProps) {
  return (
    <div
      className={`w-full h-full bg-navy flex items-center justify-center select-none ${className}`}
      aria-hidden="true"
    >
      <Newspaper
        className={`text-white/25 ${iconClassName}`}
        strokeWidth={1.5}
      />
    </div>
  );
}
