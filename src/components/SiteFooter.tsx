import Link from "next/link";
import { person } from "@/data/content";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-surface-950 py-12 text-sm text-surface-500">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 sm:flex-row sm:items-center sm:justify-between sm:px-10">
        <p>
          © {new Date().getFullYear()} {person.name}. Portfolio overview.
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href={person.instagram} className="text-surface-300 hover:text-white" target="_blank" rel="noreferrer">
            Website
          </Link>
          <a
            href={person.linkedin}
            className="text-surface-300 hover:text-white"
            target="_blank"
            rel="noreferrer"
          >
            Contact Aaron
          </a>
        </div>
      </div>
    </footer>
  );
}
