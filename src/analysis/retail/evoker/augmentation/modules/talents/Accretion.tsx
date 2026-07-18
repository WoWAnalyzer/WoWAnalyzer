import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import {
  ACCRETION_CDR_MS,
  DUPLICATE_EBON_MIGHT_MULTIPLIER,
  EMPOWER_EXTENSION_MS,
  SANDS_OF_TIME_CRIT_MOD,
  MID2_AUGMENTATION_4PC_DAMAGE_MULTIPLIER,
} from 'analysis/retail/evoker/augmentation/constants';
import StatTracker from 'parser/shared/modules/StatTracker';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import { formatNumber } from 'common/format';
import { SpellLink } from 'interface';
import DonutChart from 'parser/ui/DonutChart';
import {
  getChronoFlameDamageLink,
  isFromAfterimageDamage,
} from 'analysis/retail/evoker/shared/modules/normalizers/ChronowardenCastLinkNormalizer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { getMassEruptionTargetCount, isFromMassEruption } from '../normalizers/CastLinkNormalizer';
import {
  CONCENTRATED_POWER_EXTRA_TARGETS,
  MASS_DISINTEGRATE_TARGETS,
} from 'analysis/retail/evoker/shared/constants';
import { TIERS } from 'game/TIERS';

/**
 * Eruption reduces the remaining cooldown of Upheaval by 1.0 sec.
 * To-do: Fix Mass Eruption so Concentrated Power doesn't have to be checked;
 * add Overlord (requires castlink).
 */
class Accretion extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    stats: StatTracker,
  };
  protected spellUsable!: SpellUsable;
  protected stats!: StatTracker;
  maxTargets = MASS_DISINTEGRATE_TARGETS;

  currentUpheaval = this.selectedCombatant.hasTalent(TALENTS.FONT_OF_MAGIC_AUGMENTATION_TALENT)
    ? SPELLS.UPHEAVAL_FONT
    : SPELLS.UPHEAVAL;

  duplicateExtensionMod =
    this.selectedCombatant.getTalentRank(TALENTS.DUPLICATE_2_AUGMENTATION_TALENT) / 2;

  totalEbonMightDamage = 0;
  totalShiftingSandsDamage = 0;
  totalShiftingSandsApplications = 0;
  totalAfterimageDamage = 0;
  totalEmpowerCasts = 0;
  totalUpheavalDamage = 0;
  totalUpheavalCasts = 0;
  effectiveUpheavalCDR = 0;
  ebonMightUpheavalExtension = 0;
  totalDuplicateDamage = 0;
  duplicateUpheavalExtension = 0;
  totalFateMirrorDamage = 0;

  accretionEbonMight = 0;
  accretionShiftingSands = 0;
  accretionAfterimage = 0;
  accretionUpheaval = 0;
  accretionDuplicate = 0;
  accretionFateMirror = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ACCRETION_TALENT);

    if (this.selectedCombatant.hasTalent(TALENTS.CONCENTRATED_POWER_TALENT)) {
      this.maxTargets += CONCENTRATED_POWER_EXTRA_TARGETS;
    }
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ERUPTION_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(this.currentUpheaval),
      this.upheavalCast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SHIFTING_SANDS_BUFF),
      this.onBuffApply,
    );
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER_PET)
        .spell([SPELLS.DUPLICATE_ERUPTION, SPELLS.DUPLICATE_FIRE_BREATH, SPELLS.UPHEAVAL_DAM]),
      this.onDuplicateDamage,
    );
    this.addEventListener(
      Events.damage.spell([
        SPELLS.UPHEAVAL_DAM,
        SPELLS.UPHEAVAL_DOT,
        SPELLS.SHIFTING_SANDS_BUFF,
        SPELLS.LIVING_FLAME_DAMAGE,
      ]),
      this.onDamage,
    );
    if (this.selectedCombatant.hasTalent(TALENTS.DUPLICATE_3_AUGMENTATION_TALENT)) {
      this.addEventListener(Events.damage.spell(TALENTS.EBON_MIGHT_TALENT), this.onEbonDamageDupe);
    } else {
      this.addEventListener(
        Events.damage.spell(TALENTS.EBON_MIGHT_TALENT),
        this.onEbonDamageNoDupe,
      );
    }
    if (this.selectedCombatant.has4PieceByTier(TIERS.MID2)) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FATE_MIRROR_DAMAGE),
        this.onFateMirrorDamage,
      );
    }
    this.addEventListener(Events.empowerEnd.by(SELECTED_PLAYER), this.onEmpowerCast);
    this.addEventListener(Events.fightend, this.calcAccretionValue);
  }

  onCast(event: CastEvent) {
    let eruptionCount = 1;
    if (isFromMassEruption(event)) {
      eruptionCount = getMassEruptionTargetCount(event, this.maxTargets);
    }
    this.effectiveUpheavalCDR += this.spellUsable.reduceCooldown(
      this.currentUpheaval.id,
      ACCRETION_CDR_MS * eruptionCount,
    );
  }

  onBuffApply() {
    this.totalShiftingSandsApplications += 1;
  }

  upheavalCast() {
    const critChance = this.stats.currentCritPercentage;
    const critMod = 1 + SANDS_OF_TIME_CRIT_MOD * critChance;
    if (this.selectedCombatant.hasBuff(SPELLS.EBON_MIGHT_BUFF_PERSONAL.id)) {
      this.ebonMightUpheavalExtension += EMPOWER_EXTENSION_MS * critMod;
    }
    if (this.selectedCombatant.hasBuff(SPELLS.DUPLICATE_SELF_BUFF.id)) {
      this.duplicateUpheavalExtension +=
        EMPOWER_EXTENSION_MS * critMod * this.duplicateExtensionMod;
    }
    this.totalUpheavalCasts += 1;
  }

  onEmpowerCast() {
    this.totalEmpowerCasts += 1;
  }

  onDuplicateDamage(event: DamageEvent) {
    this.totalDuplicateDamage += event.amount + (event.absorbed ?? 0);
  }

  onEbonDamageNoDupe(event: DamageEvent) {
    this.totalEbonMightDamage += event.amount + (event.absorbed ?? 0);
  }

  onEbonDamageDupe(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.DUPLICATE_SELF_BUFF.id)) {
      const dupeDamageAmount = calculateEffectiveDamage(event, DUPLICATE_EBON_MIGHT_MULTIPLIER);
      this.totalDuplicateDamage += dupeDamageAmount;
      this.totalEbonMightDamage += event.amount - dupeDamageAmount;
    } else {
      this.totalEbonMightDamage += event.amount + (event.absorbed ?? 0);
    }
  }

  onFateMirrorDamage(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.MAGNIFIED_FATE_BUFF.id)) {
      const playerId = event.supportID ? event.supportID : event.sourceID;
      if (
        playerId === this.selectedCombatant.id &&
        !this.selectedCombatant.hasOwnBuff(SPELLS.PRESCIENCE_BUFF.id)
      ) {
        // This damage belongs to another Aug, ignore it
        return;
      }

      this.totalFateMirrorDamage += calculateEffectiveDamage(
        event,
        MID2_AUGMENTATION_4PC_DAMAGE_MULTIPLIER,
      );
    }
  }

  onDamage(event: DamageEvent) {
    if (
      event.ability.guid === SPELLS.UPHEAVAL_DAM.id ||
      event.ability.guid === SPELLS.UPHEAVAL_DOT.id
    ) {
      this.totalUpheavalDamage += event.amount + (event.absorbed ?? 0);
    }
    if (event.ability.guid === SPELLS.SHIFTING_SANDS_BUFF.id) {
      this.totalShiftingSandsDamage += event.amount + (event.absorbed ?? 0);
    }
    if (event.ability.guid === SPELLS.LIVING_FLAME_DAMAGE.id && isFromAfterimageDamage(event)) {
      this.totalAfterimageDamage += event.amount + (event.absorbed ?? 0);
      this.totalAfterimageDamage += getChronoFlameDamageLink(event)?.amount ?? 0;
    }
  }

  private calcAccretionValue() {
    const EbonMightUptime = this.selectedCombatant.getBuffUptime(
      SPELLS.EBON_MIGHT_BUFF_PERSONAL.id,
    );
    const DuplicateUptime = this.selectedCombatant.getBuffUptime(SPELLS.DUPLICATE_SELF_BUFF.id);
    const additionalUpheavalCastsViaCdr = Math.floor(this.effectiveUpheavalCDR / (36 * 1000));

    const avgUpheavalCastDamage = this.totalUpheavalDamage / this.totalUpheavalCasts;

    this.accretionUpheaval = avgUpheavalCastDamage * additionalUpheavalCastsViaCdr;

    const avgShiftingSandsDamage =
      this.totalShiftingSandsDamage / this.totalShiftingSandsApplications;

    this.accretionShiftingSands = avgShiftingSandsDamage * additionalUpheavalCastsViaCdr;

    const avgAfterimageDamage = this.totalAfterimageDamage / this.totalEmpowerCasts;

    this.accretionAfterimage = avgAfterimageDamage * additionalUpheavalCastsViaCdr;

    const avgFateMirrorDamage = this.totalFateMirrorDamage / this.totalUpheavalCasts;

    this.accretionFateMirror = avgFateMirrorDamage * additionalUpheavalCastsViaCdr;

    const cdrUpheavalExtension =
      (this.ebonMightUpheavalExtension / this.totalUpheavalCasts) * additionalUpheavalCastsViaCdr;

    this.accretionEbonMight = (this.totalEbonMightDamage / EbonMightUptime) * cdrUpheavalExtension;

    this.accretionDuplicate = (this.totalDuplicateDamage / DuplicateUptime) * cdrUpheavalExtension;
  }

  statistic() {
    const damageSources = [
      {
        color: 'rgb(255, 255, 0)',
        label: 'Shifting Sands',
        spellId: SPELLS.SHIFTING_SANDS_BUFF.id,
        valueTooltip: formatNumber(this.accretionShiftingSands),
        value: this.accretionShiftingSands,
      },
      {
        color: 'rgb(129, 52, 5)',
        label: 'Upheaval',
        spellId: SPELLS.UPHEAVAL.id,
        valueTooltip: formatNumber(this.accretionUpheaval),
        value: this.accretionUpheaval,
      },
      {
        color: 'rgb(212, 81, 19)',
        label: 'Ebon Might',
        spellId: SPELLS.EBON_MIGHT_BUFF_EXTERNAL.id,
        valueTooltip: formatNumber(this.accretionEbonMight),
        value: this.accretionEbonMight,
      },
    ];
    if (this.selectedCombatant.hasTalent(TALENTS.AFTERIMAGE_TALENT)) {
      damageSources.push({
        color: 'rgb(255, 0, 0)',
        label: 'Afterimage',
        spellId: TALENTS.AFTERIMAGE_TALENT.id,
        valueTooltip: formatNumber(this.accretionAfterimage),
        value: this.accretionAfterimage,
      });
    }
    if (this.selectedCombatant.hasTalent(TALENTS.DUPLICATE_1_AUGMENTATION_TALENT)) {
      damageSources.push({
        color: 'rgb(200, 200, 0)',
        label: 'Duplicate',
        spellId: TALENTS.DUPLICATE_1_AUGMENTATION_TALENT.id,
        valueTooltip: formatNumber(this.accretionDuplicate),
        value: this.accretionDuplicate,
      });
    }
    if (this.selectedCombatant.has4PieceByTier(TIERS.MID2)) {
      damageSources.push({
        color: 'rgb(255, 255, 128)',
        label: 'Fate Mirror (Tier)',
        spellId: SPELLS.MAGNIFIED_FATE_BUFF.id,
        valueTooltip: formatNumber(this.accretionFateMirror),
        value: this.accretionFateMirror,
      });
    }
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <p>
              These values are averaged gain from extra casts of{' '}
              <SpellLink spell={TALENTS.UPHEAVAL_TALENT} />, based on your overall damage.
            </p>
            <p>
              Realistically these values can, and will, range more broadly in actual gameplay since
              when you get the extra casts off will matter a lot. eg. extra casts inside of{' '}
              <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} /> , or alongside your allies big CDs
              for <SpellLink spell={SPELLS.SHIFTING_SANDS_BUFF} /> will increase the value provided.
            </p>
            <p>This also doesn't take opportunity cost into account.</p>
          </>
        }
      >
        {this.accretionShiftingSands + this.accretionEbonMight + this.accretionUpheaval > 0 ? (
          <div>
            <TalentSpellText talent={TALENTS.ACCRETION_TALENT}>
              <ItemDamageDone
                amount={
                  this.accretionShiftingSands + this.accretionEbonMight + this.accretionUpheaval
                }
              />
            </TalentSpellText>
            <div className="pad">
              <label>Damage sources</label>
              <DonutChart items={damageSources} />
            </div>
          </div>
        ) : (
          <div className="pad">
            <label>
              <SpellLink spell={TALENTS.ACCRETION_TALENT} />
            </label>
            <p>
              You didn't gain enough CDR to get any extra casts of{' '}
              <SpellLink spell={TALENTS.UPHEAVAL_TALENT} />.
            </p>
            <p>
              This is either caused by you not casting <SpellLink spell={TALENTS.ERUPTION_TALENT} />{' '}
              enough, or the fight being too short.
            </p>
          </div>
        )}
      </Statistic>
    );
  }
}

export default Accretion;
