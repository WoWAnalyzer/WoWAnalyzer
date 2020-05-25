import React from 'react';

import Analyzer from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS';
import { encodeTargetString } from 'parser/shared/modules/EnemyInstances';
import Enemies from 'parser/shared/modules/Enemies';
import StatTracker from 'parser/shared/modules/StatTracker';
import { SERPENT_STING_SV_BASE_DURATION } from 'parser/hunter/survival/constants';
import ItemDamageDone from 'interface/ItemDamageDone';
import { formatDuration } from 'common/format';
import SpellLink from 'common/SpellLink';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_ORDER from 'interface/others/STATISTIC_ORDER';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';

/**
 * Lace your Wildfire Bomb with extra reagents, randomly giving it one of the following enhancements each time you throw it:
 *
 * Volatile Bomb:
 * Reacts violently with poison, causing an extra explosion against enemies suffering from your Serpent Sting and refreshes your Serpent Stings.
 *
 * Example log: https://www.warcraftlogs.com/reports/n8AHdKCL9k3rtRDb#fight=36&type=damage-done
 */

const SERPENT_STING_FOCUS_COST = 20;

class VolatileBomb extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    statTracker: StatTracker,
  };
  damage = 0;
  casts = 0;
  extendedSerpentStings = 0;
  extendedInMs = 0;
  focusSaved = 0;
  missedSerpentResets = 0;

  activeSerpentStings = {
    /*
    [encodedTargetString]: {
        targetName: name,
        cast: timestamp,
        expectedEnd: timestamp,
        extendStart: timestamp || null,
        extendExpectedEnd: timestamp || null,
      },
     */
  };

  constructor(...args) {
    super(...args);
    this.active = this.selectedCombatant.hasTalent(SPELLS.WILDFIRE_INFUSION_TALENT.id);
  }

  _serpentApplication(event) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    const target = encodeTargetString(event.targetID, event.targetInstance);
    const hastedSerpentStingDuration = SERPENT_STING_SV_BASE_DURATION / (1 + this.statTracker.currentHastePercentage);
    this.activeSerpentStings[target] = {
      targetName: enemy.name,
      cast: event.timestamp,
      expectedEnd: event.timestamp + hastedSerpentStingDuration,
      extendStart: null,
      extendExpectedEnd: null,
    };
  }

  _maybeSerpentStingExtend(event) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy) {
      return;
    }
    const target = encodeTargetString(event.targetID, event.targetInstance);
    if (this.activeSerpentStings[target]) {
      this.activeSerpentStings[target].extendStart = event.timestamp;
      this.activeSerpentStings[target].extendExpectedEnd = event.timestamp + (this.activeSerpentStings[target].expectedEnd - this.activeSerpentStings[target].cast);

      this.extendedInMs += this.activeSerpentStings[target].extendExpectedEnd - this.activeSerpentStings[target].expectedEnd;
      this.focusSaved += SERPENT_STING_FOCUS_COST;
      this.extendedSerpentStings += 1;
    } else {
      this.missedSerpentResets += 1;
    }
  }

  on_byPlayer_applydebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.VOLATILE_BOMB_WFI_DOT.id && spellId !== SPELLS.SERPENT_STING_SV.id) {
      return;
    }
    if (spellId === SPELLS.SERPENT_STING_SV.id) {
      this._serpentApplication(event);
    }
    if (spellId === SPELLS.VOLATILE_BOMB_WFI_DOT.id) {
      this._maybeSerpentStingExtend(event);
    }
  }

  on_byPlayer_refreshdebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.VOLATILE_BOMB_WFI_DOT.id && spellId !== SPELLS.SERPENT_STING_SV.id) {
      return;
    }
    if (spellId === SPELLS.SERPENT_STING_SV.id) {
      this._serpentApplication(event);
    }
  }

  on_byPlayer_removedebuff(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.SERPENT_STING_SV.id) {
      return;
    }
    const encoded = encodeTargetString(event.targetID, event.targetInstance);
    delete this.activeSerpentStings[encoded];
  }

  on_byPlayer_damage(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.VOLATILE_BOMB_WFI_DOT.id && spellId !== SPELLS.VOLATILE_BOMB_WFI_IMPACT.id) {
      return;
    }
    this.damage += event.amount + (event.absorbed || 0);
  }

  on_byPlayer_cast(event) {
    const spellId = event.ability.guid;
    if (spellId !== SPELLS.VOLATILE_BOMB_WFI.id) {
      return;
    }
    this.casts += 1;
  }

  get missedResetsThresholds() {
    return {
      actual: this.missedSerpentResets,
      isGreaterThan: {
        minor: 1,
        average: 2,
        major: 3,
      },
      style: 'number',
    };
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        category={'TALENTS'}
        dropdown={(
          <>
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Refreshes</th>
                  <th>Avg</th>
                  <th>Total</th>
                  <th>Focus saved</th>
                  <th>Missed refreshes</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>{this.extendedSerpentStings}</td>
                  <td>{formatDuration(this.extendedInMs / this.casts / 1000)}</td>
                  <td>{formatDuration(this.extendedInMs / 1000)}</td>
                  <td>{this.focusSaved}</td>
                  <td>{this.missedSerpentResets}</td>
                </tr>
              </tbody>
            </table>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.VOLATILE_BOMB_WFI}>
          <>
            <ItemDamageDone amount={this.damage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  suggestions(when) {
    const serpentSting = <SpellLink id={SPELLS.SERPENT_STING_SV.id} />;
    when(this.missedResetsThresholds).addSuggestion((suggest, actual, recommended) => {
      return suggest(<>You shouldn't cast <SpellLink id={SPELLS.VOLATILE_BOMB_WFI.id} /> if your target doesn't have <SpellLink id={SPELLS.SERPENT_STING_SV.id} /> on.</>)
        .icon(SPELLS.VOLATILE_BOMB_WFI.icon)
        .actual(`${actual} casts without ${serpentSting} on`)
        .recommended(`<${recommended} is recommended`);
    });

  }
}

export default VolatileBomb;
