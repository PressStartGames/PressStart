import { pictureFor } from '../lib/renders';

// One accepted engine golden as a responsive <picture> (AVIF, WebP, PNG), lazy, with its intrinsic
// size reserved. Only files with a provenance row in assets/renders/manifest.json exist to pick.
export function Golden({
  file,
  sizes,
  className,
}: {
  file: string;
  sizes: string;
  className?: string;
}) {
  const pic = pictureFor(file);
  if (!pic) return null;
  return (
    <picture className={className}>
      {pic.sources['avif'] ? (
        <source type="image/avif" srcSet={pic.sources['avif']} sizes={sizes} />
      ) : null}
      {pic.sources['webp'] ? (
        <source type="image/webp" srcSet={pic.sources['webp']} sizes={sizes} />
      ) : null}
      <img
        src={pic.img.src}
        srcSet={pic.sources['png']}
        sizes={sizes}
        width={pic.img.w}
        height={pic.img.h}
        loading="lazy"
        decoding="async"
        alt=""
      />
    </picture>
  );
}
