import type { Metadata } from "next";
import { BlogIndex } from "@/components/blog/BlogIndex";
import { blogAuthor, blogPosts, blogShareImage } from "@/data/blog";
import { person } from "@/data/content";
import { BLOG_PATH } from "@/lib/routes";

const title = `Blog · ${person.name}`;
const description = `Notes by ${blogAuthor.name}.`;
const share = blogPosts[0] ? blogShareImage(blogPosts[0]) : {
  url: blogAuthor.image,
  alt: blogAuthor.imageAlt,
  width: blogAuthor.imageWidth,
  height: blogAuthor.imageHeight,
};

export const metadata: Metadata = {
  title,
  description,
  authors: [{ name: blogAuthor.name }],
  alternates: { canonical: BLOG_PATH },
  openGraph: {
    title,
    description,
    url: BLOG_PATH,
    siteName: person.name,
    type: "website",
    locale: "en_US",
    images: [share],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [share.url],
  },
};

export default function BlogPage() {
  return <BlogIndex />;
}
