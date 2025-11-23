import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/shaman';
import SPELLS from 'common/SPELLS';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { isSplitstreamHeal } from '../../../normalizers/CastLinkNormalizer';
import { formatNumber } from 'common/format';

export default class Splitstream extends Analyzer {
  healingDoneFromTalent = 0;
  overhealingDoneFromTalent = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SPLITSTREAM_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER | SELECTED_PLAYER_PET).spell(SPELLS.HEALING_STREAM_TOTEM_HEAL),
      this.onHealingStreamHeal,
    );
  }

  onHealingStreamHeal(event: HealEvent) {
    // only check the duplicated heal from the talent
    // right now the talent is bugged to just heal a 2nd time at 100% effectiveness
    // once this is fixed, we will need to check to only count
    // the 2nd heal that should be at 50% effectiveness
    if (!isSplitstreamHeal(event)) {
      return;
    }
    this.healingDoneFromTalent += event.amount;
    this.overhealingDoneFromTalent += event.overheal ?? 0;
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
        <TalentSpellText talent={TALENTS.SPLITSTREAM_TALENT}>
          <div>
            <ItemHealingDone amount={this.healingDoneFromTalent} />{' '}
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}
