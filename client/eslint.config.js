import { reactConfig } from '../eslint.shared.js';

export default reactConfig({
  ignores: ['dist-ssr', 'dist-e2e'],
  rules: {
    // TODO(Phase 3 pass 2, after the routing merge): give the <pre> in components/CodeSample.tsx
    // role="region" + aria-label, then drop this override so the shared error applies.
    'jsx-a11y/no-noninteractive-tabindex': ['warn', { roles: ['region'], tags: [] }],
  },
});
