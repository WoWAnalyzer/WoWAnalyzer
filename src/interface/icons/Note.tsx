import type { ComponentPropsWithoutRef } from 'react';

type Props = Omit<ComponentPropsWithoutRef<'svg'>, 'xmlns' | 'viewBox' | 'className'>;

// https://thenounproject.com/icon/note-8286920/
// Note by YOSHA from the Noun Project
const Icon = (props: Props) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="4 4 92 92" className="icon" {...props}>
    <path d="m66.668 62.5h22.559l-26.727 26.727v-22.559c0-2.3008 1.8711-4.168 4.168-4.168zm25-41.668v33.332h-25c-6.8945 0-12.5 5.6055-12.5 12.5v25l-33.336 0.003907c-6.8945 0-12.5-5.6055-12.5-12.5v-58.336c0-6.8945 5.6055-12.5 12.5-12.5h58.332c6.8945 0 12.504 5.6094 12.504 12.5zm-45.836 25c0-2.3047-1.8672-4.168-4.168-4.168l-12.496 0.003907c-2.3008 0-4.168 1.8633-4.168 4.168 0 2.3047 1.8672 4.168 4.168 4.168h12.5c2.3008-0.003906 4.1641-1.8672 4.1641-4.1719zm12.5-16.664c0-2.3047-1.8672-4.168-4.168-4.168h-24.996c-2.3008 0-4.168 1.8633-4.168 4.168 0 2.3047 1.8672 4.168 4.168 4.168h25c2.3008-0.003907 4.1641-1.8672 4.1641-4.168z" />
  </svg>
);

export default Icon;
