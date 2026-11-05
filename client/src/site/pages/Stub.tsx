import { Page } from './Page';

// Every main-site page not designed yet: its CONTENT.md section `page-<id>`.
export function Stub({ id = '' }: { id?: string }) {
  return <Page id={`page-${id}`} />;
}
