import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_EVOKER } from 'common/TALENTS';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SPELLS from 'common/SPELLS';
import { InformationIcon } from 'interface/icons';
import { formatPercentage } from 'common/format';
import TALENTS from 'common/TALENTS/evoker';
import Events, { DamageEvent, EmpowerEndEvent, GetRelatedEvents } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { TIME_CONVERGENCE_INT_MULTIPLIER } from 'analysis/retail/evoker/shared/constants';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { UPHEAVAL_REVERBERATION_DAM_LINK } from 'analysis/retail/evoker/augmentation/modules/normalizers/CastLinkNormalizer';
import SPECS from 'game/SPECS';
/**
 * Using certain abilities with a 45 second or longer base cooldown grants 5% Intellect for 15 sec. Essence abilities extend the duration by 1 sec.
 */
const AMPED_DAMAGE = [
  SPELLS.LIVING_FLAME_DAMAGE,
  TALENTS.ERUPTION_TALENT,
  SPELLS.DEEP_BREATH_DAM,
  // Add Reverberations
  SPELLS.UPHEAVAL_DAM,
  SPELLS.EBON_MIGHT_BUFF_EXTERNAL,
  SPELLS.CHRONO_FLAME_DAMAGE,
  SPELLS.FIRE_BREATH_DOT,
  SPELLS.DUPLICATE_ERUPTION,
  SPELLS.DUPLICATE_FIRE_BREATH,
];

class TimeConvergence extends Analyzer {
  extraDamage = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.TIME_CONVERGENCE_TALENT);

    if (this.selectedCombatant.spec === SPECS.AUGMENTATION_EVOKER) {
      this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(AMPED_DAMAGE), this.onDamage);
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER_PET).spell(AMPED_DAMAGE),
        this.onDamage,
      );

      if (this.selectedCombatant.hasTalent(TALENTS.REVERBERATIONS_TALENT)) {
        this.addEventListener(
          Events.empowerEnd.by(SELECTED_PLAYER).spell([SPELLS.UPHEAVAL, SPELLS.UPHEAVAL_FONT]),
          this.addReverberationsDamage,
        );
      }
    }
  }

  onDamage(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.TIME_CONVERGENCE_BUFF.id)) {
      this.extraDamage += calculateEffectiveDamage(event, TIME_CONVERGENCE_INT_MULTIPLIER);
    }
  }

  private addReverberationsDamage(event: EmpowerEndEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.EBON_MIGHT_BUFF_PERSONAL.id)) {
      const reverbEvents = GetRelatedEvents<DamageEvent>(event, UPHEAVAL_REVERBERATION_DAM_LINK);

      reverbEvents.forEach((reverbEvent) => {
        this.extraDamage += calculateEffectiveDamage(reverbEvent, TIME_CONVERGENCE_INT_MULTIPLIER);
      });
    }
  }

  statistic() {
    const buffUptime =
      this.selectedCombatant.getBuffUptime(SPELLS.TIME_CONVERGENCE_BUFF.id) /
      this.owner.fightDuration;
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(5)}
        size="flexible"
        category={STATISTIC_CATEGORY.HERO_TALENTS}
      >
        <TalentSpellText talent={TALENTS_EVOKER.TIME_CONVERGENCE_TALENT}>
          <div>
            {this.selectedCombatant.spec === SPECS.AUGMENTATION_EVOKER && (
              <ItemDamageDone amount={this.extraDamage} />
            )}
            <InformationIcon /> {formatPercentage(buffUptime, 2)}%<small> buff uptime</small>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default TimeConvergence;
