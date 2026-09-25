import { SoundAvailableIcon, SoundLockIcon } from "@/components/SoundLockIcon";

/** Options / catalog row — selected, lock, or available glyph. */
export function MenuLockChoiceButton({
  label,
  selected,
  locked,
  onClick,
}: {
  label: string;
  selected: boolean;
  locked: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      role="menuitemradio"
      aria-checked={selected}
      onClick={onClick}
      title={locked ? "Locked" : undefined}
      className={`flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition ${
        selected
          ? "bg-accent-500/15 font-semibold text-accent-200"
          : "text-surface-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <span
        className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${
          selected ? "bg-accent-400" : "bg-transparent ring-1 ring-white/25"
        }`}
        aria-hidden
      />
      <span className="min-w-0 truncate">{label}</span>
      {selected ? (
        <span className="ml-auto shrink-0 text-[9px] uppercase tracking-wider text-surface-500">
          Equipped
        </span>
      ) : locked ? (
        <SoundLockIcon className="ml-auto h-3 w-3 shrink-0 text-surface-500" />
      ) : (
        <SoundAvailableIcon className="ml-auto h-3 w-3 shrink-0 text-surface-500" />
      )}
    </button>
  );
}
