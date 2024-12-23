import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Enemies from 'parser/shared/modules/Enemies';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';

import Events, { DamageEvent } from 'parser/core/Events';

class EntropicRift extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  damageRift = 0;
  damageCollapse = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.ENTROPIC_RIFT_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ENTROPIC_RIFT_DAMAGE),
      this.onRift,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.COLLAPSING_VOID_DAMAGE),
      this.onCollapse,
    );
  }

  onRift(event: DamageEvent) {
    this.damageRift += event.amount + (event.absorbed || 0);
  }

  onCollapse(event: DamageEvent) {
    this.damageCollapse += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.HERO_TALENTS}>
        <BoringSpellValueText spell={TALENTS.ENTROPIC_RIFT_TALENT}>
          <ItemDamageDone amount={this.damageRift} />
        </BoringSpellValueText>
        <BoringSpellValueText spell={TALENTS.COLLAPSING_VOID_TALENT}>
          <ItemDamageDone amount={this.damageCollapse} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default EntropicRift;
