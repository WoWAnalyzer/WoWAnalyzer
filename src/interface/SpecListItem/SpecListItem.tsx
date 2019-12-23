import React from 'react';

import Contributor from 'interface/ContributorButton';
import ReadableListing from 'interface/ReadableListing';
import Config from 'parser/Config';

const SpecListItem = ({
  spec,
  exampleReport,
  contributors,
  patchCompatibility,
}: Config) => {
  const className = spec.className.replace(/ /g, '');
  const Component = exampleReport ? 'a' : 'div';
  const builtinfo =
    contributors.length !== 0 ? 'Built by ' : 'CURRENTLY UNMAINTAINED';

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
        <h2 className={className}>
          {spec.specName} {spec.className}
        </h2>
        {builtinfo}{' '}
        <ReadableListing>
          {contributors.map(contributor => (
            <Contributor
              key={contributor.nickname}
              link={false}
              {...contributor}
            />
          ))}
        </ReadableListing>
        .<br />
        Accurate for patch {patchCompatibility}
      </div>
    </Component>
  );
};

export default SpecListItem;
