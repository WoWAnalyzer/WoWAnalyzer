import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_EVOKER } from 'common/TALENTS';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SPELLS from 'common/SPELLS';
import { InformationIcon } from 'interface/icons';
import { formatPercentage } from 'common/format';
import {
  DUPLICATE_EBON_MIGHT_MULTIPLIER,
  DUPLICATE_PERSONAL_DAMAGE_MULTIPLIER,
} from '../../constants';
import Events, { DamageEvent, EmpowerEndEvent, GetRelatedEvents } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/evoker';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import DonutChart from 'parser/ui/DonutChart';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { formatNumber } from 'common/format';
import { UPHEAVAL_REVERBERATION_DAM_LINK } from '../normalizers/CastLinkNormalizer';
/**
 * R1: Deep Breath / Breath of Eons summons Future Self for 20 sec, which will cast Eruption frequently and occasionally empower spells.
 * R2/R3: Sands of Time also extends the duration of Duplicate by 50%/100% of its value.
 * R4: While Duplicate is active, Ebon Might grants 100% additional stats, and your Eruption and Upheaval* deal 25% additional damage.
 * *As of current alpha build, Upheaval is not affected.
 */
class Duplicate extends Analyzer {
  canExtendDuplicate = this.selectedCombatant.hasTalent(
    TALENTS_EVOKER.DUPLICATE_2_AUGMENTATION_TALENT,
  );
  duplicateBuffsEbonMight = this.selectedCombatant.hasTalent(
    TALENTS_EVOKER.DUPLICATE_3_AUGMENTATION_TALENT,
  );
  petDamage = 0;
  personalDamage = 0;
  externalDamage = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.DUPLICATE_1_AUGMENTATION_TALENT);
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER_PET)
        .spell([SPELLS.DUPLICATE_ERUPTION, SPELLS.DUPLICATE_FIRE_BREATH, SPELLS.UPHEAVAL_DAM]),
      this.onPetDamage,
    );

    if (this.duplicateBuffsEbonMight) {
      this.addEventListener(
        Events.damage
          .by(SELECTED_PLAYER)
          .spell([TALENTS.ERUPTION_TALENT, SPELLS.MASS_ERUPTION_DAMAGE, SPELLS.UPHEAVAL_DAM]),
        this.onPersonalDamage,
      );

      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.EBON_MIGHT_BUFF_EXTERNAL),
        this.onExternalDamage,
      );

      if (this.selectedCombatant.hasTalent(TALENTS.REVERBERATIONS_TALENT)) {
        this.addEventListener(
          Events.empowerEnd.by(SELECTED_PLAYER).spell([SPELLS.UPHEAVAL, SPELLS.UPHEAVAL_FONT]),
          this.addReverberationsDamage,
        );
      }
    }
  }

  onPetDamage(event: DamageEvent) {
    this.petDamage += event.amount;
  }

  onPersonalDamage(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.DUPLICATE_SELF_BUFF.id)) {
      this.personalDamage += calculateEffectiveDamage(event, DUPLICATE_PERSONAL_DAMAGE_MULTIPLIER);
    }
  }

  onExternalDamage(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.DUPLICATE_SELF_BUFF.id)) {
      //This is approximate. Certain abilities (e.g. Ignite) do their damage over time,
      //meaning that the Duplicate buff may no longer be active when the damage is dealt,
      //and vice versa.
      this.externalDamage += calculateEffectiveDamage(event, DUPLICATE_EBON_MIGHT_MULTIPLIER);
    }
  }

  addReverberationsDamage(event: EmpowerEndEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.EBON_MIGHT_BUFF_PERSONAL.id)) {
      const reverbEvents = GetRelatedEvents<DamageEvent>(event, UPHEAVAL_REVERBERATION_DAM_LINK);

      reverbEvents.forEach((reverbEvent) => {
        this.personalDamage += calculateEffectiveDamage(
          reverbEvent,
          DUPLICATE_PERSONAL_DAMAGE_MULTIPLIER,
        );
      });
    }
  }

  statistic() {
    const buffUptime =
      this.selectedCombatant.getBuffUptime(SPELLS.DUPLICATE_SELF_BUFF.id) /
      this.owner.fightDuration;

    const damageSources = [
      {
        color: 'rgb(255, 255, 0)',
        label: 'Future Self damage',
        spellId: TALENTS_EVOKER.DUPLICATE_1_AUGMENTATION_TALENT.id,
        valueTooltip: formatNumber(this.petDamage),
        value: this.petDamage,
      },
      {
        color: 'rgb(129, 52, 5)',
        label: 'Personal damage',
        spellId: TALENTS_EVOKER.DUPLICATE_3_AUGMENTATION_TALENT.id,
        valueTooltip: formatNumber(this.personalDamage),
        value: this.personalDamage,
      },
      {
        color: 'rgb(212, 81, 19)',
        label: 'Ebon Might damage',
        spellId: SPELLS.EBON_MIGHT_BUFF_EXTERNAL.id,
        valueTooltip: formatNumber(this.externalDamage),
        value: this.externalDamage,
      },
    ];
    if (this.duplicateBuffsEbonMight) {
      return (
        <Statistic
          position={STATISTIC_ORDER.CORE(1)}
          size="flexible"
          category={STATISTIC_CATEGORY.TALENTS}
        >
          <TalentSpellText talent={TALENTS_EVOKER.DUPLICATE_1_AUGMENTATION_TALENT}>
            <div>
              <ItemDamageDone amount={this.petDamage + this.personalDamage + this.externalDamage} />
              <br />
              <InformationIcon /> {formatPercentage(buffUptime, 2)}%<small> Duplicate uptime</small>
            </div>
          </TalentSpellText>
          <div className="pad">
            <label>Damage sources</label>
            <DonutChart items={damageSources} />
          </div>
        </Statistic>
      );
    } else if (this.canExtendDuplicate) {
      return (
        <Statistic
          position={STATISTIC_ORDER.CORE(1)}
          size="flexible"
          category={STATISTIC_CATEGORY.TALENTS}
        >
          <TalentSpellText talent={TALENTS_EVOKER.DUPLICATE_1_AUGMENTATION_TALENT}>
            <div>
              <ItemDamageDone amount={this.petDamage} />
              <br />
              <InformationIcon /> {formatPercentage(buffUptime, 2)}%<small> Duplicate uptime</small>
            </div>
          </TalentSpellText>
        </Statistic>
      );
    } else {
      return (
        <Statistic
          position={STATISTIC_ORDER.CORE(1)}
          size="flexible"
          category={STATISTIC_CATEGORY.TALENTS}
        >
          <TalentSpellText talent={TALENTS_EVOKER.DUPLICATE_1_AUGMENTATION_TALENT}>
            <div>
              <ItemDamageDone amount={this.petDamage} />
            </div>
          </TalentSpellText>
        </Statistic>
      );
    }
  }
}

export default Duplicate;
