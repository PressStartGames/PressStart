import { RoadStops } from '../tour/Road';
import { EngineAi } from './EngineAi';
import { Engine } from './Engine';
import { Placeholder } from './Placeholder';

// Every main-site page outside the home page, by its id (CONTENT.md section `page-<id>`): the designed
// pages (/engine, /engine/ai) and the placeholders for the rest (/roadmap carries the road's three stops).
export function Stub({ id = '' }: { id?: string }) {
  if (id === 'engine') return <Engine />;
  if (id === 'engine-ai') return <EngineAi />;
  if (id === 'roadmap')
    return (
      <Placeholder id={id}>
        <RoadStops />
      </Placeholder>
    );
  return <Placeholder id={id} />;
}
