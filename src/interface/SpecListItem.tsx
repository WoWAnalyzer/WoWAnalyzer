import { Link } from 'react-router-dom';
import { Trans } from '@lingui/macro';
import classColor from 'game/classColor';
import Contributor from 'interface/ContributorButton';
import ReadableListing from 'interface/ReadableListing';
import Config, { SupportLevel } from 'parser/Config';

import SpecIcon from './SpecIcon';
import { useLingui } from '@lingui/react';
import { isDefined } from 'common/typeGuards';

const SpecListItem = ({
  spec,
  exampleReport,
  contributors,
  patchCompatibility,
  supportLevel,
}: Config) => {
  const { i18n } = useLingui();

  const i18nSpecName = spec.specName ? i18n._(spec.specName) : undefined;
  const i18nClassName = i18n._(spec.className);
  const displayName = [i18nSpecName, i18nClassName].filter(isDefined).join(' ');

  const className = classColor(spec);
  const Component = patchCompatibility && exampleReport ? Link : 'div';

  const maintainers = (
    <ReadableListing>
      {contributors.map((contributor) => (
        <Contributor key={contributor.nickname} link={false} {...contributor} />
      ))}
    </ReadableListing>
  );

  let supportDescription;
  let maintainerDescription;
  if (supportLevel === SupportLevel.Unmaintained || patchCompatibility === null) {
    maintainerDescription = (
      <small>
        <em>
          <Trans id="interface.specListItem.unmaintained">CURRENTLY UNMAINTAINED</Trans>
        </em>
      </small>
    );
    supportDescription = (
      <Trans id="interface.specListItem.notSupported">Not currently supported</Trans>
    );
  } else if (supportLevel === SupportLevel.Foundation) {
    supportDescription = (
      <Trans id="interface.specListItem.coreSupport">
        Basic Support for patch {patchCompatibility}
      </Trans>
    );
    maintainerDescription = (
      <small>
        <em>
          <Trans id="interface.specListItem.communityMaintenance">No Dedicated Maintainer</Trans>
        </em>
      </small>
    );
  } else if ((supportLevel = SupportLevel.MaintainedPartial)) {
    supportDescription = (
      <Trans id="interface.specListItem.partialPatchCompatability">
        Partial support for patch {patchCompatibility}
      </Trans>
    );
    maintainerDescription = (
      <Trans id="interface.specListItem.maintainer">Maintained by: {maintainers}</Trans>
    );
  } else {
    supportDescription = (
      <Trans id="interface.specListItem.patchCompatability">
        Accurate for patch {patchCompatibility}
      </Trans>
    );
  }

  return (
    <Component
      key={spec.id}
      to={exampleReport?.replace(/^\/*/, '/')}
      title={exampleReport ? 'Open example report' : undefined}
      className={`spec-card ${supportLevel === SupportLevel.Unmaintained ? 'spec-card_unmaintained' : ''}`}
    >
      <div className="icon">
        <figure>
          <SpecIcon spec={spec} />
        </figure>
      </div>
      <div className="description">
        <h4 className={className}>{displayName}</h4>
        {supportDescription}
        <br />
        {maintainerDescription}
      </div>
    </Component>
  );
};

export default SpecListItem;
