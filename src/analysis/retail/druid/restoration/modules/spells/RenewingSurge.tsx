import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { Options } from 'parser/core/Module';
import { TALENTS_DRUID } from 'common/TALENTS';
import Events, { CastEvent } from 'parser/core/Events';
import SPELLS from 'common/SPELLS';
import { getDirectHeal } from 'analysis/retail/druid/restoration/normalizers/CastLinkNormalizer';
import { calculateHealTargetHealthPercent } from 'parser/core/EventCalculateLib';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { SpellIcon, SpellLink } from 'interface';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { formatPercentage } from 'common/format';
import TalentSpellText from 'parser/ui/TalentSpellText';

const MAX_CDR = 6_000; // 15 second cooldown * 40% CDR

/**
 * **Spring Blossoms**
 * Spec Talent Tier 6
 *
 * The cooldown of Swiftmend is reduced by up to 40%, based on the current health of the target.
 * Cooldown is reduced more when cast on a lower health target.
 */
export default class RenewingSurge extends Analyzer.withDependencies({ spellUsable: SpellUsable }) {
  /** Total times Swiftmend cast */
  totalCasts = 0;
  /** Total CDR applied */
  totalCdrMs = 0;
  /** Total health percent of Swiftmend targets (divide by total casts for average target health) */
  totalHealthPercent = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DRUID.RENEWING_SURGE_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.SWIFTMEND),
      this.onSwiftmendCast,
    );
  }

  onSwiftmendCast(event: CastEvent) {
    this.totalCasts += 1;

    let targetHealthPercent = undefined;
    const swiftmendHeal = getDirectHeal(event);
    if (swiftmendHeal) {
      targetHealthPercent = calculateHealTargetHealthPercent(swiftmendHeal);
      this.totalHealthPercent += targetHealthPercent;
      const missingHealth = 1 - targetHealthPercent;
      const cdr = MAX_CDR * missingHealth;
      this.totalCdrMs += cdr;
      this.deps.spellUsable.reduceCooldown(SPELLS.SWIFTMEND.id, cdr);
    }
  }

  get cdrPerCastString(): string {
    return this.totalCasts === 0
      ? 'N/A'
      : (this.totalCdrMs / this.totalCasts / 1000).toFixed(1) + 's';
  }

  get averageTargetHealthPercentString(): string {
    return this.totalCasts === 0
      ? 'N/A'
      : formatPercentage(this.totalHealthPercent / this.totalCasts, 0) + '%';
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL(6)} // number based on talent row
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <p>
              This is the cooldown reduction per <SpellLink spell={SPELLS.SWIFTMEND} /> cast,
              averaged over the entire encounter. The average health of your swiftmend targets was{' '}
              <strong>{this.averageTargetHealthPercentString}</strong>.
            </p>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_DRUID.RENEWING_SURGE_TALENT}>
          <>
            <SpellIcon spell={SPELLS.SWIFTMEND} /> {this.cdrPerCastString}{' '}
            <small>avg CDR per cast</small>
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}
