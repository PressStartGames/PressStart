// vite-imagetools picture imports (lib/renders.ts). The glob import is typed there; this keeps a
// direct `import x from './file.png?...&as=picture'` typed too.
declare module '*as=picture' {
  const picture: {
    sources: Record<string, string>;
    img: { src: string; w: number; h: number };
  };
  export default picture;
}
