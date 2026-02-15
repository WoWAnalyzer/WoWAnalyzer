import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  DamageEvent,
  EventType,
  FreeCastEvent,
  GetRelatedEvent,
  GetRelatedEvents,
} from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { SpellLink } from 'interface';
import { formatNumber } from 'common/format';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import { DamageIcon, UptimeIcon } from 'interface/icons';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import RESOURCE_TYPES, { getResource } from 'game/RESOURCE_TYPES';
import typedKeys from 'common/typedKeys';
import { EnhancementEventLinks } from '../../constants';

/** Doom Winds and Deeply Rooted Elements last 2 sec longer,
 * and the cooldown of Ascendance is reduced by 60 sec.
 *
 * During Doom Winds or Ascendance, Stormstrike and Crash Lightning
 * consume up to 10 Maelstrom Weapon to discharge a Lightning Bolt
 * or Chain Lightning at 100% effectiveness at your enemy,
 * whichever you most recently used.
 */

interface ThorimsInvocationProc {
  casts: number;
  hits?: number | undefined;
  damage: number;
}

class ThorimsInvocation extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
  gcd: GlobalCooldown,
}) {
  protected lastSpellId: number | undefined;
  protected procs: Record<number, ThorimsInvocationProc> = {
    [SPELLS.LIGHTNING_BOLT.id]: { casts: 0, damage: 0 },
    [TALENTS.CHAIN_LIGHTNING_TALENT.id]: { casts: 0, hits: 0, damage: 0 },
    [SPELLS.TEMPEST_CAST.id]: { casts: 0, hits: 0, damage: 0 },
  };
  protected lastSpellCast: number | null = null;
  protected ascendanceEndTimestamp = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.THORIMS_INVOCATION_TALENT);
    if (!this.active) {
      return;
    }
    const ascendanceDuration = this.selectedCombatant.hasTalent(
      TALENTS.DEEPLY_ROOTED_ELEMENTS_TALENT,
    )
      ? 6000
      : 15000;

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.ASCENDANCE_ENHANCEMENT_TALENT),
      (event: ApplyBuffEvent) =>
        (this.ascendanceEndTimestamp = event.timestamp + ascendanceDuration),
    );
    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([SPELLS.STORMSTRIKE, SPELLS.WINDSTRIKE_CAST, TALENTS.CRASH_LIGHTNING_TALENT]),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.DOOM_WINDS_BUFF)) {
      return;
    }

    const castEvent = GetRelatedEvent<FreeCastEvent>(
      event,
      EnhancementEventLinks.THORIMS_INVOCATION_LINK,
      (e) => e.type === EventType.FreeCast,
    )!;
    if (!castEvent) {
      return;
    }

    const damageEvents = GetRelatedEvents<DamageEvent>(
      castEvent,
      EnhancementEventLinks.THORIMS_INVOCATION_DAMAGE_LINK,
      (e) => e.type === EventType.Damage,
    );
    if (damageEvents.length === 0) {
      return;
    }

    const spellId = castEvent.ability.guid;
    const hits = damageEvents.length;

    this.procs[spellId].casts += 1;
    this.procs[spellId].damage += damageEvents.reduce(
      (total: number, event: DamageEvent) => (total += event.amount),
      0,
    );
    this.procs[spellId].hits! += hits;
    this.lastSpellCast = spellId;

    if (spellId === TALENTS.CHAIN_LIGHTNING_TALENT.id) {
      // get linked event
      const chainLightningDamageEvent = GetRelatedEvent(
        event,
        EnhancementEventLinks.THORIMS_INVOCATION_LINK,
      )!;
      const chainLightningCastEvent = GetRelatedEvent<CastEvent>(
        chainLightningDamageEvent,
        EnhancementEventLinks.CHAIN_LIGHTNING_LINK,
      )!;
      const cr = getResource(
        chainLightningCastEvent.classResources,
        RESOURCE_TYPES.MAELSTROM_WEAPON.id,
      );
      const mswStacks = cr?.cost ?? 0;

      // The remaining logic is Ascendance/Windstrike-specific APL guidance.
      if (event.ability.guid !== SPELLS.WINDSTRIKE_CAST.id) {
        return;
      }

      const remainingAscendance = this.ascendanceEndTimestamp - event.timestamp;
      if (
        hits < 2 &&
        mswStacks >= 5 &&
        remainingAscendance >
          this.deps.spellUsable.cooldownRemaining(SPELLS.WINDSTRIKE_CAST.id) +
            this.deps.gcd.getGlobalCooldownDuration(event.ability.guid)
      ) {
        addInefficientCastReason(
          event,
          <>
            You should have re-primed <SpellLink spell={TALENTS.THORIMS_INVOCATION_TALENT} /> by
            casting <SpellLink spell={SPELLS.LIGHTNING_BOLT} />
          </>,
        );
      } else if (hits < 2) {
        addInefficientCastReason(
          event,
          <>
            <SpellLink spell={TALENTS.THORIMS_INVOCATION_TALENT} /> was not primed with{' '}
            <SpellLink spell={SPELLS.LIGHTNING_BOLT} />
          </>,
        );
      }
    }
  }

  get totalProcs() {
    return typedKeys(this.procs).reduce(
      (total, spellId) => (total += this.procs[spellId].casts),
      0,
    );
  }

  get lightningBoltStatisticTooltip() {
    const proc = this.procs[SPELLS.LIGHTNING_BOLT.id];
    const castComponent = (
      <>
        <SpellLink spell={SPELLS.LIGHTNING_BOLT} />
        {': '}
        <strong>{formatNumber(proc.casts)}</strong> {proc.casts === 1 ? 'cast' : 'casts'}
      </>
    );
    const damageComponent =
      proc.casts > 0 ? (
        <>
          {' - '}
          <DamageIcon /> <strong>{formatNumber(proc.damage)}</strong> damage done (<DamageIcon />{' '}
          <strong>{formatNumber(proc.damage / proc.casts)}</strong> per cast)
        </>
      ) : (
        <></>
      );

    return (
      <>
        <div>
          {castComponent}
          {damageComponent}
        </div>
      </>
    );
  }

  get tempestStatisticTooltip() {
    const proc = this.procs[SPELLS.TEMPEST_CAST.id];
    if (proc.casts === 0) {
      return <></>;
    }
    const castComponent = (
      <>
        <SpellLink spell={SPELLS.TEMPEST_CAST} />
        {': '}
        <strong>{formatNumber(proc.casts)}</strong> {proc.casts === 1 ? 'cast' : 'casts'}
      </>
    );
    const damageComponent = (
      <>
        {' - '}
        <DamageIcon /> <strong>{formatNumber(proc.damage)}</strong> damage done (<DamageIcon />{' '}
        <strong>{formatNumber(proc.damage / proc.casts)}</strong> per cast)
      </>
    );

    return (
      <>
        <div>
          {castComponent}
          {damageComponent}
        </div>
      </>
    );
  }

  get chainLightningStatisticTooltip() {
    const proc = this.procs[TALENTS.CHAIN_LIGHTNING_TALENT.id];
    if (proc.casts > 0) {
      const hitsComponent =
        proc.hits! > proc.casts ? (
          <>
            {' '}
            (<strong>
              {formatNumber(this.procs[TALENTS.CHAIN_LIGHTNING_TALENT.id].hits!)}
            </strong>{' '}
            hits)
          </>
        ) : (
          <></>
        );

      return (
        <>
          <div>
            <SpellLink spell={TALENTS.CHAIN_LIGHTNING_TALENT} />
            {': '}
            <strong>{formatNumber(proc.casts)}</strong> {proc.casts === 1 ? 'cast' : 'casts'}
            {hitsComponent}
            {' - '}
            <strong>{formatNumber(proc.damage)}</strong> damage done (<DamageIcon />{' '}
            <strong>{formatNumber(proc.damage / proc.casts)}</strong> per cast)
          </div>
        </>
      );
    } else {
      return <></>;
    }
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            {this.lightningBoltStatisticTooltip}
            {this.tempestStatisticTooltip}
            {this.chainLightningStatisticTooltip}
          </>
        }
      >
        <TalentSpellText talent={TALENTS.THORIMS_INVOCATION_TALENT}>
          <UptimeIcon /> {this.totalProcs} <small>spells cast</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ThorimsInvocation;
