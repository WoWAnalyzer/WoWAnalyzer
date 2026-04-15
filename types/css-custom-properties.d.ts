import 'react';

declare module 'react' {
  interface CSSProperties {
    // oxlint-disable-next-line consistent-indexed-object-style -- template literal pattern keys cannot use Record syntax
    [key: `--${string}`]: string | number | undefined;
  }
}
