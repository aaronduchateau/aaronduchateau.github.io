import Link from "next/link";
import { blogCategoryNeighbors, blogPostPath, formatBlogCategory, type BlogPost } from "@/data/blog";

function NeighborLink({
  post,
  label,
  align,
}: {
  post: BlogPost;
  label: "Previous" | "Next";
  align: "start" | "end";
}) {
  return (
    <Link
      href={blogPostPath(post)}
      className={`block min-w-0 rounded-md px-1 py-1 hover:bg-white/5 ${align === "end" ? "sm:text-right" : ""}`}
    >
      <span className="text-xs font-medium uppercase tracking-[0.14em] text-accent-400">{label}</span>
      <span className="mt-1 block text-base text-white">{post.title}</span>
    </Link>
  );
}

/** Previous and next stay in this post's category. */
export function BlogCategoryNav({ post }: { post: BlogPost }) {
  const { previous, next } = blogCategoryNeighbors(post);
  if (!previous && !next) return null;

  return (
    <nav
      aria-label={`More in ${formatBlogCategory(post.category)}`}
      className="mt-12 grid gap-4 border-t theme-hairline pt-6 sm:grid-cols-2"
    >
      {previous ? <NeighborLink post={previous} label="Previous" align="start" /> : <span className="hidden sm:block" />}
      {next ? <NeighborLink post={next} label="Next" align="end" /> : null}
    </nav>
  );
}
