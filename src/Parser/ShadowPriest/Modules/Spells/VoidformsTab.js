import React from 'react';
import PropTypes from 'prop-types';
import VoidformGraph from './VoidformGraph';

const VoidformsTab = ({voidforms=[], ...modules}) => {
  if(voidforms.length === 0) return null;
  return (<div className="voidforms">{voidforms.map((voidform, i) => <VoidformGraph key={i} {...voidform} {...modules} />)}</div>);
};

VoidformsTab.propTypes = {
  voidforms: PropTypes.array.isRequired,
  fightEnd: PropTypes.number.isRequired,
};


export default VoidformsTab;