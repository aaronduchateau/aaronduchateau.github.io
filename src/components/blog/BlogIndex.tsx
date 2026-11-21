import Image from "next/image";
import Link from "next/link";
import { BlogByline } from "@/components/blog/BlogByline";
import { BlogChrome } from "@/components/blog/BlogChrome";
import { blogPostPath, blogPosts } from "@/data/blog";

export function BlogIndex() {
  return (
    <BlogChrome>
      <div className="theme-page-section__inner py-16 sm:py-20">
        <header className="max-w-3xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-400">Writing</p>
          <h1 className="section-display-heading mt-3 text-3xl text-white sm:text-4xl">Blog</h1>
        </header>

        <ul className="mt-12 max-w-3xl space-y-6">
          {blogPosts.map((post) => {
            const href = blogPostPath(post);
            return (
              <li key={href}>
                <Link
                  href={href}
                  className="theme-radius-card group block overflow-hidden border theme-hairline transition hover:bg-white/5"
                >
                  {post.titleImage ? (
                    <Image
                      src={post.titleImage}
                      alt=""
                      width={post.titleImageWidth}
                      height={post.titleImageHeight}
                      className="theme-radius-media h-auto w-full"
                    />
                  ) : null}
                  <div className="space-y-4 p-5 sm:p-6">
                    <h2 className="font-display text-2xl text-white group-hover:text-accent-400">
                      {post.title}
                    </h2>
                    <p className="text-sm leading-relaxed text-surface-300">{post.description}</p>
                    <BlogByline date={post.date} size="sm" />
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </BlogChrome>
  );
}
