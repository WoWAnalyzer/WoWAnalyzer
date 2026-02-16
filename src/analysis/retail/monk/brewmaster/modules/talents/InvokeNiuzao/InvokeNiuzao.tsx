import { PerformanceMark } from 'interface/guide';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import SPELLS from '../../../spell-list_Monk_Brewmaster.retail';
import Events, {
  AbilityEvent,
  CastEvent,
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
import { formatDurationMillisMinSec } from 'common/format';

/**
 * @internal
 */
export interface NiuzaoCast {
  summonEvent: SummonEvent;
  deathEvent?: DeathEvent;
  stompCount: number;
  wotwTriggers: AbilityEvent<EventType>[];
  cooldowns: Map<number, number>;
}

const EXPECTED_STOMP_COUNT = Math.floor(25 / 4);
const EXPECTED_STOMP_COUNT_FOM = Math.floor(25 / 3);
const EXPECTED_BOF_COUNT = 8; // made up in pre-patch. TODO this probably changes with apex talent resets

export default class InvokeNiuzao extends Analyzer.withDependencies({ spellUsable: SpellUsable }) {
  private hasWotW = this.selectedCombatant.hasTalent(SPELLS.WISDOM_OF_THE_WALL_TALENT);

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
        Events.cast.by(SELECTED_PLAYER).spell([SPELLS.BREATH_OF_FIRE_TALENT]),
        this.triggerWotW,
      );
    }
  }

  private triggerWotW(event: CastEvent): void {
    if (
      !this.selectedCombatant.hasBuff(SPELLS.INVOKE_NIUZAO_THE_BLACK_OX_TALENT) ||
      !this.currentCast
    ) {
      return; // WotW only triggers during Invoke Niuzao
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

  checklist(cast: NiuzaoCast): {
    checklist: CooldownExpandableItem[];
    perf: QualitativePerformance;
  } {
    const items: CooldownExpandableItem[] = [];

    const expectedStomps = this.selectedCombatant.hasTalent(SPELLS.FLUIDITY_OF_MOTION_TALENT)
      ? EXPECTED_STOMP_COUNT_FOM
      : EXPECTED_STOMP_COUNT;

    let overallPerf = QualitativePerformance.Fail;
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

    const stompPerf = evaluateQualitativePerformanceByThreshold({
      isGreaterThanOrEqual: {
        perfect: expectedStomps + 1,
        good: expectedStomps,
        ok: expectedStomps - 2,
        fail: expectedStomps - 3,
      },
      actual: cast.stompCount,
    });
    overallPerf = stompPerf;
    items.push({
      label: (
        <>
          <SpellLink spell={SPELLS_COMMON.NIUZAO_STOMP_DAMAGE} /> triggers (from{' '}
          <SpellLink spell={SPELLS.BLACKOUT_KICK}>BoK</SpellLink> casts)
        </>
      ),
      details: (
        <>
          {cast.stompCount} / {expectedStomps}
        </>
      ),
      result: <PerformanceMark perf={overallPerf} />,
    });

    if (this.selectedCombatant.hasTalent(SPELLS.WISDOM_OF_THE_WALL_TALENT)) {
      const wotwPerf = evaluateQualitativePerformanceByThreshold({
        actual: cast.wotwTriggers.length,
        isGreaterThanOrEqual: {
          perfect: EXPECTED_BOF_COUNT + 1,
          good: EXPECTED_BOF_COUNT,
          ok: EXPECTED_BOF_COUNT - 2,
        },
      });

      overallPerf = wotwPerf; // WotW is more important than Stomp, overwrite the overall value.
      items.push({
        label: (
          <>
            <SpellLink spell={SPELLS.WISDOM_OF_THE_WALL_TALENT}>WotW</SpellLink> triggers
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
          </>
        ),
        result: <PerformanceMark perf={wotwPerf} />,
      });
    }

    return { checklist: items, perf: overallPerf };
  }
}
