import Image from "next/image";
import Link from "next/link";
import { BlogBlocks } from "@/components/blog/BlogBlocks";
import { BlogCategoryNav } from "@/components/blog/BlogCategoryNav";
import { BlogBody } from "@/components/blog/BlogBody";
import { BlogByline } from "@/components/blog/BlogByline";
import { BlogChrome } from "@/components/blog/BlogChrome";
import { BlogThesisNote } from "@/components/blog/BlogThesisNote";
import { formatBlogCategory, type BlogPost } from "@/data/blog";
import { BLOG_PATH } from "@/lib/routes";

export function BlogPostView({ post }: { post: BlogPost }) {
  return (
    <BlogChrome>
      <article className="theme-page-section__inner py-12 sm:py-16">
        <div className="max-w-3xl">
          <p className="text-sm text-surface-400">
            <Link href={BLOG_PATH} className="text-accent-400 hover:text-white">
              Blog
            </Link>
            <span aria-hidden="true"> / </span>
            <span>{formatBlogCategory(post.category)}</span>
          </p>

          {post.titleImage ? (
            <figure className="mt-6">
              <Image
                src={post.titleImage}
                alt={post.titleImageAlt}
                width={post.titleImageWidth}
                height={post.titleImageHeight}
                priority
                className="theme-radius-media h-auto w-full"
              />
            </figure>
          ) : null}

          <h1 className="section-display-heading mt-6 text-3xl text-white sm:text-4xl">{post.title}</h1>
          <div className="mt-5">
            <BlogByline date={post.date} />
          </div>
          {post.youtubeId ? (
            <div className="theme-radius-media mt-8 overflow-hidden bg-black">
              <iframe
                className="aspect-video w-full"
                src={`https://www.youtube-nocookie.com/embed/${post.youtubeId}?rel=0`}
                title={post.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
              />
            </div>
          ) : null}
          <div className="mt-8">
            {post.blocks.length > 0 ? <BlogBlocks blocks={post.blocks} /> : <BlogBody source={post.body} />}
          </div>
          {post.references.length > 0 ? (
            <section className="mt-10 text-left">
              <h2 className="text-xs font-medium text-surface-400">References and Resources</h2>
              <ul className="mt-3 space-y-2 text-sm">
                {post.references.map((item) => (
                  <li key={item.href}>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="break-words text-accent-400 underline decoration-accent-400/40 underline-offset-2 hover:text-white"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {post.thesis ? <BlogThesisNote /> : null}
          <BlogCategoryNav post={post} />
        </div>
      </article>
    </BlogChrome>
  );
}
