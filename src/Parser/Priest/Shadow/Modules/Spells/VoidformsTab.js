import React from 'react';
import PropTypes from 'prop-types';
import VoidformGraph from './VoidformGraph';

const VoidformsTab = ({ voidforms = [], insanityEvents, ...modules }) => {
  if (voidforms.length === 0) return null;
  return (<div className="voidforms">
    {voidforms.map((voidform, i) =>
      (<VoidformGraph
        key={i}
        {...voidform}
        {...modules}
        insanityEvents={insanityEvents.filter(event => event.timestamp >= voidform.start && event.timestamp <= voidform.start + voidform.duration)}
      />)
    )}
  </div>);
};

VoidformsTab.propTypes = {
  voidforms: PropTypes.array.isRequired,
  fightEnd: PropTypes.number.isRequired,
  insanityEvents: PropTypes.array,
};


export default VoidformsTab;
