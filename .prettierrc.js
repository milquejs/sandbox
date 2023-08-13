/** @type {import('@trivago/prettier-plugin-sort-imports').PluginConfig} */
const sortImportsOptions = {
  importOrder: ['<THIRD_PARTY_MODULES>', '^@/(.*)$', '^[./]'],
  importOrderSeparation: true,
  importOrderSortSpecifiers: true,
};

/** @type {import('prettier').Options} */
export default {
  semi: true,
  singleQuote: true,
  bracketSameLine: true,
  ...sortImportsOptions,
  plugins: [
    '@trivago/prettier-plugin-sort-imports',
  ],
};
