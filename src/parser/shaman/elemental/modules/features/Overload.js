import React from 'react';

import SPELLS from 'common/SPELLS';
import SpellIcon from 'common/SpellIcon';

import Analyzer from 'parser/core/Analyzer';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

import StatisticBox, { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import Events from 'parser/core/Events';

class Overload extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };

  spells = [];

  constructor(...args) {
    super(...args);
    this.active = true;

    this.getAbility = spellId => this.abilityTracker.getAbility(spellId);

    this.hasIcefury = this.selectedCombatant.hasTalent(SPELLS.ICEFURY_TALENT.id);
    this.hasElementalBlast = this.selectedCombatant.hasTalent(SPELLS.ELEMENTAL_BLAST_TALENT.id);

    this.spells = [
      this.getHits(SPELLS.LAVA_BURST_OVERLOAD.id, SPELLS.LAVA_BURST.id),
      this.getHits(SPELLS.LIGHTNING_BOLT_OVERLOAD_HIT.id, SPELLS.LIGHTNING_BOLT.id),
      this.getHits(SPELLS.CHAIN_LIGHTNING_OVERLOAD.id, SPELLS.CHAIN_LIGHTNING.id),
      this.hasElementalBlast && this.getHits(SPELLS.ELEMENTAL_BLAST_OVERLOAD.id, SPELLS.ELEMENTAL_BLAST_TALENT.id),
      this.hasIcefury && this.getHits(SPELLS.ICEFURY_OVERLOAD.id, SPELLS.ICEFURY_TALENT.id),
    ];
    this.addEventListener(Events.fightend, this.onFightend);
  }

  getHits(overloadSpellId, normalSpellId) {
    const overloadSpell = this.getAbility(overloadSpellId);
    const normalSpell = this.getAbility(normalSpellId);
    const normal = !normalSpell.ability ? 0 : normalSpell.damageHits;
    const overloads = !overloadSpell.ability ? 0 : overloadSpell.damageHits;
    return {
      id: overloadSpellId,
      name: !normalSpell.ability ? 'a spell' : normalSpell.ability.name,
      normal,
      overloads,
      percent: overloads / normal,
    };
  }

  onFightend() {
    this.spells = [
      this.getHits(SPELLS.LAVA_BURST_OVERLOAD.id, SPELLS.LAVA_BURST.id),
      this.getHits(SPELLS.LIGHTNING_BOLT_OVERLOAD_HIT.id, SPELLS.LIGHTNING_BOLT.id),
      this.getHits(SPELLS.CHAIN_LIGHTNING_OVERLOAD.id, SPELLS.CHAIN_LIGHTNING.id),
      this.hasElementalBlast && this.getHits(SPELLS.ELEMENTAL_BLAST_OVERLOAD.id, SPELLS.ELEMENTAL_BLAST_TALENT.id),
      this.hasIcefury && this.getHits(SPELLS.ICEFURY_OVERLOAD.id, SPELLS.ICEFURY_TALENT.id),
    ];
  }

  renderOverloads(spell) {
    if (!spell) {
      return null;
    }
    return (
      <li key={spell.id}>
        <SpellIcon
          id={spell.id}
          style={{
            height: '1.3em',
            marginTop: '-.1em',
          }}
        />
        <span style={{ display: 'inline-block', textAlign: 'left', marginLeft: '0.5em' }}>
          {spell.overloads} / {spell.normal}
        </span>
      </li>
    );
  }

  statistic() {
    return (
      <StatisticBox
        icon={<SpellIcon id={SPELLS.ELEMENTAL_MASTERY.id} />}
        value={(
          <ul style={{ listStyle: 'none', paddingLeft: 0 }}>
            {this.spells.map(spell => this.renderOverloads(spell))}
          </ul>
        )}
        label="Overload procs"
        tooltip={`${this.spells[0].overloads} / ${this.spells[0].normal} means you hit the target ${this.spells[0].normal} times with ${this.spells[0].name} and got ${this.spells[0].overloads} extra overload hits.`}
      />
    );
  }
  statisticOrder = STATISTIC_ORDER.OPTIONAL();
}

export default Overload;
