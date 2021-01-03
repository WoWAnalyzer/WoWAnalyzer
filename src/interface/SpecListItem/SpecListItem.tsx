import { Trans } from '@lingui/macro';
import React, { Fragment } from 'react';

import Contributor from 'interface/ContributorButton';
import Config from 'parser/Config';

const SpecListItem = ({ spec, exampleReport, contributors, patchCompatibility }: Config) => {
  const className = spec.className.replace(/ /g, '');
  const Component = exampleReport ? 'a' : 'div';
  const builtinfo =
    contributors.length !== 0 ? (
      <Trans id="interface.specListItem.maintainer">
        Maintained by:
        <br />
      </Trans>
    ) : (
      <small>
        <em>
          <Trans id="interface.specListItem.unmaintained">CURRENTLY UNMAINTAINED</Trans>
        </em>
      </small>
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
          <img
            src={`/specs/${className}-${spec.specName.replace(' ', '')}.jpg`}
            alt={`${spec.specName} ${spec.className}`}
          />
        </figure>
      </div>
      <div className="description">
        <h4 className={className}>
          {spec.specName} {spec.className}
        </h4>
        <Trans id="interface.specListItem.patchCompatability">
          Accurate for patch {patchCompatibility}
        </Trans>
        <br />
        {builtinfo}
        {contributors.map((contributor) => (
          <Fragment key={contributor.nickname}>
            <Contributor link={false} {...contributor} />{' '}
          </Fragment>
        ))}
        <br />
      </div>
    </Component>
  );
};

export default SpecListItem;
