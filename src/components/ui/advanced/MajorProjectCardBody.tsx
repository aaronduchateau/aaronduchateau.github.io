import Image from "next/image";

export type MajorProjectCardBodyProps = {
  company: string;
  location: string;
  window: string;
  role: string;
  bullets: readonly string[];
  photo: string;
  revealPhotoOnHover?: boolean;
  /** Rules-engine gate — false on ADA (solid meta column, no photo/gradients). */
  showDecorativeMedia: boolean;
};

function ProjectMetaCopy({
  company,
  location,
  window,
  className = "",
}: {
  company: string;
  location: string;
  window: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <p className="theme-card-meta font-mono text-[9px] uppercase tracking-widest sm:text-[10px]">
        {window}
      </p>
      <p className="mt-0.5 font-display text-base font-semibold theme-heading-ink sm:text-lg">{company}</p>
      <p className="text-[11px] text-surface-400">{location}</p>
    </div>
  );
}

/** Resting major-project plate — parent looks up the project; this view paints copy and photo. */
export function MajorProjectCardBody({
  company,
  location,
  window,
  role,
  bullets,
  photo,
  revealPhotoOnHover,
  showDecorativeMedia,
}: MajorProjectCardBodyProps) {
  const photoClass = revealPhotoOnHover
    ? "theme-card-photo-reveal object-cover grayscale opacity-[0.2] transition-[opacity,filter] duration-300 ease-out group-hover:grayscale-0 group-hover:opacity-100 group-hover:blur-[3px] motion-reduce:transition-none motion-reduce:group-hover:blur-none"
    : "object-cover";

  const solidMetaPlate = (
    <div className="flex w-full shrink-0 flex-col justify-end border-b border-white/10 bg-surface-900/40 px-4 py-4 sm:w-40 sm:border-b-0 sm:border-r sm:px-4 sm:py-5 lg:w-44">
      <ProjectMetaCopy company={company} location={location} window={window} />
    </div>
  );

  const photoPlate = (
    <div className="relative h-36 w-full shrink-0 overflow-hidden sm:h-auto sm:w-40 lg:w-44">
      <div className="relative h-36 w-full sm:absolute sm:inset-0 sm:h-full sm:min-h-[11rem]">
        <Image
          src={photo}
          alt=""
          fill
          className={photoClass}
          sizes="(max-width: 640px) 100vw, 176px"
        />
        {revealPhotoOnHover ? (
          <>
            <div className="theme-card-photo-veil theme-card-photo-veil--mobile pointer-events-none absolute inset-0 transition-[background] duration-300 ease-out sm:hidden" />
            <div className="theme-card-photo-veil theme-card-photo-veil--desktop pointer-events-none absolute inset-0 hidden transition-[background] duration-300 ease-out sm:block" />
          </>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-t from-surface-950 via-surface-950/25 to-transparent sm:bg-gradient-to-r" />
        )}

        <ProjectMetaCopy
          company={company}
          location={location}
          window={window}
          className="absolute bottom-3 left-3 right-3 sm:bottom-4 sm:left-4 sm:right-4"
        />
      </div>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-1 flex-col sm:flex-row">
      {showDecorativeMedia ? photoPlate : solidMetaPlate}

      <div className="relative flex min-h-[10.5rem] min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex flex-1 flex-col justify-center px-4 py-4 sm:px-4 lg:px-5 lg:py-5">
          <h3 className="font-display text-base font-semibold theme-heading-ink sm:text-lg">{role}</h3>
          <ul className="mt-2 space-y-1.5 text-xs leading-relaxed text-surface-400 sm:text-sm">
            {bullets.map((b) => (
              <li key={b} className="flex gap-2">
                <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent-400/80" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
