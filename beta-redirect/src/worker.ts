// beta.pressstartgames.net moved to https://pressstartgames.net/beta (plans/main-site.md Phase 7). Every path keeps
// its place under /beta with a permanent redirect: / -> /beta/, /privacy -> /beta/privacy, query kept; a path that
// already starts with /beta is not prefixed twice.
export default {
  fetch(request: Request): Response {
    const url = new URL(request.url);
    const path = /^\/beta(\/|$)/.test(url.pathname) ? url.pathname : `/beta${url.pathname}`;
    return Response.redirect(`https://pressstartgames.net${path}${url.search}`, 301);
  },
};
