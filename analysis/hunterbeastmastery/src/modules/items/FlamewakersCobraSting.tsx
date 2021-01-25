import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import React from 'react';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import SPELLS from 'common/SPELLS';
import Events from 'parser/core/Events';
import { plotOneVariableBinomChart } from 'parser/shared/modules/helpers/Probability';
import { FLAMEWAKERS_PROC_CHANCE, KILL_COMMAND_BM_FOCUS_COST } from '@wowanalyzer/hunter-beastmastery/src/constants';
import { SpellLink } from 'interface';

/**
 * Cobra Shot has a 25% chance to make your next Kill Command consume no Focus.
 *
 * Example log:
 *
 */
class FlamewakersCobraSting extends Analyzer {

  cobraCasts: number = 0;
  procs: number = 0;
  utilizedFlamewakerBuffs: number = 0;
  wastedFlamewakerBuffs: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.FLAMEWAKERS_COBRA_STING_EFFECT.bonusID);
    if (!this.active) {
      return;
    }
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.COBRA_SHOT), this.onCobra);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.KILL_COMMAND_CAST_BM), this.onKillCommand);
    this.addEventListener(Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.FLAMEWAKERS_COBRA_STING_BUFF), this.refreshFlamewaker);
    this.addEventListener(Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.FLAMEWAKERS_COBRA_STING_BUFF), this.applyFlamewaker);
  }

  onCobra() {
    this.cobraCasts += 1;
  }

  onKillCommand() {
    if (this.selectedCombatant.hasBuff(SPELLS.FLAMEWAKERS_COBRA_STING_BUFF.id)) {
      this.utilizedFlamewakerBuffs += 1;
    }
  }

  applyFlamewaker() {
    this.procs += 1;
  }

  refreshFlamewaker() {
    this.procs += 1;
    this.wastedFlamewakerBuffs += 1;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE()}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        dropdown={(
          <>
            <div style={{ padding: '8px' }}>
              {plotOneVariableBinomChart(this.procs, this.cobraCasts, FLAMEWAKERS_PROC_CHANCE)}
              <p>Likelihood of getting <em>exactly</em> as many procs as estimated on a fight given your number of <SpellLink id={SPELLS.KILL_COMMAND_CAST_BM.id} /> casts.</p>
            </div>
          </>
        )}
      >
        <BoringSpellValueText spell={SPELLS.FLAMEWAKERS_COBRA_STING_EFFECT}>
          {this.utilizedFlamewakerBuffs}/{this.wastedFlamewakerBuffs + this.utilizedFlamewakerBuffs} <small> Procs utilized </small>
          <br />
          {this.utilizedFlamewakerBuffs * KILL_COMMAND_BM_FOCUS_COST} <small> Focus saved</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FlamewakersCobraSting;
