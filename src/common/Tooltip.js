import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from '@wowanalyzer/react-tooltip-lite';

import './Tooltip.css';

/*
src/interface/layout/App.scss
	dfn[data-tip] rule is probably redundant

data-tip on other than dfn tags:
	src/interface/others/DamageTakenTable.js
		36 - div
	src/interface/others/DeathRecap.js
		94 - a
	src/interface/others/EventsTab.js
		167 - div
	src/interface/others/StatisticBox.js
		83 - a
	src/interface/report/FightSelection.js
		41 - Link
	src/interface/report/FightSelectionPanel.js
		47 - Link
	src/interface/report/PlayerSelection.js
		150 - Link
	src/interface/report/SupportChecker.js
		68 - Link
		98 - Link
	src/interface/report/Results/statistics/Radar.js
		48 - Ring (technically div)
	src/interface/report/Results/statistics/Statistic.js
		31 - div
	src/interface/report/Results/Timeline/Buffs.js
		104 - div
	src/interface/report/Results/Timeline/Casts.js
		137 - div
		151 - div
	src/interface/report/Results/Timeline/Lane.js
		68 - div
		82 - div
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
	src/parser/shaman/restoration/modules/azerite/BaseHealerAzerite.js
		103 - InformationIcon
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
	src/parser/warlock/demonology/modules/pets/PetTimelineTab/TabComponent/KeyCastsRow.js
		41 - SpellIcon
	src/parser/warlock/demonology/modules/pets/PetTimelineTab/TabComponent/PetRow.js
		41 - SpellIcon
		47 - Icon
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
     * Default: 'div'
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
     * Boolean which states, if the target should NOT look like <dfn> tag (dashed underline and question mark cursor)
     * Default: false (because majority of existing tooltips are on <dfn> tags)
     */
    hideUnderline: PropTypes.bool,
  };

  static defaultProps = {
    tagName: 'div',
    className: '',
    wrapperStyles: {},
    tooltipClassName: '',
    hoverable: false,
    hideUnderline: false,
  };

  defaultWrapperStyle = {
    display: 'inline-block',
  };

  underlineStyle = {
    'border-bottom': '1px dashed currentColor',
    cursor: 'help',
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
      hideUnderline,
      ...others
    } = this.props;
    // Styles that are applied to the wrapper element (div)
    let wrapperStyle = {
      ...this.defaultWrapperStyle,
    };
    if (!hideUnderline) {
      wrapperStyle = {
        ...wrapperStyle,
        ...this.underlineStyle,
      };
    }
    wrapperStyle = {
      ...wrapperStyle,
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
        {...others}>
        {children}
      </ReactTooltip>
    );
  }
}

export default Tooltip;
