import type { JSX } from 'react';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, GetRelatedEvents } from 'parser/core/Events';
import TALENTS from 'common/TALENTS/hunter';
import SPELLS from 'common/SPELLS';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import SpellLink from 'interface/SpellLink';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import CastSummaryAndBreakdown from 'interface/guide/components/CastSummaryAndBreakdown';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import { BadColor, GoodColor, OkColor } from 'interface/guide';
import {
  TRIGGER_TO_CHAKRAM_CAST,
  CHAKRAM_CAST_TO_DAMAGE,
} from '../normalizers/MoonlightChakramNormalizer';

const STALK_AND_STRIKE_CDR = 10000;
const STALK_AND_STRIKE_WASTE_THRESHOLD = 3000;

export default class MoonlightChakram extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  private totalDamage = 0;
  private chakramCasts = 0;
  private missedCasts = 0;
  private totalWildfireBombCdr = 0;
  private totalWildfireBombCdrWasted = 0;
  private useEntries: BoxRowEntry[] = [];
  private isSurvival = false;
  private hasStalkAndStrike = false;
  private lastTriggerTarget = 'unknown';

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.MOONLIGHT_CHAKRAM_TALENT);
    if (!this.active) {
      return;
    }

    //Survival gets bomb CDR, MM gets Lock and Load buff
    this.isSurvival = this.selectedCombatant.hasTalent(TALENTS.RAPTOR_STRIKE_TALENT);
    this.hasStalkAndStrike = this.selectedCombatant.hasTalent(TALENTS.STALK_AND_STRIKE_TALENT);

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([TALENTS.TRUESHOT_TALENT, SPELLS.TAKEDOWN_PLAYER]),
      this.onTriggerCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.MOONLIGHT_CHAKRAM_CAST),
      this.onChakramCast,
    );
  }

  /** Handles missed Chakram windows — when Trueshot/Takedown fires but no Chakram follows */
  private onTriggerCast(event: CastEvent) {
    this.lastTriggerTarget = this.owner.getTargetName(event) || 'unknown';
    const chakramCast = GetRelatedEvents(event, TRIGGER_TO_CHAKRAM_CAST)[0] as
      | CastEvent
      | undefined;
    if (!chakramCast) {
      this.missedCasts += 1;
      this.useEntries.push({
        value: QualitativePerformance.Fail,
        tooltip: (
          <>
            <h5 style={{ color: BadColor }}>
              FAIL: No <SpellLink spell={SPELLS.MOONLIGHT_CHAKRAM_CAST} /> cast
            </h5>
            <p>
              Target: <strong>{this.lastTriggerTarget}</strong>
            </p>
            <p>
              @ <strong>{this.owner.formatTimestamp(event.timestamp)}</strong>
            </p>
          </>
        ),
      });
    }
  }

  /** Handles Chakram casts — SpellUsable state is accurate here for CDR checks */
  private onChakramCast(event: CastEvent) {
    this.chakramCasts += 1;

    const targetName = this.owner.getTargetName(event) || this.lastTriggerTarget;

    //Currently hits 16 times, but will only hit for 7 at level 90 with the extra hero talents
    // So analysis is a little weird. The important bit is did they even cast the ability or did they forget
    const damageEvents = (GetRelatedEvents(event, CHAKRAM_CAST_TO_DAMAGE) as DamageEvent[]) || [];
    const damage = damageEvents.reduce((sum, dmg) => sum + dmg.amount + (dmg.absorbed || 0), 0);
    const hits = damageEvents.length;

    this.totalDamage += damage;

    let performance = QualitativePerformance.Good;
    let wastedCDR = 0;
    let wastedLockAndLoad = false;

    if (hits < 4) {
      performance = QualitativePerformance.Fail;
    } else if (hits < 7) {
      performance = QualitativePerformance.Ok;
    }

    if (this.hasStalkAndStrike) {
      if (this.isSurvival) {
        // event.timestamp is the Chakram cast time — SpellUsable state is correct here
        const cdRemaining = this.spellUsable.cooldownRemaining(TALENTS.WILDFIRE_BOMB_TALENT.id);
        if (cdRemaining <= STALK_AND_STRIKE_CDR) {
          wastedCDR = STALK_AND_STRIKE_CDR - cdRemaining;
          if (wastedCDR > STALK_AND_STRIKE_WASTE_THRESHOLD) {
            performance = QualitativePerformance.Fail;
          }
        }
        this.totalWildfireBombCdrWasted += wastedCDR;
        this.totalWildfireBombCdr += STALK_AND_STRIKE_CDR - wastedCDR;
      } else {
        wastedLockAndLoad = this.selectedCombatant.hasBuff(
          SPELLS.LOCK_AND_LOAD_BUFF.id,
          event.timestamp,
        );
        if (wastedLockAndLoad) {
          performance = QualitativePerformance.Fail;
        }
      }
    }

    // Build tooltip
    const color =
      performance === QualitativePerformance.Good
        ? GoodColor
        : performance === QualitativePerformance.Ok
          ? OkColor
          : BadColor;
    const perfLabel =
      performance === QualitativePerformance.Good
        ? 'GOOD'
        : performance === QualitativePerformance.Ok
          ? 'OK'
          : 'BAD';

    this.useEntries.push({
      value: performance,
      tooltip: (
        <>
          <h5 style={{ color }}>{perfLabel}</h5>
          <p>
            Damage: <strong>{damage.toLocaleString()}</strong> ({hits} {hits === 1 ? 'hit' : 'hits'}
            )
          </p>
          <p>
            Target: <strong>{targetName}</strong>
          </p>
          {this.hasStalkAndStrike && this.isSurvival && wastedCDR > 0 && (
            <p>
              {wastedCDR > STALK_AND_STRIKE_WASTE_THRESHOLD ? 'BAD: ' : ''}Wasted{' '}
              {(wastedCDR / 1000).toFixed(1)}s Wildfire Bomb CDR
            </p>
          )}
          {this.hasStalkAndStrike && !this.isSurvival && wastedLockAndLoad && (
            <p>BAD: Wasted Lock and Load buff</p>
          )}
          @ <strong>{this.owner.formatTimestamp(event.timestamp)}</strong>
        </>
      ),
    });
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <div>
        <p>
          <strong>
            <SpellLink spell={TALENTS.MOONLIGHT_CHAKRAM_TALENT} />
          </strong>{' '}
          should be cast within 15 seconds of becoming available.
        </p>
        <p>
          {this.hasStalkAndStrike && this.isSurvival && (
            <>
              {' '}
              With <SpellLink spell={TALENTS.STALK_AND_STRIKE_TALENT} />, ensure you don't waste{' '}
              <SpellLink spell={TALENTS.WILDFIRE_BOMB_TALENT} /> cooldown reduction.
            </>
          )}
          {this.hasStalkAndStrike && !this.isSurvival && (
            <>
              {' '}
              With <SpellLink spell={TALENTS.STALK_AND_STRIKE_TALENT} />, avoid casting when you
              already have <SpellLink spell={SPELLS.LOCK_AND_LOAD_BUFF} /> active to prevent wasting
              the buff.
            </>
          )}
        </p>
      </div>
    );

    const data = (
      <CastSummaryAndBreakdown
        spell={TALENTS.MOONLIGHT_CHAKRAM_TALENT}
        castEntries={this.useEntries}
        usesInsteadOfCasts
      />
    );

    return explanationAndDataSubsection(explanation, data);
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.MOONLIGHT_CHAKRAM_TALENT}>
          <ItemDamageDone amount={this.totalDamage} />
          {this.hasStalkAndStrike && this.isSurvival && this.chakramCasts > 0 && (
            <>
              <div>
                {(this.totalWildfireBombCdr / 1000).toFixed(1)}s{' '}
                <small>Wildfire Bomb CDR gained</small>
              </div>
              {this.totalWildfireBombCdrWasted > 0 && (
                <div>
                  {(this.totalWildfireBombCdrWasted / 1000).toFixed(1)}s{' '}
                  <small>Wildfire Bomb CDR wasted</small>
                </div>
              )}
            </>
          )}
          {this.missedCasts > 0 && (
            <div style={{ color: BadColor }}>
              {this.missedCasts} <small>missed {this.missedCasts === 1 ? 'cast' : 'casts'}</small>
            </div>
          )}
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
