import React from 'react';

import Contributor from 'interface/ContributorButton';
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
    contributors.length !== 0 ? <>Maintained by:<br /></> : <small><em>CURRENTLY UNMAINTAINED</em></small>;

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
        Accurate for patch {patchCompatibility}
        <br />
        {builtinfo}
        {contributors.map(contributor =>
          <>
            <Contributor
              key={contributor.nickname}
              link={false}
              {...contributor}
            />
            {' '}
          </>
        )}
        <br />
      </div>
    </Component>
  );
};

export default SpecListItem;
