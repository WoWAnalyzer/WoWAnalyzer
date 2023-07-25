import { Trans } from '@lingui/macro';
import { isCurrentExpansion } from 'game/Expansion';
import Contributor from 'interface/ContributorButton';
import ReadableListing from 'interface/ReadableListing';
import Config from 'parser/Config';

import SpecIcon from './SpecIcon';
import { useLingui } from '@lingui/react';
import { isDefined } from 'common/typeGuards';

const SpecListItem = ({
  spec,
  exampleReport,
  contributors,
  patchCompatibility,
  isPartial,
  expansion,
}: Config) => {
  const { i18n } = useLingui();

  const i18nSpecName = spec.specName ? i18n._(spec.specName) : undefined;
  const i18nClassName = i18n._(spec.className);
  const displayName = [i18nSpecName, i18nClassName].filter(isDefined).join(' ');

  const className = i18n._(spec.className).replace(/ /g, '');
  const Component = exampleReport && isCurrentExpansion(expansion) ? 'a' : 'div';

  const maintainers = (
    <ReadableListing>
      {contributors.map((contributor) => (
        <Contributor key={contributor.nickname} link={false} {...contributor} />
      ))}
    </ReadableListing>
  );

  return (
    <Component
      key={spec.id}
      href={exampleReport}
      title={exampleReport ? 'Open example report' : undefined}
      className="spec-card"
    >
      <div className="icon">
        <figure>
          <SpecIcon spec={spec} />
        </figure>
      </div>
      <div className="description">
        <h4 className={className}>{displayName}</h4>
        {!patchCompatibility ? (
          <Trans id="interface.specListItem.notSupported">Not currently supported</Trans>
        ) : !isPartial ? (
          <Trans id="interface.specListItem.patchCompatability">
            Accurate for patch {patchCompatibility}
          </Trans>
        ) : (
          <Trans id="interface.specListItem.partialPatchCompatability">
            Partial support for patch {patchCompatibility}
          </Trans>
        )}
        <br />
        {contributors.length !== 0 ? (
          <Trans id="interface.specListItem.maintainer">Maintained by: {maintainers}</Trans>
        ) : (
          <small>
            <em>
              <Trans id="interface.specListItem.unmaintained">CURRENTLY UNMAINTAINED</Trans>
            </em>
          </small>
        )}
      </div>
    </Component>
  );
};

export default SpecListItem;
