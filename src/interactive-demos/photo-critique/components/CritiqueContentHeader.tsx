import { ModalCloseButton } from "@/components/ModalCloseButton";
import { critiqueChromePadX } from "./photo-critique-layout";

type Props = {
  label: string;
  emphasis?: string;
  suffix?: string;
  onClose: () => void;
};

/** Top bar for in-demo content views — context left, circular close right. */
export function CritiqueContentHeader({ label, emphasis, suffix, onClose }: Props) {
  return (
    <div className={`mb-3 flex shrink-0 items-center justify-between gap-3 ${critiqueChromePadX}`}>
      <p className="min-w-0 truncate text-xs text-surface-500">
        {label}
        {emphasis ? (
          <>
            {" "}
            <span className="font-mono text-accent-400/80">{emphasis}</span>
          </>
        ) : null}
        {suffix ? <> {suffix}</> : null}
      </p>
      <ModalCloseButton size="sm" onClick={onClose} />
    </div>
  );
}
