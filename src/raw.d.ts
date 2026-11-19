// `import text from './file?raw'`: the file's text (next.config.mjs's rule, scripts/raw-loader.cjs).
declare module '*?raw' {
  const text: string;
  export default text;
}
