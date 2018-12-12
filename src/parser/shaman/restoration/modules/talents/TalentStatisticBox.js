import React from 'react';

import StatisticsListBox, { STATISTIC_ORDER } from 'interface/others/StatisticsListBox';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import SPELLS from 'common/SPELLS';

import Analyzer from 'parser/core/Analyzer';

import Torrent from './Torrent';
import UnleashLife from './UnleashLife';
import Undulation from './Undulation';
import Deluge from './Deluge';
import EarthShield from './EarthShield';
import EarthenWallTotem from './EarthenWallTotem';
import NaturesGuardian from './NaturesGuardian';
import Downpour from './Downpour';
import CloudburstTotem from './CloudburstTotem';
import Ascendance from './Ascendance';
import Wellspring from './Wellspring';
import HighTide from './HighTide';


class TalentStatisticBox extends Analyzer {
  static dependencies = {
    torrent: Torrent,
    unleashLife: UnleashLife,
    undulation: Undulation,
    deluge: Deluge,
    earthShield: EarthShield,
    earthenWallTotem: EarthenWallTotem,
    naturesGuardian: NaturesGuardian,
    downpour: Downpour,
    cloudburstTotem: CloudburstTotem,
    ascendance: Ascendance,
    wellspring: Wellspring,
    highTide: HighTide,
  };

  statistic() {
    return (
      <StatisticsListBox
        title="Healing Contribution"
        tooltip={`The purpose of this is to show the overall HPS impact of each talent. So not only what the talent itself did, but also feeding and synergy or interactions with other spells or talents. The percentage shown is what you'd lose without the talent, ignoring what you'd gain from the other options.<br /><br />
        <b>Not Supported:</b><br />
        Echo of the Elements
        `}
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.TALENTS}
      >
        {<div style={{ borderBottom: 0, marginBottom: 0, paddingBottom: 0 }} />}
        {this.selectedCombatant.hasTalent(SPELLS.TORRENT_TALENT.id) ? this.torrent.subStatistic() : ''}
        {this.selectedCombatant.hasTalent(SPELLS.UNLEASH_LIFE_TALENT.id) ? this.unleashLife.subStatistic() : ''}
        {this.selectedCombatant.hasTalent(SPELLS.UNDULATION_TALENT.id) ? this.undulation.subStatistic() : ''}
        {this.selectedCombatant.hasTalent(SPELLS.DELUGE_TALENT.id) ? this.deluge.subStatistic() : ''}
        {this.selectedCombatant.hasTalent(SPELLS.EARTH_SHIELD_TALENT.id) ? this.earthShield.subStatistic() : ''}
        {this.selectedCombatant.hasTalent(SPELLS.EARTHEN_WALL_TOTEM_TALENT.id) ? this.earthenWallTotem.subStatistic() : ''}
        {this.selectedCombatant.hasTalent(SPELLS.NATURES_GUARDIAN_TALENT.id) ? this.naturesGuardian.subStatistic() : ''}
        {this.selectedCombatant.hasTalent(SPELLS.DOWNPOUR_TALENT.id) ? this.downpour.subStatistic() : ''}
        {this.selectedCombatant.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id) ? this.cloudburstTotem.subStatistic() : ''}
        {this.selectedCombatant.hasTalent(SPELLS.HIGH_TIDE_TALENT.id) ? this.highTide.subStatistic() : ''}
        {this.selectedCombatant.hasTalent(SPELLS.WELLSPRING_TALENT.id) ? this.wellspring.subStatistic() : ''}
        {this.selectedCombatant.hasTalent(SPELLS.ASCENDANCE_TALENT_RESTORATION.id) ? this.ascendance.subStatistic() : ''}
      </StatisticsListBox>
    );
  }
}

export default TalentStatisticBox;
