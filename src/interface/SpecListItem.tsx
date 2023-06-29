import { isCurrentExpansion } from 'game/Expansion';
import Contributor from 'interface/ContributorButton';
import ReadableListing from 'interface/ReadableListing';
import Config from 'parser/Config';

import SpecIcon from './SpecIcon';

const SpecListItem = ({
  spec,
  exampleReport,
  contributors,
  patchCompatibility,
  isPartial,
  expansion,
}: Config) => {
  const className = spec.className.replace(/ /g, '');
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
        <h4 className={className}>
          {spec.specName} {spec.className}
        </h4>
        {!patchCompatibility ? (
          <>Not currently supported</>
        ) : !isPartial ? (
          <>Accurate for patch {patchCompatibility}</>
        ) : (
          <>Partial support for patch {patchCompatibility}</>
        )}
        <br />
        {contributors.length !== 0 ? (
          <>Maintained by: {maintainers}</>
        ) : (
          <small>
            <em>
              <>CURRENTLY UNMAINTAINED</>
            </em>
          </small>
        )}
      </div>
    </Component>
  );
};

export default SpecListItem;
