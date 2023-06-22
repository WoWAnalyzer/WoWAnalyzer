import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { ARCANE_INTENSITY_MULTIPLIER } from 'analysis/retail/evoker/devastation/constants';
import TalentSpellText from 'parser/ui/TalentSpellText';

const { DISINTEGRATE } = SPELLS;

class ArcaneIntensity extends Analyzer {
  arcaneIntensityDamage: number = 0;
  arcaneIntensityMultiplier: number = ARCANE_INTENSITY_MULTIPLIER;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ARCANE_INTENSITY_TALENT);
    const ranks = this.selectedCombatant.getTalentRank(TALENTS.ARCANE_INTENSITY_TALENT);
    this.arcaneIntensityMultiplier = ARCANE_INTENSITY_MULTIPLIER * ranks;

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(DISINTEGRATE), this.onHit);
  }

  onHit(event: DamageEvent) {
    this.arcaneIntensityDamage += calculateEffectiveDamage(event, this.arcaneIntensityMultiplier);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={<li>Damage: {formatNumber(this.arcaneIntensityDamage)}</li>}
      >
        <TalentSpellText talent={TALENTS.ARCANE_INTENSITY_TALENT}>
          <ItemDamageDone amount={this.arcaneIntensityDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ArcaneIntensity;
