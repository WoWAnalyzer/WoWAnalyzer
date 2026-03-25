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
import Spell from 'common/SPELLS/Spell';
import styles from './InvokeNiuzao.module.scss';
import Abilities from 'parser/core/modules/Abilities';

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

const NIUZAO_DURATION = 25000;
const EXPECTED_STOMP_COUNT = Math.floor(25 / 4);
const EXPECTED_STOMP_COUNT_FOM = Math.floor(25 / 3);
const EXPECTED_BOF_COUNT = 8; // made up in pre-patch. TODO this probably changes with apex talent resets

export default class InvokeNiuzao extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
  abilities: Abilities,
}) {
  private hasWotW = this.selectedCombatant.hasTalent(SPELLS.WISDOM_OF_THE_WALL_TALENT);

  readonly niuzaoCasts: NiuzaoCast[] = [];

  private get currentCast() {
    const cast = this.niuzaoCasts.at(-1);
    if (cast && !cast.deathEvent) {
      return cast;
    }

    return undefined;
  }

  private cbSpell = this.selectedCombatant.hasTalent(SPELLS.CELESTIAL_INFUSION_TALENT)
    ? SPELLS.CELESTIAL_INFUSION_TALENT
    : SPELLS.CELESTIAL_BREW_TALENT;

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
    // record cooldown state. for shp specifically cooldown alignment is important to force resets
    const cooldowns = new Map();

    cooldowns.set(
      SPELLS.BLACKOUT_KICK.id,
      this.deps.spellUsable.cooldownRemaining(SPELLS.BLACKOUT_KICK.id),
    );
    cooldowns.set(
      SPELLS.BREATH_OF_FIRE_TALENT.id,
      this.deps.spellUsable.cooldownRemaining(SPELLS.BREATH_OF_FIRE_TALENT.id),
    );
    cooldowns.set(
      SPELLS.KEG_SMASH_TALENT.id,
      this.deps.spellUsable.fractionalChargesAvailable(SPELLS.KEG_SMASH_TALENT.id),
    );
    cooldowns.set(
      SPELLS.EXPLODING_KEG_TALENT.id,
      this.deps.spellUsable.cooldownRemaining(SPELLS.EXPLODING_KEG_TALENT.id),
    );
    cooldowns.set(
      SPELLS.BLACK_OX_BREW_TALENT.id,
      this.deps.spellUsable.cooldownRemaining(SPELLS.BLACK_OX_BREW_TALENT.id),
    );
    cooldowns.set(this.cbSpell.id, this.deps.spellUsable.cooldownRemaining(this.cbSpell.id));

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

    let overallPerf = QualitativePerformance.Fail;
    if (this.selectedCombatant.hasTalent(SPELLS.WISDOM_OF_THE_WALL_TALENT)) {
      const wotwPerf = evaluateQualitativePerformanceByThreshold({
        actual: cast.wotwTriggers.length,
        isGreaterThanOrEqual: {
          perfect: EXPECTED_BOF_COUNT + 2,
          good: EXPECTED_BOF_COUNT,
          ok: EXPECTED_BOF_COUNT - 2,
        },
      });

      const initialBoFCooldown = cast.cooldowns.get(SPELLS.BREATH_OF_FIRE_TALENT.id) ?? 0;
      const initialKSCharges = cast.cooldowns.get(SPELLS.KEG_SMASH_TALENT.id) ?? 0;

      const resetCount = (spell: Spell) =>
        (cast.cooldowns.get(spell.id) ?? 0) > NIUZAO_DURATION - 1000 ? 0 : 1;

      const estimatedKSChargeCDs = Math.floor(
        NIUZAO_DURATION /
          1000 /
          this.deps.abilities.getAbility(SPELLS.KEG_SMASH_TALENT.id)!.cooldown,
      );

      const availableResets =
        resetCount(SPELLS.EXPLODING_KEG_TALENT) +
        resetCount(SPELLS.BLACK_OX_BREW_TALENT) +
        resetCount(this.cbSpell) +
        Math.floor(initialKSCharges + estimatedKSChargeCDs);

      overallPerf = wotwPerf; // WotW is more important than Stomp, overwrite the overall value.
      items.push({
        label: (
          <>
            <SpellLink spell={SPELLS.WISDOM_OF_THE_WALL_TALENT}>WotW</SpellLink> triggers
          </>
        ),
        details: (
          <>
            {cast.wotwTriggers.length} / {EXPECTED_BOF_COUNT}
          </>
        ),
        result: <PerformanceMark perf={wotwPerf} />,
      });
      items.push({
        label: (
          <>
            <SpellLink spell={SPELLS.BREATH_OF_FIRE_TALENT} /> available immediately
          </>
        ),
        result:
          initialBoFCooldown > 1000 ? (
            <TooltipElement
              content={
                <>
                  On CD (<SpellLink spell={SPELLS.KEG_SMASH_TALENT}>KS</SpellLink>{' '}
                  {initialKSCharges >= 1 ? 'available' : 'unavailable'})
                </>
              }
            >
              <PerformanceMark
                perf={
                  initialKSCharges >= 1 ? QualitativePerformance.Ok : QualitativePerformance.Fail
                }
              />
            </TooltipElement>
          ) : (
            <PerformanceMark perf={QualitativePerformance.Good} />
          ),
      });
      items.push({
        label: (
          <>
            Deterministic <SpellLink spell={SPELLS.BREATH_OF_FIRE_TALENT}>BoF</SpellLink> resets
            available
          </>
        ),
        result: (
          <PerformanceMark
            perf={evaluateQualitativePerformanceByThreshold({
              isGreaterThanOrEqual: {
                perfect: 8,
                good: 6.5,
                ok: 5,
              },
              actual: availableResets,
            })}
          />
        ),
        details: (
          <TooltipElement
            content={
              <dl className={styles.bofResetList}>
                <dt>
                  <SpellLink spell={SPELLS.KEG_SMASH_TALENT} />
                </dt>
                <dd>{Math.floor(initialKSCharges + estimatedKSChargeCDs)}</dd>
                <dt>
                  <SpellLink spell={this.cbSpell} />
                </dt>
                <dd>{resetCount(this.cbSpell)}</dd>
                <dt>
                  <SpellLink spell={SPELLS.EXPLODING_KEG_TALENT} />
                </dt>
                <dd>{resetCount(SPELLS.EXPLODING_KEG_TALENT)}</dd>
                <dt>
                  <SpellLink spell={SPELLS.BLACK_OX_BREW_TALENT} />
                </dt>
                <dd>{resetCount(SPELLS.BLACK_OX_BREW_TALENT)}</dd>
              </dl>
            }
          >
            {availableResets}
          </TooltipElement>
        ),
      });
    } else {
      const expectedStomps = this.selectedCombatant.hasTalent(SPELLS.FLUIDITY_OF_MOTION_TALENT)
        ? EXPECTED_STOMP_COUNT_FOM
        : EXPECTED_STOMP_COUNT;

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
            <SpellLink spell={SPELLS_COMMON.NIUZAO_STOMP_DAMAGE} /> triggers{' '}
          </>
        ),
        details: (
          <>
            {cast.stompCount} / {expectedStomps}
          </>
        ),
        result: <PerformanceMark perf={overallPerf} />,
      });
    }

    return { checklist: items, perf: overallPerf };
  }
}
