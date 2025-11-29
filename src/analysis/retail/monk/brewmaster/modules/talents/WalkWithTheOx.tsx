import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

export default class WalkWithTheOx extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  rank = 0;
  additionalDamage = 0;

  constructor(options: Options) {
    super(options);

    this.rank = this.selectedCombatant.getTalentRank(talents.WALK_WITH_THE_OX_TALENT);
    if (!this.rank) {
      this.active = false;
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.WWTO_STOMP_DAMAGE),
      this.onStomp,
    );
  }

  private onStomp(event: DamageEvent) {
    this.additionalDamage += event.amount + (event.absorbed ?? 0);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={talents.WALK_WITH_THE_OX_TALENT}>
          <ItemDamageDone amount={this.additionalDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
