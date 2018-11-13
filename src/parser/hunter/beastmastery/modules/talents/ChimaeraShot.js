import React from 'react';
import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import SpellLink from 'common/SpellLink';
import ItemDamageDone from 'interface/others/ItemDamageDone';
import StatisticListBoxItem from 'interface/others/StatisticListBoxItem';
import TalentStatisticBox from 'interface/others/TalentStatisticBox';
import SpellIcon from 'common/SpellIcon';
import AverageTargetsHit from 'interface/others/AverageTargetsHit';

/**
 * A two-headed shot that hits your primary target and another nearby target, dealing 720% Nature damage to one and 720% Frost damage to the other.
 *
 * Example log: https://www.warcraftlogs.com/reports/PLyFT2hcmCv39X7R#fight=1&type=damage-done
 */
class ChimaeraShot extends Analyzer {

  damage = 0;
  casts = 0;
  hits = 0;

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.CHIMAERA_SHOT_TALENT.id);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CHIMAERA_SHOT_TALENT.id) {
      return;
    }
    this.casts += 1;
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.CHIMAERA_SHOT_FROST_DAMAGE.id && spellId !== SPELLS.CHIMAERA_SHOT_NATURE_DAMAGE.id) {
      return;
    }
    this.hits += 1;
    this.damage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <TalentStatisticBox
        icon={<SpellIcon id={SPELLS.CHIMAERA_SHOT_TALENT.id} />}
        value={<>
          <AverageTargetsHit casts={this.casts} hits={this.hits} />
        </>}
        label="Chimaera Shot"
      />
    );
  }

  subStatistic() {
    return (
      <StatisticListBoxItem
        title={<SpellLink id={SPELLS.CHIMAERA_SHOT_TALENT.id} />}
        value={<ItemDamageDone amount={this.damage} />}
      />
    );
  }
}

export default ChimaeraShot;
