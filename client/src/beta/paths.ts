// Where the beta lives inside the site (plans/main-site.md: pressstartgames.net/beta). Every beta link
// goes through these, so the beta's pages never assume they sit at the root.
export const BETA_HOME = '/beta/';

export function betaPath(sub: string): string {
  return `/beta/${sub.replace(/^\//, '')}`;
}

// True for the beta's home route ("/beta" or "/beta/", basename already stripped by the router).
export function isBetaHome(pathname: string): boolean {
  return pathname.replace(/\/$/, '') === '/beta';
}
