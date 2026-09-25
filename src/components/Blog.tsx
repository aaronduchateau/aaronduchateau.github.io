"use client";

import { Card, CardGrid, PageSection, SectionHeading } from "@/components/ui";
import { blogPosts } from "@/data/content";
import { useTheme } from "@/theme/ThemeProvider";

export function Blog() {
  const { visibility } = useTheme();
  const showDecorativeMedia = visibility.decorativeCardMedia;

  return (
    <PageSection divider="none">
      <SectionHeading
        id="blog"
        eyebrow="Project log"
        title="Featured project work"
        description="Selected projects and product engagements from Aaron's recent portfolio highlights."
      />

      <CardGrid>
        {blogPosts.map((post) => (
          <Card
            key={post.slug}
            as="article"
            title={post.title}
            excerpt={post.excerpt}
            date={post.date}
            cta="View highlight"
            cover={showDecorativeMedia ? { kind: "image", src: post.cover } : null}
          />
        ))}
      </CardGrid>
    </PageSection>
  );
}
