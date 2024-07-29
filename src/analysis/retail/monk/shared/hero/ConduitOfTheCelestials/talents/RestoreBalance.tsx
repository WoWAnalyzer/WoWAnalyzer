import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import { TALENTS_MONK } from 'common/TALENTS';
import SPECS from 'game/SPECS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, HealEvent } from 'parser/core/Events';
import { isFromRestoreBalance } from '../normalizers/ConduitOfTheCelestialsEventLinks';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';

//rushing jade wind for ww -- refreshing jade wind for mw

//xuen trigger for ww -- yulon/chiji trigger for mw
const TRIGGER_SPELLS = [
  TALENTS_MONK.INVOKE_XUEN_THE_WHITE_TIGER_TALENT,
  TALENTS_MONK.INVOKE_CHI_JI_THE_RED_CRANE_TALENT,
  TALENTS_MONK.INVOKE_YULON_THE_JADE_SERPENT_TALENT,
];

class RestoreBalance extends Analyzer {
  spell: Spell;
  casts: number = 0;
  healing: number = 0;
  overheal: number = 0;

  damage: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_MONK.RESTORE_BALANCE_TALENT);
    this.spell =
      this.selectedCombatant.specId === SPECS.MISTWEAVER_MONK.id
        ? SPELLS.REFRESHING_JADE_WIND_HEAL
        : TALENTS_MONK.RUSHING_JADE_WIND_WINDWALKER_TALENT;

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(TRIGGER_SPELLS), this.onCast);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(this.spell), this.onDamage);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(this.spell), this.onHeal);
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
