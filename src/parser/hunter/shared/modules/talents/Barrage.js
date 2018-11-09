import React from 'react';

import Analyzer from 'parser/core/Analyzer';

import SPELLS from 'common/SPELLS';
import SpellLink from "common/SpellLink";
import ItemDamageDone from 'interface/others/ItemDamageDone';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import SpellIcon from 'common/SpellIcon';
import AverageTargetsHit from 'interface/others/AverageTargetsHit';

/**
 * Rapidly fires a spray of shots for 3 sec, dealing an average of (80% * 10) Physical damage to all enemies in front of you.
 * Usable while moving.
 *
 * Example log: https://www.warcraftlogs.com/reports/mzZMhjAFVadHLYBT#fight=7&type=damage-done&source=22
 */
class Barrage extends Analyzer {

  damage = 0;
  casts = 0;
  hits = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.BARRAGE_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BARRAGE_TALENT.id) {
      return;
    }
    this.casts += 1;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.BARRAGE_DAMAGE.id) {
      return;
    }
    this.hits += 1;
    this.damage += event.amount + (event.absorbed || 0);
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.BARRAGE_TALENT.id} />}
        value={<ItemDamageDone amount={this.damage} />}
      />
    );
  }
  statistic() {
    return (
      <TalentStatisticBox
        icon={<SpellIcon id={SPELLS.BARRAGE_TALENT.id} />}
        value={<>
          <ItemDamageDone amount={this.damage} /> <br />
          <AverageTargetsHit casts={this.casts} hits={this.hits} /> <br />
          <AverageTargetsHit casts={this.casts} hits={this.hits} unique approximate />
        </>}
        label="Barrage"
      />
    );
  }

}

export default Barrage;
