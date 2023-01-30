import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TALENTS_DEMON_HUNTER } from 'common/TALENTS';
import Events, { DamageEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS/demonhunter';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatNumber, formatPercentage, formatThousands } from 'common/format';
import Spell from 'common/SPELLS/Spell';
import TalentSpellText from 'parser/ui/TalentSpellText';

const SPELLS_CONVERTED: Spell[] = [
  SPELLS.IMMOLATION_AURA,
  TALENTS_DEMON_HUNTER.SIGIL_OF_FLAME_TALENT,
  SPELLS.SIGIL_OF_FLAME_PRECISE,
  SPELLS.SIGIL_OF_FLAME_CONCENTRATED,
  SPELLS.SIGIL_OF_FLAME_DEBUFF,
  TALENTS_DEMON_HUNTER.THE_HUNT_TALENT,
  SPELLS.THE_HUNT_CHARGE,
  SPELLS.THE_HUNT_DOT,
  TALENTS_DEMON_HUNTER.ELYSIAN_DECREE_TALENT,
  // More ED might go here, can't tell because beta/PTR is bugged
  TALENTS_DEMON_HUNTER.FODDER_TO_THE_FLAME_TALENT,
  // More FttF might go here, can't tell because beta/PTR is bugged
];

export default class AnyMeansNecessary extends Analyzer {
  damage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.ANY_MEANS_NECESSARY_TALENT);
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS_CONVERTED),
      this.anyMeansNecessaryDamage,
    );
  }

  anyMeansNecessaryDamage(event: DamageEvent) {
    this.damage += event.amount;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={`${formatThousands(this.damage)} Total damage`}
      >
        <TalentSpellText talent={TALENTS_DEMON_HUNTER.ANY_MEANS_NECESSARY_TALENT}>
          <img src="/img/sword.png" alt="Damage" className="icon" />
          {formatNumber((this.damage / this.owner.fightDuration) * 1000)} DPS converted{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.damage))} % of total
          </small>
        </TalentSpellText>
      </Statistic>
    );
  }
}
