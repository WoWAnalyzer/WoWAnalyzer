import type { JSX } from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  DamageEvent,
  RemoveBuffEvent,
  GetRelatedEvent,
  GetRelatedEvents,
} from 'parser/core/Events';
import TALENTS from 'common/TALENTS/hunter';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import SpellLink from 'interface/SpellLink';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { PerfectColor, BadColor } from 'interface/guide';
import {
  BOAR_TO_HOGSTRIDER_DAMAGE,
  BOAR_TO_KILL_COMMAND,
} from '../normalizers/HunterEventLinkNormalizers';

/* Howl of the Pack Leader spawns a Hogstrider boar that charges through the target.
 * Boar can hit walls, and miss due to the Z-axis so the only pass/fail is did it hit anything
 */

export default class HowlBoar extends Analyzer {
  private totalCharges = 0;
  private totalDamage = 0;
  private totalTargetsHit = 0;
  private useEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.HOWL_OF_THE_PACK_LEADER_TALENT);
    if (!this.active) {
      return;
    }

    // Howl of the Pack Leader is 4 spell IDs. The only one we care about is when
    // boar is removed as it can miss entirely and it does significant damage so
    // missing the boar is a critical oopsie.
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.HOWL_OF_THE_PACKLEADER_BOAR),
      this.onBoarConsumed,
    );
  }

  private onBoarConsumed = (event: RemoveBuffEvent) => {
    const damages = GetRelatedEvents<DamageEvent>(event, BOAR_TO_HOGSTRIDER_DAMAGE);
    // Kill command spawns it, it's aoe so get the target from what you KC'd
    const killCommand = GetRelatedEvent<CastEvent>(event, BOAR_TO_KILL_COMMAND);

    const targetsHit = new Set(damages.map((d) => d.targetID)).size;
    const chargeDamage = damages.reduce((sum, d) => sum + d.amount + (d.absorbed ?? 0), 0);

    this.totalCharges += 1;
    this.totalDamage += chargeDamage;
    this.totalTargetsHit += targetsHit;

    const targetName = killCommand ? this.owner.getTargetName(killCommand) : undefined;
    const primaryHit = damages.find((d) => d.ability.guid === SPELLS.PL_HOGSTRIDER_DAMAGE_2.id);
    const targetHpPercent =
      primaryHit?.hitPoints !== undefined && primaryHit?.maxHitPoints
        ? Math.round((primaryHit.hitPoints / primaryHit.maxHitPoints) * 100)
        : undefined;

    const perf = chargeDamage > 0 ? QualitativePerformance.Perfect : QualitativePerformance.Fail;
    const color = chargeDamage > 0 ? PerfectColor : BadColor;
    const header = chargeDamage > 0 ? 'Hit' : 'Hogstrider failed to hit any targets!';

    const tooltip = (
      <div>
        <h5 style={{ color }}>{header}</h5>
        <strong>{this.owner.formatTimestamp(event.timestamp)}</strong>
        {targetName && (
          <>
            {' '}
            targeting <strong>{targetName}</strong>
            {targetHpPercent !== undefined && (
              <>
                {' '}
                at <strong>{targetHpPercent}%</strong> HP
              </>
            )}
          </>
        )}
        <div>
          <strong>{targetsHit}</strong> targets hit{' '}
          <small>({formatNumber(chargeDamage)} damage)</small>
        </div>
        <div>
          <strong>Total Damage:</strong> {formatNumber(chargeDamage)}
        </div>
      </div>
    );

    this.useEntries.push({ value: perf, tooltip });
  };

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={SPELLS.PL_HOGSTRIDER_DAMAGE_1}>
          <>
            <ItemDamageDone amount={this.totalDamage} />
            <div>
              <strong>Charges:</strong> {this.totalCharges}
            </div>
            <div>
              <strong>Total targets hit:</strong> {this.totalTargetsHit}
            </div>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <strong>
          <SpellLink spell={SPELLS.PL_HOGSTRIDER_DAMAGE_1} />
        </strong>{' '}
        charges through, dealing damage to all enemies around your target.
      </p>
    );

    const data = (
      <CastSummaryAndBreakdown
        spell={SPELLS.PL_HOGSTRIDER_DAMAGE_1}
        castEntries={this.useEntries}
        usesInsteadOfCasts
      />
    );

    return explanationAndDataSubsection(explanation, data);
  }
}
