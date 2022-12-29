import { t } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events from 'parser/core/Events';
import { ThresholdStyle } from 'parser/core/ParseResults';
import Combatants from 'parser/shared/modules/Combatants';

const debug = false;

class ChiBurst extends Analyzer {
  get avgTargetsHitPerCB() {
    return this.targetsChiBurst / this.castChiBurst || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.avgTargetsHitPerCB,
      isLessThan: {
        minor: this.raidSize * 0.3,
        average: this.raidSize * 0.25,
        major: this.raidSize * 0.2,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  static dependencies = {
    combatants: Combatants,
  };
  castChiBurst = 0;
  healing = 0;
  targetsChiBurst = 0;
  raidSize = 0;

  constructor(...options) {
    super(...options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.CHI_BURST_TALENT);
    this.raidSize = Object.keys(this.combatants.players).length;
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.CHI_BURST_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CHI_BURST_HEAL),
      this.onHeal,
    );
    this.addEventListener(Events.fightend, this.onFightend);
  }

  onCast(event) {
    this.castChiBurst += 1;
  }

  onHeal(event) {
    const targetId = event.targetID;

    if (!this.combatants.players[targetId]) {
      return;
    }
    this.healing += (event.amount || 0) + (event.absorbed || 0);
    this.targetsChiBurst += 1;
  }

  suggestions(when) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You are not utilizing your <SpellLink id={TALENTS_MONK.CHI_BURST_TALENT.id} /> talent as
          effectively as you should. You should work on both your positioning and aiming of the
          spell. Always aim for the highest concentration of players, which is normally melee.
        </>,
      )
        .icon(TALENTS_MONK.CHI_BURST_TALENT.icon)
        .actual(
          `${this.avgTargetsHitPerCB.toFixed(2)} ${t({
            id: 'monk.mistweaver.suggestions.chiBurst.targetsHit',
            message: `targets hit per Chi Burst cast - `,
          })}${formatPercentage(this.avgTargetsHitPerCB / this.raidSize)}${t({
            id: 'monk.mistweaver.suggestions.chiBurst.targetsHitPartTwo',
            message: `% of raid hit`,
          })}`,
        )
        .recommended('30% of the raid hit is recommended'),
    );
  }

  onFightend() {
    if (debug) {
      console.log(`ChiBurst Casts: ${this.castChiBurst}`);
      console.log(`Total Chi Burst Healing: ${this.healing}`);
      console.log(`Chi Burst Targets Hit: ${this.targetsChiBurst}`);
    }
  }
}

export default ChiBurst;
