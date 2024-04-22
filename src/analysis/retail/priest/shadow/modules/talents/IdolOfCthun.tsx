import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { DamageEvent, ResourceChangeEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemInsanityGained from '../../interface/ItemInsanityGained';

class IdolOfCthun extends Analyzer {
  damage = 0;
  insanity = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.IDOL_OF_CTHUN_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.IDOL_OF_CTHUN_MIND_FLAY_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER_PET).spell(SPELLS.IDOL_OF_CTHUN_MIND_SEAR_DAMAGE),
      this.onDamage,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.IDOL_OF_CTHUN_RESOURCE),
      this.onResource,
    );
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onResource(event: ResourceChangeEvent) {
    this.insanity += event.resourceChange;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spell={TALENTS.IDOL_OF_CTHUN_TALENT}>
          <div>
            <ItemDamageDone amount={this.damage} />
          </div>
          <div>
            <ItemInsanityGained amount={this.insanity} />
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default IdolOfCthun;
