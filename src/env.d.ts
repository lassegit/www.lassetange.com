// Importing a stylesheet is a build-time concern the compiler knows nothing about on its own.
declare module '*.css';

// `.md` files are bundled with `type: 'asset/source'` (see rshono.config.ts) — the default export is
// the file's raw text, which `src/lib/markdown.ts` turns into a document.
declare module '*.md' {
  const source: string;
  export default source;
}
