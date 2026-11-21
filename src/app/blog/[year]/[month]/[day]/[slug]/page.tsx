import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogPostView } from "@/components/blog/BlogPostView";
import { blogAuthor, blogPostPath, blogPosts, blogShareImage, findBlogPost } from "@/data/blog";
import { person } from "@/data/content";

type PostParams = {
  year: string;
  month: string;
  day: string;
  slug: string;
};

export const dynamicParams = false;

export function generateStaticParams(): PostParams[] {
  return blogPosts.map((post) => {
    const [year, month, day] = post.date.split("-");
    return { year, month, day, slug: post.slug };
  });
}

export function generateMetadata({ params }: { params: PostParams }): Metadata {
  const post = findBlogPost(params);
  if (!post) return { title: `Blog · ${person.name}` };

  const path = blogPostPath(post);
  const title = `${post.title} · ${person.name}`;
  const share = blogShareImage(post);

  return {
    title,
    description: post.description,
    authors: [{ name: blogAuthor.name }],
    alternates: { canonical: path },
    openGraph: {
      title,
      description: post.description,
      url: path,
      siteName: person.name,
      type: "article",
      locale: "en_US",
      publishedTime: `${post.date}T12:00:00.000Z`,
      authors: [blogAuthor.name],
      images: [
        {
          url: share.url,
          alt: share.alt,
          width: share.width,
          height: share.height,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: post.description,
      images: [share.url],
    },
  };
}

export default function BlogPostPage({ params }: { params: PostParams }) {
  const post = findBlogPost(params);
  if (!post) notFound();
  return <BlogPostView post={post} />;
}
