import React from 'react';
import PropTypes from 'prop-types';
import ReactTooltip from 'react-tooltip-lite';

import './Tooltip.css';

/*
src/interface/layout/App.scss
	dfn[data-tip] rule is probably redundant

data-tip on other than dfn tags:
	src/interface/layout/Footer/index.js
		22 - a
		25 - a
		28 - a
	src/interface/layout/NavigationBar/index.js
		94 - Link
		98 - Link
		103 - div
		108 - div
		113 - div
	src/interface/others/DamageTakenTable.js
		36 - div
	src/interface/others/DeathRecap.js
		94 - a
	src/interface/others/EventsTab.js
		167 - div
	src/interface/others/ReportSelecter.js
		116 - input
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
    content: PropTypes.node.isRequired,
    children: PropTypes.node.isRequired,
    hoverable: PropTypes.bool,
    showUnderline: PropTypes.bool,
  };

  static defaultProps = {
    hoverable: false,
    showUnderline: true,
  };

  render() {
    const {content, children, hoverable, showUnderline} = this.props;
    // Styles that are applied to the children
    let styles = { display: 'inline-block' };
    if (showUnderline) {
      styles = {
        ...styles,
        'border-bottom': '1px dashed currentColor',
        cursor: 'help',
      };
    }
    return (
      <ReactTooltip content={content} styles={styles} tipContentHover={hoverable} direction="down">
        {children}
      </ReactTooltip>
    );
  }
}

export default Tooltip;
