/** Given name from JSON `name` (split on the first space; last name stays in content). */
export function testimonialFirstName(name: string) {
  const trimmed = name.trim();
  const space = trimmed.indexOf(" ");
  return space === -1 ? trimmed : trimmed.slice(0, space);
}

/** Spoken intro: first name, then credentials. `·` becomes a comma pause. */
export function testimonialIntroSpeechText(name: string, title: string) {
  const creds = title.replace(/·/g, ",").replace(/\s+/g, " ").trim();
  return `${testimonialFirstName(name)}. ${creds}.`;
}
