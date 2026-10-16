/** Hoofdstukken in een college: vaste ids voor de koppen en springen naar een hoofdstuk. */

export function chapterId(index: number): string {
  return `hoofdstuk-${index}`;
}

/** Spring naar een hoofdstuk: scrollt erheen en zet de focus op de kop. */
export function goToChapter(index: number): void {
  const heading = document.getElementById(`${chapterId(index)}-kop`);
  if (!heading) return;
  heading.scrollIntoView?.({ block: 'start' });
  heading.focus({ preventScroll: true });
}
