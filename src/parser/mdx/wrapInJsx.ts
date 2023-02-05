const jsxPrepend = '<>';
const jsxAppend = '</>;';

export const wrapInJsx = (value: string) => `${jsxPrepend}${value}${jsxAppend}`;
