import Image from "next/image";
import Link from "next/link";
import { BlogBody } from "@/components/blog/BlogBody";
import { BlogByline } from "@/components/blog/BlogByline";
import { BlogChrome } from "@/components/blog/BlogChrome";
import type { BlogPost } from "@/data/blog";
import { BLOG_PATH } from "@/lib/routes";

export function BlogPostView({ post }: { post: BlogPost }) {
  return (
    <BlogChrome>
      <article className="theme-page-section__inner py-12 sm:py-16">
        <div className="max-w-3xl">
          <p className="text-sm">
            <Link href={BLOG_PATH} className="text-accent-400 hover:text-white">
              Blog
            </Link>
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
          <div className="mt-8">
            <BlogBody source={post.body} />
          </div>
        </div>
      </article>
    </BlogChrome>
  );
}
