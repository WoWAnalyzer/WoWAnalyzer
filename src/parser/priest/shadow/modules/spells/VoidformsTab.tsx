import React from 'react';
import PropTypes from 'prop-types';

import VoidformGraph from './VoidformGraph';

const VoidformsTab = ({ voidforms = [], insanityEvents, ...modules }: any) => {
  if (voidforms.length === 0) {
    return null;
  }

  return (
    <div className="voidforms">
      {voidforms.map((voidform: any, i: number) => (
        <VoidformGraph
          key={i}
          {...voidform}
          {...modules}
          insanityEvents={(
            insanityEvents.filter((event: any) => event.timestamp >= voidform.start && event.timestamp <= voidform.start + voidform.duration)
          )}
        />
      ))}
    </div>
  );
};
VoidformsTab.propTypes = {
  voidforms: PropTypes.array.isRequired,
  fightEnd: PropTypes.number.isRequired,
  insanityEvents: PropTypes.array,
  surrenderToMadness: PropTypes.bool,
};

export default VoidformsTab;
