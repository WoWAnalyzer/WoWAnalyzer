import React from 'react';
import PropTypes from 'prop-types';

const ResourceGenerated = props => {
  const { amount, wasted, approximate, resourceType } = props;

    return (
      <>
        {approximate && '≈'}{amount} {resourceType.name} generated <small>{wasted>0 && <>{approximate && '≈'}{wasted} wasted</>}</small>
      </>
    );
};

ResourceGenerated.propTypes = {
  amount: PropTypes.number.isRequired,
  wasted: PropTypes.number,
  approximate: PropTypes.bool,
  resourceType: PropTypes.object.isRequired,
};

export default ResourceGenerated;

ResourceGenerated.defaultProps = {
  approximate: false,
  wasted: 0,
};
