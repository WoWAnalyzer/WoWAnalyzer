import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent } from 'parser/core/Events';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { HEAT_WAVE_MULTIPLIER } from 'analysis/retail/evoker/devastation/constants';
import TalentSpellText from 'parser/ui/TalentSpellText';

const { FIRE_BREATH_DOT } = SPELLS;

class HeatWave extends Analyzer {
  fireBreathDamage: number = 0;
  heatWaveDamage: number = 0;
  heatWaveDamageMultiplier: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HEAT_WAVE_TALENT);
    const ranks = this.selectedCombatant.getTalentRank(TALENTS.HEAT_WAVE_TALENT);
    this.heatWaveDamageMultiplier = HEAT_WAVE_MULTIPLIER * ranks;

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(FIRE_BREATH_DOT), this.onHit);
  }

  onHit(event: DamageEvent) {
    this.fireBreathDamage += event.amount;
    if (event.absorbed !== undefined) {
      this.fireBreathDamage += event.absorbed;
    }
  }

  statistic() {
    this.heatWaveDamage =
      this.fireBreathDamage - this.fireBreathDamage / (1 + this.heatWaveDamageMultiplier);

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>Damage: {formatNumber(this.heatWaveDamage)}</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.HEAT_WAVE_TALENT}>
          <ItemDamageDone amount={this.heatWaveDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default HeatWave;
