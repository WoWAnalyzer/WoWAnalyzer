import React from 'react';
import PropTypes from 'prop-types';

const TimelineItemImage = ({ source, description, wide }) => (
  <figure style={wide ? { maxWidth: 800 } : undefined}>
    <a href={source} target="_blank" rel="noopener noreferrer"><img src={source} alt={description} /></a>
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
