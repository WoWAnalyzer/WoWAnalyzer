import { PerformanceMark } from 'interface/guide';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import SPELLS from '../../../spell-list_Monk_Brewmaster.retail';
import Events, {
  AbilityEvent,
  DamageEvent,
  DeathEvent,
  EventType,
  SummonEvent,
} from 'parser/core/Events';
import SPELLS_COMMON from 'common/SPELLS';
import { CooldownExpandableItem } from 'interface/guide/components/CooldownExpandable';
import SpellLink from 'interface/SpellLink';
import {
  evaluateQualitativePerformanceByThreshold,
  QualitativePerformance,
} from 'parser/ui/QualitativePerformance';
import { TooltipElement } from 'interface/Tooltip';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { formatDuration, formatDurationMillisMinSec } from 'common/format';

/**
 * @internal
 */
export interface NiuzaoCast {
  summonEvent: SummonEvent;
  deathEvent?: DeathEvent;
  stompCount: number;
  wotwTriggers: AbilityEvent<EventType>[];
  /**
   * The number of BoF/DFB instances that could have triggered WotW but didn't.
   */
  wotwClipCount: number;
  cooldowns: Map<number, number>;
}

const EXPECTED_STOMP_COUNT = 6;
const WOTW_ICD_MS = 1000;

export default class InvokeNiuzao extends Analyzer.withDependencies({ spellUsable: SpellUsable }) {
  private hasWotW = this.selectedCombatant.hasTalent(SPELLS.WISDOM_OF_THE_WALL_TALENT);

  private lastWotWTrigger?: AbilityEvent<EventType>;

  readonly niuzaoCasts: NiuzaoCast[] = [];

  private get currentCast() {
    const cast = this.niuzaoCasts.at(-1);
    if (cast && !cast.deathEvent) {
      return cast;
    }

    return undefined;
  }

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(SPELLS.INVOKE_NIUZAO_THE_BLACK_OX_TALENT);

    this.addEventListener(
      Events.summon.by(SELECTED_PLAYER).spell(SPELLS.INVOKE_NIUZAO_THE_BLACK_OX_TALENT),
      this.onSummon,
    );
    // there is no stomp cast, so we look for BoK casts
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.BLACKOUT_KICK),
      this.onStomp,
    );
    this.addEventListener(Events.death.to(SELECTED_PLAYER_PET), this.onDeath);

    if (this.hasWotW) {
      this.addEventListener(
        Events.damage
          .by(SELECTED_PLAYER)
          .spell([SPELLS.BREATH_OF_FIRE_TALENT, SPELLS_COMMON.DRAGONFIRE_BREW_DAMAGE]),
        this.triggerWotW,
      );
    }
  }

  private triggerWotW(event: DamageEvent): void {
    if (
      !this.selectedCombatant.hasBuff(SPELLS.INVOKE_NIUZAO_THE_BLACK_OX_TALENT) ||
      !this.currentCast
    ) {
      return; // WotW only triggers during Invoke Niuzao
    }

    if (this.lastWotWTrigger && event.timestamp - this.lastWotWTrigger.timestamp < WOTW_ICD_MS) {
      if (
        event.timestamp - this.lastWotWTrigger.timestamp > 100 ||
        event.ability.guid !== this.lastWotWTrigger.ability.guid
      ) {
        // treat this as a distinct potential trigger and count it as a clip
        this.currentCast.wotwClipCount += 1;
      }

      return;
    } else {
      this.lastWotWTrigger = event;
    }

    this.currentCast.wotwTriggers.push(event);
  }

  private onSummon(event: SummonEvent) {
    const cooldowns = new Map();

    cooldowns.set(
      SPELLS.BLACKOUT_KICK.id,
      this.deps.spellUsable.cooldownRemaining(SPELLS.BLACKOUT_KICK.id),
    );
    cooldowns.set(
      SPELLS.BREATH_OF_FIRE_TALENT.id,
      this.deps.spellUsable.fractionalChargesAvailable(SPELLS.BREATH_OF_FIRE_TALENT.id),
    );
    cooldowns.set(
      SPELLS.KEG_SMASH_TALENT.id,
      this.deps.spellUsable.fractionalChargesAvailable(SPELLS.KEG_SMASH_TALENT.id),
    );

    this.niuzaoCasts.push({
      summonEvent: event,
      stompCount: 0,
      wotwTriggers: [],
      wotwClipCount: 0,
      cooldowns,
    });
  }

  private onDeath(event: DeathEvent) {
    if (!this.currentCast) {
      return;
    }

    if (event.targetID === this.currentCast.summonEvent.targetID) {
      this.currentCast.deathEvent = event;
    }
  }

  private onStomp() {
    if (!this.currentCast) {
      return;
    }

    this.currentCast.stompCount += 1;
  }

  checklist(cast: NiuzaoCast) {
    const items: CooldownExpandableItem[] = [];

    const extraBokCasts = this.selectedCombatant.hasTalent(SPELLS.FLUIDITY_OF_MOTION_TALENT)
      ? 2
      : 0;

    const initialBoKCooldown = cast.cooldowns.get(SPELLS.BLACKOUT_KICK.id) ?? 0;
    items.push({
      label: (
        <>
          <SpellLink spell={SPELLS.BLACKOUT_KICK} /> available immediately
        </>
      ),
      result: (
        <PerformanceMark
          perf={
            initialBoKCooldown < 1000 ? QualitativePerformance.Good : QualitativePerformance.Fail
          }
        />
      ),
      details:
        initialBoKCooldown > 1000 ? (
          <>{formatDurationMillisMinSec(initialBoKCooldown, 1)} remaining on cooldown</>
        ) : null,
    });

    items.push({
      label: (
        <>
          <SpellLink spell={SPELLS_COMMON.NIUZAO_STOMP_DAMAGE} /> triggers (from{' '}
          <SpellLink spell={SPELLS.BLACKOUT_KICK}>BoK</SpellLink> casts)
        </>
      ),
      details: (
        <>
          {cast.stompCount} / {EXPECTED_STOMP_COUNT + extraBokCasts}
        </>
      ),
      result: (
        <PerformanceMark
          perf={evaluateQualitativePerformanceByThreshold({
            isGreaterThanOrEqual: {
              perfect: 7 + extraBokCasts,
              good: 6 + extraBokCasts,
              ok: 5 + extraBokCasts,
              fail: 4 + extraBokCasts,
            },
            actual: cast.stompCount,
          })}
        />
      ),
    });

    if (this.selectedCombatant.hasTalent(SPELLS.WISDOM_OF_THE_WALL_TALENT)) {
      // multiply by 3 with DFB because of the extra hits. in the future, probably need a separate threshold for ChP but nobody is really playing it right now
      const thresholdScale = this.selectedCombatant.hasTalent(SPELLS.DRAGONFIRE_BREW_TALENT)
        ? 3
        : 1;
      items.push({
        label: (
          <>
            <SpellLink spell={SPELLS.WISDOM_OF_THE_WALL_TALENT} /> triggers (from{' '}
            <SpellLink spell={SPELLS.BREATH_OF_FIRE_TALENT}>BoF</SpellLink> /{' '}
            <SpellLink spell={SPELLS.DRAGONFIRE_BREW_TALENT}>DFB</SpellLink>)
          </>
        ),
        details: (
          <>
            <TooltipElement
              content={
                <>
                  Trigger Sources:
                  <ul>
                    <li>
                      <SpellLink spell={SPELLS.BREATH_OF_FIRE_TALENT} /> &mdash;{' '}
                      {
                        cast.wotwTriggers.filter(
                          (event) => event.ability.guid === SPELLS.BREATH_OF_FIRE_TALENT.id,
                        ).length
                      }
                    </li>
                    {this.selectedCombatant.hasTalent(SPELLS.DRAGONFIRE_BREW_TALENT) && (
                      <li>
                        <SpellLink spell={SPELLS.DRAGONFIRE_BREW_TALENT} /> &mdash;{' '}
                        {
                          cast.wotwTriggers.filter(
                            (event) =>
                              event.ability.guid === SPELLS_COMMON.DRAGONFIRE_BREW_DAMAGE.id,
                          ).length
                        }
                      </li>
                    )}
                  </ul>
                </>
              }
            >
              {cast.wotwTriggers.length}
            </TooltipElement>{' '}
            ({cast.wotwClipCount}{' '}
            <TooltipElement
              content={
                <>
                  <SpellLink spell={SPELLS.WISDOM_OF_THE_WALL_TALENT} /> has a{' '}
                  <strong>1 second</strong> cooldown, which can prevent repeated casts from
                  triggering <SpellLink spell={SPELLS.WISDOM_OF_THE_WALL_TALENT}>WotW</SpellLink>{' '}
                  when using <SpellLink spell={SPELLS.DRAGONFIRE_BREW_TALENT} />.
                </>
              }
            >
              clipped
            </TooltipElement>
            )
          </>
        ),
        result: (
          <PerformanceMark
            perf={evaluateQualitativePerformanceByThreshold({
              actual: cast.wotwTriggers.length,
              isGreaterThanOrEqual: {
                perfect: 6 * thresholdScale,
                good: 5 * thresholdScale,
                ok: 4 * thresholdScale,
              },
            })}
          />
        ),
      });
    }

    return items;
  }
}
