import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TIERS } from 'game/TIERS';
import Spell from 'common/SPELLS/Spell';
import Events, { RemoveBuffEvent } from 'parser/core/Events';
import { DamageEvent } from 'parser/core/Events';
import { effectiveDamage } from 'parser/shared/modules/DamageValue';
import SPELLS from 'common/SPELLS';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { DRUID_TWW3_ID } from 'common/ITEMS';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import Statistic from 'parser/ui/Statistic';
import ItemPercentDamageDone from 'parser/ui/ItemPercentDamageDone';
import { TALENTS_DRUID } from 'common/TALENTS';
import ItemSetLink from 'interface/ItemSetLink';
import { SpellLink } from 'interface';
import { formatPercentage } from 'common/format';
import { isDruidOfTheClaw } from 'analysis/retail/druid/shared/heroTree';
import {
  generatedPreparingToStrike,
  generatesRavage,
  isFromPts,
} from 'analysis/retail/druid/feral/normalizers/TWW3TierSetDotCRavageLinkNormalizer';

const RAVAGE_RAMPAGE_DOT_BOOST = 0.3;
const RAVAGE_RAMPAGE_DOT_BOOST_BUFFED_SPELLS: Spell[] = [
  SPELLS.THRASH_FERAL,
  SPELLS.THRASH_FERAL_BLEED,
  SPELLS.RIP,
  SPELLS.RAKE,
  SPELLS.RAKE_BLEED,
  TALENTS_DRUID.FERAL_FRENZY_TALENT,
  SPELLS.DREADFUL_WOUND,
];

/**
 * **Ornaments of the Mother Eagle**
 * Manaforge Omega (TWW S3) Tier Set - Druid of the Claw version
 *
 * 2pc - Ravage increases your haste by 10%, chance to critically strike by 10%, and the damage your bleeds deal by 30% for 5 sec.
 *
 * 4pc - Ravage has a 40% chance to make you Ravage your target again 4 sec later at 100% of the initial power.
 */
export default class TWW3TierSetDotC extends Analyzer {
  has4pc: boolean;

  bleedBoostDamage = 0;
  ravageProcDamage = 0;

  /** total number of times Ravage used (hardcast or from Convoke) */
  ravageUses = 0;
  /** total number of Ravage uses when PTS buff already active (unable to generate another) */
  ravageUsesWithPts = 0;
  /** total number of PTS procs generated */
  PtsProcs = 0;
  /** total number of PTS procs that 'missed' (did not generate a Ravage due to bad target, no range, etc) */
  PtsMisses = 0;

  constructor(options: Options) {
    super(options);

    this.active =
      this.selectedCombatant.has2PieceByTier(TIERS.TWW3) &&
      isDruidOfTheClaw(this.selectedCombatant);
    this.has4pc = this.selectedCombatant.has4PieceByTier(TIERS.TWW3);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(RAVAGE_RAMPAGE_DOT_BOOST_BUFFED_SPELLS),
      this.onBleedDamage,
    );

    if (this.has4pc) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.RAVAGE_DOTC_CAT),
        this.onRavageDamage,
      );
      this.addEventListener(
        Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RAVAGE_BUFF_CAT),
        this.onUseRavage,
      );
      this.addEventListener(
        Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.PREPARING_TO_STRIKE),
        this.onPtsExpire,
      );
    }
  }

  private onBleedDamage(event: DamageEvent) {
    if (this.selectedCombatant.hasBuff(SPELLS.RAVAGE_RAMPAGE)) {
      this.bleedBoostDamage += calculateEffectiveDamage(event, RAVAGE_RAMPAGE_DOT_BOOST);
    }
  }

  private onRavageDamage(event: DamageEvent) {
    if (isFromPts(event)) {
      this.ravageProcDamage += effectiveDamage(event);
    }
  }

  private onUseRavage(event: RemoveBuffEvent) {
    this.ravageUses += 1;
    const generatedPts = generatedPreparingToStrike(event);
    if (generatedPts) {
      this.PtsProcs += 1;
    } else if (this.selectedCombatant.hasBuff(SPELLS.PREPARING_TO_STRIKE)) {
      this.ravageUsesWithPts += 1;
    }
  }

  private onPtsExpire(event: RemoveBuffEvent) {
    if (!generatesRavage(event)) {
      this.PtsMisses += 1;
    }
  }

  get observedProcRateString() {
    const validUses = this.ravageUses - this.ravageUsesWithPts;
    if (validUses <= 0) {
      return 'N/A';
    } else {
      return formatPercentage(this.PtsProcs / validUses, 0) + '%';
    }
  }

  get effectiveProcRateString() {
    if (this.ravageUses <= 0) {
      return 'N/A';
    } else {
      return formatPercentage((this.PtsProcs - this.PtsMisses) / this.ravageUses, 0) + '%';
    }
  }

  get ravageRampageUptimePercent() {
    return this.selectedCombatant.getBuffUptime(SPELLS.RAVAGE_RAMPAGE) / this.owner.fightDuration;
  }

  statistic() {
    return (
      <Statistic
        wide
        position={STATISTIC_ORDER.OPTIONAL(0)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            {this.has4pc ? (
              <>
                Conversion statistics for the 4pc Ravage proc:
                <ul>
                  <li>
                    <SpellLink spell={SPELLS.RAVAGE_DOTC_CAT} /> uses:{' '}
                    <strong>{this.ravageUses}</strong>
                    {this.ravageUsesWithPts > 0 && (
                      <>
                        <br />
                        <small>
                          (<strong>{this.ravageUsesWithPts}</strong> w/{' '}
                          <SpellLink spell={SPELLS.PREPARING_TO_STRIKE} /> already active)
                        </small>
                      </>
                    )}
                  </li>
                  <li>
                    <SpellLink spell={SPELLS.PREPARING_TO_STRIKE} /> procs:{' '}
                    <strong>{this.PtsProcs}</strong>
                    {this.PtsMisses > 0 && (
                      <>
                        <br />
                        <small>
                          (<strong>{this.PtsMisses}</strong> missed due to range or invalid target)
                        </small>
                      </>
                    )}
                  </li>
                  <li>
                    Observed Proc Rate: <strong>{this.observedProcRateString}</strong>
                    <br />
                    <small>
                      This is the rate of <SpellLink spell={SPELLS.PREPARING_TO_STRIKE} /> buffs
                      gained per <SpellLink spell={SPELLS.RAVAGE_DOTC_CAT} /> where a proc was
                      possible (didn't already have PTS). Expected value for this rate is{' '}
                      <strong>40%</strong>
                    </small>
                  </li>
                  <li>
                    Effective Proc Rate: <strong>{this.effectiveProcRateString}</strong>
                    <br />
                    <small>
                      This is the rate of <SpellLink spell={SPELLS.RAVAGE_DOTC_CAT} /> uses that
                      actually converted into an additonal hit.
                    </small>
                  </li>
                </ul>
              </>
            ) : (
              <>
                Conversion statistics for the 4pc Ravage proc would go here... IF YOU HAD IT. Use
                that catalyst bro.
              </>
            )}
          </>
        }
      >
        <div className="pad boring-text">
          <label>
            <ItemSetLink id={DRUID_TWW3_ID}>
              <>
                Ornaments of the Mother Eagle
                <br />
                (TWW S3 Set)
              </>
            </ItemSetLink>
          </label>
          <div className="value">
            Buff Uptime: {formatPercentage(this.ravageRampageUptimePercent, 0)}%
            <br />
            Bleed Boost: <ItemPercentDamageDone amount={this.bleedBoostDamage} />
            {this.has4pc ? (
              <>
                <br />
                Ravage Procs: <ItemPercentDamageDone amount={this.ravageProcDamage} />
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
      </Statistic>
    );
  }
}
