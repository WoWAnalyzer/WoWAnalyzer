import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import { formatNumber } from 'common/format';

import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Events, { DamageEvent } from 'parser/core/Events';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { UNRELENTING_SIEGE_MULTIPLIER_PER_STACK } from 'analysis/retail/evoker/shared/constants';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import SPECS from 'game/SPECS';

const AMPED_SPELLS = [
  SPELLS.AZURE_STRIKE,
  SPELLS.LIVING_FLAME_DAMAGE,
  SPELLS.DISINTEGRATE,
  TALENTS.ERUPTION_TALENT,
];

/**
 * For each second you are in combat, Azure Strike, Living Flame, and Disintegrate/Eruption
 * deal 1% increased damage, up to 15%.
 */
class UnrelentingSiege extends Analyzer {
  azureStrikeDamage = 0;
  livingFlameDamage = 0;
  disintegrateDamage = 0;
  eruptionDamage = 0;
  totalDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.UNRELENTING_SIEGE_TALENT);

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(AMPED_SPELLS), this.onDamage);
  }

  onDamage(event: DamageEvent) {
    const stacks = this.selectedCombatant.getBuffStacks(SPELLS.UNRELENTING_SIEGE_BUFF.id);
    if (!stacks) {
      return;
    }

    const amount = calculateEffectiveDamage(event, stacks * UNRELENTING_SIEGE_MULTIPLIER_PER_STACK);
    this.totalDamage += amount;

    switch (event.ability.guid) {
      case SPELLS.AZURE_STRIKE.id:
        this.azureStrikeDamage += amount;
        break;
      case SPELLS.LIVING_FLAME_DAMAGE.id:
        this.livingFlameDamage += amount;
        break;
      case SPELLS.DISINTEGRATE.id:
        this.disintegrateDamage += amount;
        break;
      case TALENTS.ERUPTION_TALENT.id:
        this.eruptionDamage += amount;
        break;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            {this.selectedCombatant.specId === SPECS.DEVASTATION_EVOKER.id ? (
              <li>Disintegrate: {formatNumber(this.disintegrateDamage)}</li>
            ) : (
              <li>Eruption: {formatNumber(this.eruptionDamage)}</li>
            )}
            <li>Living Flame: {formatNumber(this.livingFlameDamage)}</li>
            <li>Azure Strike: {formatNumber(this.azureStrikeDamage)}</li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.UNRELENTING_SIEGE_TALENT}>
          <ItemDamageDone amount={this.totalDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default UnrelentingSiege;
