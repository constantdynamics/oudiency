/** Na een nieuwe deploy bestaan oude chunks niet meer; herladen haalt de nieuwe versie op. */
export function isChunkLoadError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error);
  return /dynamically imported module|Importing a module script failed|Failed to fetch|error loading dynamically/i.test(
    message,
  );
}
