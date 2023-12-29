import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import {
  ACCRETION_CDR_MS,
  EMPOWER_EXTENSION_MS,
  SANDS_OF_TIME_CRIT_MOD,
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

/**
 * Eruption reduces the remaining cooldown of Upheaval by 1.0 sec.
 */
class Accretion extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    stats: StatTracker,
  };
  protected spellUsable!: SpellUsable;
  protected stats!: StatTracker;

  currentUpheaval = this.selectedCombatant.hasTalent(TALENTS.FONT_OF_MAGIC_AUGMENTATION_TALENT)
    ? SPELLS.UPHEAVAL_FONT
    : SPELLS.UPHEAVAL;

  totalEbonMightDamage: number = 0;
  totalEruptionCasts: number = 0;
  totalDamageDone: number = 0;
  totalShiftingSandsDamage: number = 0;
  totalShiftingSandsApplications: number = 0;
  totalUpheavelDamage: number = 0;
  totalUpheavelCasts: number = 0;
  effectiveUpheavelCDR: number = 0;
  ebonMightUpheavelExtention: number = 0;

  accretionEbonMight: number = 0;
  accretionShiftingSands: number = 0;
  accretionUpheavel: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.ACCRETION_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.ERUPTION_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(this.currentUpheaval),
      this.uphealvelCast,
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SHIFTING_SANDS_BUFF),
      this.onBuffApply,
    );
    this.addEventListener(Events.damage, this.onDamage);
    this.addEventListener(Events.fightend, this.calcAccretionValue);
  }

  onCast() {
    this.effectiveUpheavelCDR += this.spellUsable.reduceCooldown(
      this.currentUpheaval.id,
      ACCRETION_CDR_MS,
    );
    this.totalEruptionCasts += 1;
  }

  onBuffApply() {
    this.totalShiftingSandsApplications += 1;
  }

  uphealvelCast() {
    const critChance = this.stats.currentCritPercentage;
    const critMod = 1 + SANDS_OF_TIME_CRIT_MOD * critChance;
    if (this.selectedCombatant.hasBuff(SPELLS.EBON_MIGHT_BUFF_PERSONAL.id)) {
      this.ebonMightUpheavelExtention += EMPOWER_EXTENSION_MS * critMod;
    }
    this.totalUpheavelCasts += 1;
  }

  onDamage(event: DamageEvent) {
    if (event.ability.guid === SPELLS.UPHEAVAL_DAM.id) {
      this.totalUpheavelDamage += event.amount + (event.absorbed ?? 0);
    }
    if (event.ability.guid === TALENTS.EBON_MIGHT_TALENT.id) {
      this.totalEbonMightDamage += event.amount + (event.absorbed ?? 0);
    }
    if (event.ability.guid === SPELLS.SHIFTING_SANDS_BUFF.id) {
      this.totalShiftingSandsDamage += event.amount + (event.absorbed ?? 0);
    }
    this.totalDamageDone += event.amount + (event.absorbed ?? 0);
  }

  private calcAccretionValue() {
    const EbonMightUptime = this.selectedCombatant.getBuffUptime(
      SPELLS.EBON_MIGHT_BUFF_PERSONAL.id,
    );
    const additionalUpheavalCastsViaCdr = Math.floor(this.effectiveUpheavelCDR / (36 * 1000));

    const avgUpheavalCastDamage = this.totalUpheavelDamage / this.totalUpheavelCasts;

    this.accretionUpheavel = avgUpheavalCastDamage * additionalUpheavalCastsViaCdr;

    const avgShiftingSandsDamage =
      this.totalShiftingSandsDamage / this.totalShiftingSandsApplications;

    this.accretionShiftingSands = avgShiftingSandsDamage * additionalUpheavalCastsViaCdr;

    const cdrUpheavelExtention =
      (this.ebonMightUpheavelExtention / this.totalUpheavelCasts) * additionalUpheavalCastsViaCdr;

    this.accretionEbonMight = (this.totalEbonMightDamage / EbonMightUptime) * cdrUpheavelExtention;
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
        color: '#813405',
        label: 'Upheavel',
        spellId: SPELLS.UPHEAVAL.id,
        valueTooltip: formatNumber(this.accretionUpheavel),
        value: this.accretionUpheavel,
      },
      {
        color: 'rgb(212, 81, 19)',
        label: 'Ebon Might',
        spellId: SPELLS.EBON_MIGHT_BUFF_PERSONAL.id,
        valueTooltip: formatNumber(this.accretionEbonMight),
        value: this.accretionEbonMight,
      },
    ];
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            These values are averaged gain from extra casts of{' '}
            <SpellLink spell={TALENTS.UPHEAVAL_TALENT} />, based on your overall damage.
            <br />
            Realisticly these values can, and will, range more broadly in actual gameplay since when
            you get the extra casts off will matter a lot. eg. extra casts inside of{' '}
            <SpellLink spell={TALENTS.BREATH_OF_EONS_TALENT} /> , or alongside your allies big CDs
            for <SpellLink spell={SPELLS.SHIFTING_SANDS_BUFF} /> will increase the value provided.
            <br />
            This also doesn't take opportunity cost into account.
          </>
        }
      >
        {this.accretionShiftingSands + this.accretionEbonMight + this.accretionUpheavel > 0 ? (
          <div>
            <TalentSpellText talent={TALENTS.ACCRETION_TALENT}>
              <ItemDamageDone
                amount={
                  this.accretionShiftingSands + this.accretionEbonMight + this.accretionUpheavel
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
              <br />
              This is either caused by you not casting <SpellLink
                spell={TALENTS.ERUPTION_TALENT}
              />{' '}
              enough, or the fight being too short.
            </p>
          </div>
        )}
      </Statistic>
    );
  }
}

export default Accretion;
