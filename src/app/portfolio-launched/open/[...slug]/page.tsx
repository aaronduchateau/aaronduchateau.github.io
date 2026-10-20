import type { Metadata } from "next";
import { PortfolioLaunchedView } from "@/components/PortfolioLaunchedView";
import { person } from "@/data/content";
import { findModalShare, modalShareCatalog } from "@/data/modalShareCatalog";
import { modalSharePath, modalShareSegments } from "@/lib/modalSharePath";

export function generateStaticParams() {
  return modalShareCatalog.map((entry) => ({
    slug: modalShareSegments(entry),
  }));
}

export function generateMetadata({ params }: { params: { slug: string[] } }): Metadata {
  const entry = findModalShare(params.slug);
  if (!entry) {
    return { title: `${person.name} · Full Stack Developer` };
  }
  const path = modalSharePath(entry);
  const title = `${entry.title} · ${person.name}`;
  return {
    title,
    description: entry.description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description: entry.description,
      url: path,
      siteName: person.name,
      type: "website",
      locale: "en_US",
      images: [
        {
          url: entry.image,
          alt: entry.imageAlt,
          width: entry.imageWidth,
          height: entry.imageHeight,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: entry.description,
      images: [entry.image],
    },
  };
}

/** Same portfolio as `/portfolio-launched/`, with this view’s preview tags in `<head>`. */
export default function ModalSharePage() {
  return <PortfolioLaunchedView />;
}
