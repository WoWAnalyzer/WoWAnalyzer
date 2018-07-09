import React from 'react';
import PropTypes from 'prop-types';

import Contributor from 'Interface/Contributor/Button';
import ReadableList from 'Interface/common/ReadableList';

class Spec extends React.PureComponent {
  static propTypes = {
    spec: PropTypes.shape({
      id: PropTypes.number.isRequired,
      className: PropTypes.string.isRequired,
      specName: PropTypes.string.isRequired,
    }).isRequired,
    exampleReport: PropTypes.string,
    contributors: PropTypes.arrayOf(PropTypes.shape({
      nickname: PropTypes.string.isRequired,
    })).isRequired,
    patchCompatibility: PropTypes.string.isRequired,
  };

  render() {
    const { spec, exampleReport, contributors, patchCompatibility } = this.props;

    const className = spec.className.replace(/ /g, '');

    const Component = exampleReport ? 'a' : 'div';

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
          <h1 className={className}>{spec.specName} {spec.className}</h1>
          Built by <ReadableList>
            {contributors.map(contributor => <Contributor key={contributor.nickname} link={false} {...contributor} />)}
          </ReadableList>.<br />
          Accurate for patch {patchCompatibility}
        </div>
      </Component>
    );
  }
}

export default Spec;
