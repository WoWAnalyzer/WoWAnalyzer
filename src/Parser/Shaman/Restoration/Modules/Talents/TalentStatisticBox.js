import React from 'react';

import StatisticsListBox, { STATISTIC_ORDER } from 'Main/StatisticsListBox';
import SPELLS from 'common/SPELLS';

import Analyzer from 'Parser/Core/Analyzer';
import Combatants from 'Parser/Core/Modules/Combatants';

import Torrent from './Torrent';
import UnleashLife from './UnleashLife';
import Undulation from './Undulation';
import EarthShield from './EarthShield';
import EarthenWallTotem from './EarthenWallTotem';
import Downpour from './Downpour';
import CloudburstTotem from './CloudburstTotem';
import Ascendance from './Ascendance';
import Wellspring from './Wellspring';
import HighTide from './HighTide';


class TalentStatisticBox extends Analyzer {
  static dependencies = {
    combatants: Combatants,
    torrent: Torrent,
    unleashLife: UnleashLife,
    undulation: Undulation,
    earthShield: EarthShield,
    earthenWallTotem: EarthenWallTotem,
    downpour: Downpour,
    cloudburstTotem: CloudburstTotem,
    ascendance: Ascendance,
    wellspring: Wellspring,
    highTide: HighTide,
  };

  statistic() {
    return (
      <StatisticsListBox
        title="Talents"
        tooltip=
        {`The purpose of this is to show the overall HPS impact of each talent. So not only what the talent itself did, but also feeding and synergy or interactions with other spells or talents. The percentage shown is what you'd lose without the talent, ignoring what you'd gain from the other options.<br /><br />
        <b>Not Supported:</b><br />
        Crashing Waves<br />
        Deluge<br />
        Echo of the Elements
        `}
      >
        {this.combatants.selected.hasTalent(SPELLS.TORRENT_TALENT.id) ? this.torrent.subStatistic() : ''}
        {this.combatants.selected.hasTalent(SPELLS.UNLEASH_LIFE_TALENT.id) ? this.unleashLife.subStatistic() : ''}
        {this.combatants.selected.hasTalent(SPELLS.UNDULATION_TALENT.id) ? this.undulation.subStatistic() : ''}
        {this.combatants.selected.hasTalent(SPELLS.EARTH_SHIELD_TALENT.id) ? this.earthShield.subStatistic() : ''}
        {this.combatants.selected.hasTalent(SPELLS.EARTHEN_SHIELD_TOTEM_TALENT.id) ? this.earthenWallTotem.subStatistic() : ''}
        {this.combatants.selected.hasTalent(SPELLS.DOWNPOUR_TALENT.id) ? this.downpour.subStatistic() : ''}
        {this.combatants.selected.hasTalent(SPELLS.CLOUDBURST_TOTEM_TALENT.id) ? this.cloudburstTotem.subStatistic() : ''}
        {this.combatants.selected.hasTalent(SPELLS.ASCENDANCE_TALENT_RESTORATION.id) ? this.ascendance.subStatistic() : ''}
        {this.combatants.selected.hasTalent(SPELLS.WELLSPRING_TALENT.id) ? this.wellspring.subStatistic() : ''}
        {this.combatants.selected.hasTalent(SPELLS.HIGH_TIDE_TALENT.id) ? this.highTide.subStatistic() : ''}
      </StatisticsListBox>
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL(1000);
}

export default TalentStatisticBox;
