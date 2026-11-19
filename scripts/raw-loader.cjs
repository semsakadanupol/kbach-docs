// `import text from './file?raw'` (next.config.mjs): the file's text, as a string.
module.exports = function rawLoader(source) {
  return 'export default ' + JSON.stringify(source) + ';';
};
