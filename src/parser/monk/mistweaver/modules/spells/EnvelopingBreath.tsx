import React from 'react';

import SPELLS from 'common/SPELLS';
import { formatNumber } from 'common/format';
import Statistic from 'interface/statistics/Statistic';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';
import BoringSpellValueText from 'interface/statistics/components/BoringSpellValueText';
import SpellLink from 'common/SpellLink';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, DeathEvent, HealEvent } from 'parser/core/Events';
import calculateEffectiveHealing from 'parser/core/calculateEffectiveHealing';
import Combatants from 'parser/shared/modules/Combatants';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import { t } from '@lingui/macro';

const ENVELOPING_BREATH_INCREASE = .1;
const debug: boolean = false;

class EnvelopingBreath extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  envsDuringCelestial: number = 0;
  envBreathsApplied: number = 0;
  chijiActive: boolean = false;
  envBIncrease: number = 0;
  protected combatants!: Combatants;

  constructor(options: Options) {
    super(options);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.handleEnvelopingBreathHeal);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_BREATH), this.handleEnvelopingBreathCount);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.ENVELOPING_MIST), this.handleEnvelopingMist);
    if (this.selectedCombatant.hasTalent(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT)) {
      this.addEventListener(Events.death.to(SELECTED_PLAYER_PET), this.handleChijiDeath);
      this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.INVOKE_CHIJI_THE_RED_CRANE_TALENT), this.handleChijiSummon);
    }
  }

  get averageEnvBPerEnv() {
    return this.envBreathsApplied / this.envsDuringCelestial || 0;
  }

  get suggestionThresholds() {
    return {
      actual: this.averageEnvBPerEnv,
      isLessThan: {
        minor: 5,
        average: 4,
        major: 3,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  handleEnvelopingBreathHeal(event: HealEvent) {
    const targetId = event.targetID;
    const sourceId = event.sourceID;

    if (this.combatants.players[targetId]) {
      if (this.combatants.players[targetId].hasBuff(SPELLS.ENVELOPING_BREATH.id, event.timestamp, 0, 0, sourceId)) {
        this.envBIncrease += calculateEffectiveHealing(event, ENVELOPING_BREATH_INCREASE);
      }
    }
  }

  handleEnvelopingMist(event: CastEvent) {
    if (this.chijiActive || this.selectedCombatant.hasBuff(SPELLS.INVOKE_YULON_THE_JADE_SERPENT.id)) {
      this.envsDuringCelestial += 1;
    }
  }

  handleEnvelopingBreathCount(event: ApplyBuffEvent) {
    this.envBreathsApplied += 1;
  }

  handleChijiSummon(event: CastEvent) {
    this.chijiActive = true;
    debug && console.log('Chiji summoned');
  }

  handleChijiDeath(event: DeathEvent) {
    this.chijiActive = false;
    debug && console.log('Chiji Died');
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) => suggest(
      <>
        You are not utilizing <SpellLink id={SPELLS.ENVELOPING_BREATH.id} /> effectively. Make sure you are choosing good targets for your <SpellLink id={SPELLS.ENVELOPING_MIST.id} /> during your Celestial cooldowns to apply the maximum number of <SpellLink id={SPELLS.ENVELOPING_BREATH.id} /> possible.
      </>,
    )
      .icon(SPELLS.ENVELOPING_BREATH.icon)
      .actual(`${this.averageEnvBPerEnv.toFixed(2)}${t({
      id: "monk.mistweaver.suggestions.envelopingBreath.averageEnvBPerEnv",
      message: ` Enveloping Breaths per Enveloping Mist during Celestial`
    })}`)
      .recommended(`${recommended} Enveloping Breaths are recommended per cast`));
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.GENERAL}
        tooltip={<>This is the effective healing contributed by the Enveloping Breath buff.</>}
      >
        <BoringSpellValueText spell={SPELLS.ENVELOPING_BREATH}>
          <>
            {formatNumber(this.envBIncrease)} <small>healing contributed by the buff</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

}

export default EnvelopingBreath;
