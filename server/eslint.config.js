import { nodeConfig } from '../eslint.shared.js';

export default nodeConfig({
  rules: {
    // src/index.ts is the Worker entry, not a barrel: allow it, still forbid '.' / '..' directory imports.
    'no-restricted-imports': [
      'error',
      { patterns: [{ regex: '^\.{1,2}/?$', message: 'Import the defining module directly.' }] },
    ],
  },
});
