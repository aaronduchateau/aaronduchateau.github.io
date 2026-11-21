import Image from "next/image";
import { blogAuthor, formatBlogDate } from "@/data/blog";

/** Date, author name, and author portrait. Shown on every post and listing. */
export function BlogByline({ date, size = "md" }: { date: string; size?: "sm" | "md" }) {
  const photo = size === "sm" ? "h-10 w-10" : "h-12 w-12";
  return (
    <div className="flex items-center gap-3">
      <Image
        src={blogAuthor.image}
        alt=""
        width={blogAuthor.imageWidth}
        height={blogAuthor.imageHeight}
        className={`${photo} shrink-0 rounded-full object-cover object-[center_18%]`}
      />
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{blogAuthor.name}</p>
        <time dateTime={date} className="text-xs text-surface-400">
          {formatBlogDate(date)}
        </time>
      </div>
    </div>
  );
}
