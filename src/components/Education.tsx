import { PageSection, SectionHeading, EducationCard } from "@/components/ui";
import { educationSection } from "@/data/content";

export function Education() {
  const { id, eyebrow, title, description, degrees } = educationSection;

  return (
    <PageSection>
      <SectionHeading id={id} eyebrow={eyebrow} title={title} description={description} />

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {degrees.map((ed) => (
          <EducationCard
            key={ed.degree}
            years={ed.years}
            degree={ed.degree}
            school={ed.school}
            detail={ed.detail}
            splash={ed.accent}
          />
        ))}
      </div>
    </PageSection>
  );
}
