/**
 * Het dev-paneel is zichtbaar in dev-builds, of met ?dev=1 in de URL (ook achter de #).
 * De keuze blijft bewaard voor dit tabblad.
 */
const KEY = 'oudiency:dev:panel';

export function isDevPanelAllowed(): boolean {
  if (import.meta.env.DEV) return true;
  try {
    const search = new URLSearchParams(window.location.search);
    const hashQuery = window.location.hash.includes('?') ? window.location.hash.split('?')[1] : '';
    const hash = new URLSearchParams(hashQuery);
    const flag = search.get('dev') ?? hash.get('dev');
    if (flag === '1') sessionStorage.setItem(KEY, '1');
    if (flag === '0') sessionStorage.removeItem(KEY);
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}
