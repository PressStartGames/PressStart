import { use } from 'react';
import { loadArea, pageElement, type AreaName } from './areas';

// Renders one page of an area (src/lib/areas.ts), suspending until the area's chunk has loaded.
export function AreaPage({ area, page, id }: { area: AreaName; page: string; id?: string }) {
  const element = pageElement(area, page, id);
  if (element) return element;
  use(loadArea(area));
  return pageElement(area, page, id) ?? null;
}
