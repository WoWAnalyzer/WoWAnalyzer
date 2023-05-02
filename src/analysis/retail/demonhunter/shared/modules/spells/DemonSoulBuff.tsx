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

export default class DemonSoulBuff extends Analyzer {
  private addedDamage = 0;
  constructor(options: Options) {
    super(options);
    this.active = !this.selectedCombatant.hasTalent(TALENTS.FODDER_TO_THE_FLAME_TALENT);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
  }

  statistic(): ReactNode {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.GENERAL}>
        <BoringSpellValueText spell={SPELLS.DEMON_SOUL_BUFF_NON_FODDER}>
          <ItemDamageDone amount={this.addedDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }

  private onDamage(event: DamageEvent) {
    if (
      !this.selectedCombatant.hasBuff(SPELLS.DEMON_SOUL_BUFF_NON_FODDER.id) ||
      !DEMON_SOUL_BUFF_ALLOWLIST.includes(event.ability.guid)
    ) {
      return;
    }
    this.addedDamage += calculateEffectiveDamage(event, 0.2);
  }
}
