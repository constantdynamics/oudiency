import { useEffect } from 'react';
import { cx } from '@/lib/cx';
import { detectScript, loadNativeFont, NATIVE_FONT_FAMILY } from '@/lib/fonts';

/** Tekst in een eigen schrift (Σωκράτης, 老子, सत्याग्रह …): laadt het juiste font pas wanneer nodig. */
export function NativeText({
  text,
  className,
  lang,
}: {
  text: string;
  className?: string;
  lang?: string;
}) {
  const script = detectScript(text);
  useEffect(() => {
    loadNativeFont(script);
  }, [script]);
  const langAttr =
    lang ??
    (script === 'greek'
      ? 'grc'
      : script === 'han'
        ? 'zh'
        : script === 'devanagari'
          ? 'hi'
          : script === 'gujarati'
            ? 'gu'
            : undefined);
  return (
    <span
      lang={langAttr}
      className={cx(className)}
      style={{ fontFamily: NATIVE_FONT_FAMILY[script] }}
    >
      {text}
    </span>
  );
}
