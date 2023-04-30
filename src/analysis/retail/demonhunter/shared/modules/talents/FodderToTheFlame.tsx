import { ReactNode } from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/demonhunter';
import TALENTS from 'common/TALENTS/demonhunter';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { DEMON_SOUL_BUFF_ALLOWLIST } from 'analysis/retail/demonhunter/shared/constants';

export default class FodderToTheFlame extends Analyzer {
  private nonFodderDemonSoulAddedDamage = 0;
  private fodderDemonSoulAddedDamage = 0;
  private fodderDamage = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.FODDER_TO_THE_FLAME_TALENT);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.nonFodderDemonSoulOnDamage);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.fodderDemonSoulOnDamage);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FODDER_TO_THE_FLAME_DAMAGE),
      this.fodderOnDamage,
    );
  }

  statistic(): ReactNode {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.GENERAL}>
        <BoringSpellValueText spell={SPELLS.FODDER_TO_THE_FLAME}>
          <ItemDamageDone amount={this.fodderDamage} />
        </BoringSpellValueText>
        <BoringSpellValueText spell={SPELLS.DEMON_SOUL_BUFF_FODDER}>
          <ItemDamageDone amount={this.fodderDemonSoulAddedDamage} />
        </BoringSpellValueText>
        <BoringSpellValueText spell={SPELLS.DEMON_SOUL_BUFF_NON_FODDER}>
          <ItemDamageDone amount={this.nonFodderDemonSoulAddedDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }

  private nonFodderDemonSoulOnDamage(event: DamageEvent) {
    if (
      !this.selectedCombatant.hasBuff(SPELLS.DEMON_SOUL_BUFF_NON_FODDER.id) ||
      !DEMON_SOUL_BUFF_ALLOWLIST.includes(event.ability.guid)
    ) {
      return;
    }
    this.nonFodderDemonSoulAddedDamage += calculateEffectiveDamage(event, 0.2);
  }

  private fodderDemonSoulOnDamage(event: DamageEvent) {
    if (
      !this.selectedCombatant.hasBuff(SPELLS.DEMON_SOUL_BUFF_FODDER.id) ||
      !DEMON_SOUL_BUFF_ALLOWLIST.includes(event.ability.guid)
    ) {
      return;
    }
    this.fodderDemonSoulAddedDamage += calculateEffectiveDamage(event, 0.2);
  }

  private fodderOnDamage(event: DamageEvent) {
    this.fodderDamage += event.amount;
  }
}
