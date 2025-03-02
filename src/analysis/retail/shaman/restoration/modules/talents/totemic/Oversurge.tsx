import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import Events, { HealEvent, DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { formatNumber } from 'common/format';
import {
  calculateEffectiveDamage,
  calculateEffectiveHealing,
  calculateOverhealing,
} from 'parser/core/EventCalculateLib';
import SPELLS from 'common/SPELLS';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

const OVERSURGE_INCREASE = 1.5;

export default class Oversurge extends Analyzer {
  healingDoneFromTalent = 0;
  overhealingDoneFromTalent = 0;
  damageFromTalent = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.OVERSURGE_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.HEALING_RAIN_HEAL),
      this.onHeal,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ACID_RAIN_DAMAGE),
      this.onDamage,
    );
  }

  onHeal(event: HealEvent) {
    if (this.selectedCombatant.hasBuff(TALENTS.ASCENDANCE_RESTORATION_TALENT)) {
      this.healingDoneFromTalent += calculateEffectiveHealing(event, OVERSURGE_INCREASE);
      this.overhealingDoneFromTalent += calculateOverhealing(event, OVERSURGE_INCREASE);
    }
  }

  onDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasTalent(TALENTS.ACID_RAIN_TALENT)) {
      // shouldn't happen, just in case
      return;
    }
    if (this.selectedCombatant.hasBuff(TALENTS.ASCENDANCE_RESTORATION_TALENT)) {
      this.damageFromTalent += calculateEffectiveDamage(event, OVERSURGE_INCREASE);
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <strong>{formatNumber(this.healingDoneFromTalent)}</strong> bonus healing (
            {formatNumber(this.overhealingDoneFromTalent)} overhealing)
          </>
        }
      >
        <TalentSpellText talent={TALENTS.OVERSURGE_TALENT}>
          <div>
            <ItemHealingDone amount={this.healingDoneFromTalent} />{' '}
          </div>
          {this.damageFromTalent > 0 && (
            <div>
              <ItemDamageDone amount={this.damageFromTalent} />{' '}
            </div>
          )}
        </TalentSpellText>
      </Statistic>
    );
  }
}
