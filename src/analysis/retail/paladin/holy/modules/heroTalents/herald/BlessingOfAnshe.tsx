import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

class BlessingOfAnshe extends Analyzer {
  healingDone = 0;
  damageDone = 0;

  constructor(args: Options) {
    super(args);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BLESSING_OF_ANSHE_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SACRED_WEAPON_TALENT),
      this.holyPowerDamage,
    );
  }

  holyPowerDamage(event: ApplyBuffEvent) {
    return 123;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(7)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        tooltip={
          <>
            <ul>
              <li>...</li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.BLESSING_OF_ANSHE_TALENT}>
          <ItemHealingDone amount={this.healingDone} /> <br />
          {this.damageDone > 0 && (
            <>
              <ItemDamageDone amount={this.damageDone} /> <br />
            </>
          )}
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default BlessingOfAnshe;
