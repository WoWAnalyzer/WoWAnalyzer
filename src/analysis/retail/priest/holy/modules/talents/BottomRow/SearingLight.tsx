import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, RemoveDebuffEvent, ApplyDebuffEvent } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/priest';
import SPELLS from 'common/SPELLS';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';

const DAMAGE_INCREASE_PER_RANK = [0, 0.25, 0.5];

//Example log: /report/VXr2kgALF3Rj6Q4M/11-Mythic+Anduin+Wrynn+-+Kill+(5:12)/Litena/standard/statistics
class SearingLight extends Analyzer {
  damageBonus = 0;
  damageFromTalent = 0;

  targetsWithHolyFire: Array<number> = [];

  constructor(options: Options) {
    super(options);
    if (!this.selectedCombatant.hasTalent(TALENTS.SEARING_LIGHT_TALENT)) {
      this.active = false;
    }
    this.damageBonus =
      DAMAGE_INCREASE_PER_RANK[this.selectedCombatant.getTalentRank(TALENTS.SEARING_LIGHT_TALENT)];

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SMITE), this.onSmite);

    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.HOLY_FIRE),
      this.onHolyFireDebuff,
    );

    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(SPELLS.HOLY_FIRE),
      this.onHolyFireFallOff,
    );
  }

  onSmite(event: DamageEvent) {
    this.damageFromTalent += calculateEffectiveDamage(event, this.damageBonus);
    return;
  }

  onHolyFireDebuff(event: ApplyDebuffEvent) {
    this.targetsWithHolyFire.push(event.targetID);
  }
  onHolyFireFallOff(event: RemoveDebuffEvent) {
    const index = this.targetsWithHolyFire.indexOf(event.targetID);
    //Every element of the array should be unique so we don't need to delete multiple times
    //The target should also always be in the array but still error checking
    if (index > -1) {
      this.targetsWithHolyFire.splice(index, 1);
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(15)}
      >
        <TalentSpellText talent={TALENTS.SEARING_LIGHT_TALENT}>
          <ItemDamageDone amount={this.damageFromTalent} />
        </TalentSpellText>
      </Statistic>
    );
  }
}
export default SearingLight;
