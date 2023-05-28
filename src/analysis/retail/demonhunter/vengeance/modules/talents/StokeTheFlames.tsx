import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import Events, { DamageEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import SPELLS from 'common/SPELLS/demonhunter';
import TalentSpellText from 'parser/ui/TalentSpellText';

const STOKE_THE_FLAMES_INCREASE = 0.4;

export default class StokeTheFlames extends Analyzer {
  addedDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.STOKE_THE_FLAMES_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FEL_DEVASTATION_DAMAGE),
      this.onDamage,
    );
  }

  onDamage(event: DamageEvent) {
    this.addedDamage += calculateEffectiveDamage(event, STOKE_THE_FLAMES_INCREASE);
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <TalentSpellText talent={TALENTS_DEMON_HUNTER.STOKE_THE_FLAMES_TALENT}>
          <ItemDamageDone amount={this.addedDamage} />
        </TalentSpellText>
      </Statistic>
    );
  }
}
