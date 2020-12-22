import React from 'react';

import Analyzer, { Options } from 'parser/core/Analyzer';
import { STATISTIC_ORDER } from 'interface/others/StatisticBox';
import SPELLS from 'common/SPELLS';
import calculateEffectiveDamage from 'parser/core/calculateEffectiveDamage';
import SpellLink from 'common/SpellLink';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import ItemDamageDone from 'interface/ItemDamageDone';
import Statistic from 'interface/statistics/Statistic';
import Spell from 'common/SPELLS/Spell';

const MASTER_OF_THE_ELEMENTS: {INCREASE: number, DURATION: number, WINDOW_DURATION: number, AFFECTED_DAMAGE: Spell[], AFFECTED_CASTS: Spell[], TALENTS: number[]} = {
  INCREASE: 0.2,
  DURATION: 15000,
  WINDOW_DURATION: 500,
  AFFECTED_DAMAGE: [
    SPELLS.ICEFURY_TALENT,
    SPELLS.ICEFURY_OVERLOAD,
    SPELLS.FROST_SHOCK,
    SPELLS.LIGHTNING_BOLT,
    SPELLS.LIGHTNING_BOLT_OVERLOAD,
    SPELLS.CHAIN_LIGHTNING,
    SPELLS.CHAIN_LIGHTNING_OVERLOAD,
    SPELLS.ELEMENTAL_BLAST_TALENT,
    SPELLS.ELEMENTAL_BLAST_OVERLOAD,
    SPELLS.EARTH_SHOCK,
  ],
  AFFECTED_CASTS: [
    SPELLS.EARTHQUAKE,
    SPELLS.ICEFURY_TALENT,
    SPELLS.FROST_SHOCK,
    SPELLS.ELEMENTAL_BLAST_TALENT,
    SPELLS.CHAIN_LIGHTNING,
    SPELLS.EARTH_SHOCK,
    SPELLS.LIGHTNING_BOLT,
  ],
  TALENTS: [
    SPELLS.ICEFURY_TALENT.id,
    SPELLS.ELEMENTAL_BLAST_TALENT.id,
  ],
};

class MasterOfTheElements extends Analyzer {
  moteBuffedAbilities: { [key: number]: number } = {};
  moteActivationTimestamp: number | null = null;
  moteConsumptionTimestamp: number | null = null;
  damageGained = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(SPELLS.MASTER_OF_THE_ELEMENTS_TALENT.id);

    for (const key in MASTER_OF_THE_ELEMENTS.AFFECTED_CASTS) {
      const spellid = MASTER_OF_THE_ELEMENTS.AFFECTED_CASTS[key].id;
      if (this.selectedCombatant.hasTalent(spellid) || !MASTER_OF_THE_ELEMENTS.TALENTS.includes(spellid)) {
        this.moteBuffedAbilities[spellid] = 0;
      }
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(MASTER_OF_THE_ELEMENTS.AFFECTED_CASTS), this._onCast);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.LAVA_BURST), this._onLvBCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(MASTER_OF_THE_ELEMENTS.AFFECTED_DAMAGE), this._onDamage);
  }

  _onCast(event: CastEvent) {
    if (this.moteActivationTimestamp === null) { //the buff is a clusterfuck so we just track it manually
      return;
    }
    this.moteConsumptionTimestamp = event.timestamp;
    this.moteActivationTimestamp = null;
    event.meta = event.meta || {};
    event.meta.isEnhancedCast = true;
    this.moteBuffedAbilities[event.ability.guid] += 1;

  }

  _onLvBCast(event: CastEvent) {
    this.moteActivationTimestamp = event.timestamp;
  }

  _onDamage(event: DamageEvent) {
    if (event.timestamp < (this.moteConsumptionTimestamp || 0)) {
      return;
    }
    if (event.timestamp > (this.moteConsumptionTimestamp || Infinity) + MASTER_OF_THE_ELEMENTS.WINDOW_DURATION) {
      return;
    }
    this.damageGained += calculateEffectiveDamage(event, MASTER_OF_THE_ELEMENTS.INCREASE);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        dropdown={(
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Ability</th>
                  <th>Number of Buffed Casts</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(this.moteBuffedAbilities).map((e) => (
                  <tr key={e}>
                    <th><SpellLink id={Number(e)} /></th>
                    <td>{this.moteBuffedAbilities[Number(e)]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.MASTER_OF_THE_ELEMENTS_TALENT}>
          <>
            <ItemDamageDone amount={this.damageGained} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default MasterOfTheElements;
