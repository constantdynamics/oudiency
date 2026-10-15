import { cx } from '@/lib/cx';

/** Laadstate met karakter: "Spinoza slijpt een lens …" */
export function Thinking({ text, className }: { text: string; className?: string }) {
  return (
    <div role="status" className={cx('flex items-center gap-3 text-ink-2', className)}>
      <span aria-hidden className="flex gap-1">
        <span className="size-1.5 rounded-full bg-fig animate-pulse" />
        <span className="size-1.5 rounded-full bg-fig animate-pulse [animation-delay:0.2s]" />
        <span className="size-1.5 rounded-full bg-fig animate-pulse [animation-delay:0.4s]" />
      </span>
      <span className="italic">{text}</span>
    </div>
  );
}
