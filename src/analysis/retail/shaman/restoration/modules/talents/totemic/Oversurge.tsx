import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS/shaman';
import Events, { HealEvent, DamageEvent } from 'parser/core/Events';

import {
  calculateEffectiveDamage,
  calculateEffectiveHealing,
  calculateOverhealing,
} from 'parser/core/EventCalculateLib';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { formatNumber } from 'common/format';

import { healingIncreases } from 'analysis/retail/shaman/restoration/constants';

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
    if (this.selectedCombatant.hasTalent(TALENTS.HEALING_TIDE_TOTEM_TALENT)) {
      this.addEventListener(
        Events.heal.by(SELECTED_PLAYER | SELECTED_PLAYER_PET).spell(SPELLS.HEALING_TIDE_TOTEM_HEAL),
        this.onHTTHeal,
      );
    }
  }

  onHeal(event: HealEvent) {
    if (this.selectedCombatant.hasBuff(TALENTS.ASCENDANCE_RESTORATION_TALENT)) {
      this.healingDoneFromTalent += calculateEffectiveHealing(
        event,
        healingIncreases.OVERSURGE_INCREASE,
      );
      this.overhealingDoneFromTalent += calculateOverhealing(
        event,
        healingIncreases.OVERSURGE_INCREASE,
      );
    }
  }

  onHTTHeal(event: HealEvent) {
    if (this.selectedCombatant.hasTalent(TALENTS.HEALING_TIDE_TOTEM_TALENT)) {
      this.healingDoneFromTalent += calculateEffectiveHealing(
        event,
        healingIncreases.OVERSURGE_INCREASE,
      );
      this.overhealingDoneFromTalent += calculateOverhealing(
        event,
        healingIncreases.OVERSURGE_INCREASE,
      );
    }
  }

  onDamage(event: DamageEvent) {
    if (!this.selectedCombatant.hasTalent(TALENTS.ACID_RAIN_TALENT)) {
      // shouldn't happen, just in case
      return;
    }
    if (this.selectedCombatant.hasBuff(TALENTS.ASCENDANCE_RESTORATION_TALENT)) {
      this.damageFromTalent += calculateEffectiveDamage(event, healingIncreases.OVERSURGE_INCREASE);
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
