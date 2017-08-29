import React from 'react';
import PropTypes from 'prop-types';
import VoidformGraph from './VoidformGraph';

const VoidformsTab = ({voidforms=[], insanity, ...modules}) => {
	if(voidforms.length === 0) return null;
	return (<div className="voidforms">
		{voidforms.map((voidform, i) => 
			<VoidformGraph key={i} 
				{...voidform} 
				{...modules} 
				insanity={insanity.filter(event => event.timestamp >= voidform.start && event.timestamp <= voidform.ended)} 
			/>
		)}
	</div>);
};

VoidformsTab.propTypes = {
  voidforms: PropTypes.array.isRequired,
  fightEnd: PropTypes.number.isRequired,
  insanity: PropTypes.array,
};


export default VoidformsTab;