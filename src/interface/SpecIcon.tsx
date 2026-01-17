import { Spec } from 'game/SPECS';
import type { HTMLAttributes } from 'react';
import { useLingui } from '@lingui/react';

interface Props extends Omit<HTMLAttributes<HTMLImageElement>, 'id'> {
  spec?: Spec;
  icon?: string;
  className?: string;
}

export function specIconPath(spec: Spec): string {
  return `/specs/${spec.wclClassName}-${spec.wclSpecName}.jpg`;
}

const SpecIcon = ({ spec, icon, className, ...others }: Props) => {
  const { i18n } = useLingui();
  const i18nSpecName = spec?.specName ? i18n._(spec.specName) : undefined;
  const i18nClassName = spec?.className ? i18n._(spec.className) : undefined;

  return (
    <img
      src={spec ? specIconPath(spec) : icon}
      alt={spec ? `${i18nSpecName} ${i18nClassName}` : icon}
      className={`icon ${className || ''}`}
      {...others}
    />
  );
};

export default SpecIcon;
