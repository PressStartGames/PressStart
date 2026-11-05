import { EngineAi } from './EngineAi';
import { Engine } from './Engine';
import { Placeholder } from './Placeholder';

// Every main-site page outside the home page, by its id (CONTENT.md section `page-<id>`): the designed
// pages (/engine, /engine/ai) and the honest placeholders for the rest.
export function Stub({ id = '' }: { id?: string }) {
  if (id === 'engine') return <Engine />;
  if (id === 'engine-ai') return <EngineAi />;
  return <Placeholder id={id} />;
}
