import { TALENTS_MONK } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, HealEvent } from 'parser/core/Events';
import { isFromRestoreBalance } from '../normalizers/ConduitOfTheCelestialsEventLinks';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';

//xuen trigger for ww -- yulon/chiji trigger for mw
const TRIGGER_SPELLS = [
  TALENTS_MONK.CELESTIAL_CONDUIT_2_WINDWALKER_TALENT,
  TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT,
  TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT,
];
//TODO: Update for Midnight rework (5% damage during celestial)
class RestoreBalance extends Analyzer {
  casts = 0;
  healing = 0;
  overheal = 0;

  damage = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.RESTORE_BALANCE_TALENT);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(TRIGGER_SPELLS), this.onCast);
  }

  private onCast(event: CastEvent) {
    this.casts += 1;
  }

  private onDamage(event: DamageEvent) {
    if (isFromRestoreBalance(event)) {
      this.damage += event.amount + (event.absorbed || 0);
    }
  }

  private onHeal(event: HealEvent) {
    if (isFromRestoreBalance(event)) {
      this.healing += event.amount + (event.absorbed || 0);
      this.overheal += event.overheal || 0;
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(0)}
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
      >
        <TalentSpellText talent={TALENTS_MONK.RESTORE_BALANCE_TALENT}>
          <ItemHealingDone amount={this.healing} />
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default RestoreBalance;
