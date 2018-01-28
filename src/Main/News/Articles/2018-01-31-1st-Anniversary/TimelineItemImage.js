import React from 'react';
import PropTypes from 'prop-types';

const TimelineItemImage = ({ source, description, wide }) => (
  <figure style={wide ? { maxWidth: 800 } : undefined}>
    <img src={source} alt={description} />
    <figcaption>
      {description}
    </figcaption>
  </figure>
);
TimelineItemImage.propTypes = {
  source: PropTypes.string.isRequired,
  description: PropTypes.node.isRequired,
  wide: PropTypes.bool,
};

export default TimelineItemImage;
