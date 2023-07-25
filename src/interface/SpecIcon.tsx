import { Spec } from 'game/SPECS';
import * as React from 'react';
import { useLingui } from '@lingui/react';
import { isDefined } from 'common/typeGuards';

interface Props extends Omit<React.HTMLAttributes<HTMLImageElement>, 'id'> {
  spec?: Spec;
  icon?: string;
  className?: string;
}

const SpecIcon = ({ spec, icon, className, ...others }: Props) => {
  const { i18n } = useLingui();
  const i18nSpecName = spec?.specName ? i18n._(spec.specName) : undefined;
  const i18nClassName = spec?.className ? i18n._(spec.className) : undefined;

  return (
    <img
      src={`/specs/${
        spec ? [i18nClassName, i18nSpecName].filter(isDefined).join('-').replace(' ', '') : icon
      }.jpg`}
      alt={spec ? `${i18nSpecName} ${i18nClassName}` : icon}
      className={`icon ${className || ''}`}
      {...others}
    />
  );
};

export default SpecIcon;
