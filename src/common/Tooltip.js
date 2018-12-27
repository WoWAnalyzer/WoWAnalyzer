import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from '@wowanalyzer/react-tooltip-lite';

import './Tooltip.css';

/*
src/interface/layout/App.scss
	dfn[data-tip] rule is probably redundant

data-tip on other than dfn tags:
------------------------------------------------------------
	src/parser/druid/feral/modules/features/EnergyCapTracker.js
		99 - div
		106 - div
	src/parser/hunter/shared/modules/features/TimefocusCapped.js
		59 - div
		64 - div
	src/parser/paladin/holy/modules/talents/AuraOfSacrificeDamageReduction.js
		184 - div
		190 - div
	src/parser/rogue/shared/resources/EnergyCapTracker.js
		100 - div
		107 - div
	src/parser/shared/modules/AlwaysBeCasting.js
		114 - div
		120 - div
	src/parser/shared/modules/throughput/DamageDone.js
		78 - div
	src/parser/shared/modules/throughput/DamageTaken.js
		121 - div
	src/parser/shared/modules/throughput/HealingDone.js
		100 - div
	src/parser/warlock/demonology/modules/pets/PetTimelineTab/TabComponent/DeathEvents.js
		34 - div
		49 - div
	src/parser/warrior/arms/modules/talents/DefensiveStance.js
		79 - div
		85 - div
 */

class Tooltip extends React.Component {
  static propTypes = {
    /**
     * REQUIRED: Content of the tooltip
     */
    content: PropTypes.node.isRequired,
    /**
     * REQUIRED: The text/element that triggers the tooltip
     */
    children: PropTypes.node.isRequired,
    /**
     * Tag name of the wrapper element
     * Default: 'dfn'
     */
    tagName: PropTypes.string,
    /**
     * Additional class names that are appended to the wrapper element
     * Default: ''
     */
    className: PropTypes.string,
    /**
     * Additional inline styles that are appended to the wrapper element
     * Default: {}
     */
    wrapperStyles: PropTypes.object,
    /**
     * Additional class names that are added to the tooltip (wrapper of the tooltip and arrow)
     * Default: ''
     */
    tooltipClassName: PropTypes.string,
    /**
     * Boolean which states, if a person can access the tooltip contents (and click links, select and copy text etc.)
     * Default: false
     */
    hoverable: PropTypes.bool,
    /**
     * Boolean which states, if the tooltip should be rendered at all.
     * Default: true
     */
    renderTooltip: PropTypes.bool,
  };

  static defaultProps = {
    tagName: 'dfn',
    className: '',
    wrapperStyles: {},
    tooltipClassName: '',
    hoverable: false,
    renderTooltip: true,
  };

  defaultWrapperStyle = {
    display: 'inline-block',
  };

  render() {
    const {
      content,
      children,
      tagName,
      className,
      wrapperStyles,
      tooltipClassName,
      hoverable,
      renderTooltip,
      ...others
    } = this.props;
    // Styles that are applied to the wrapper element
    const wrapperStyle = {
      ...this.defaultWrapperStyle,
      ...wrapperStyles,
    };
    return (
      <ReactTooltip
        tagName={tagName}
        className={className}
        styles={wrapperStyle}
        tooltipClassName={tooltipClassName}
        direction="down"
        tipContentHover={hoverable}
        content={content}
        renderTooltip={renderTooltip}
        {...others}>
        {children}
      </ReactTooltip>
    );
  }
}

export default Tooltip;
