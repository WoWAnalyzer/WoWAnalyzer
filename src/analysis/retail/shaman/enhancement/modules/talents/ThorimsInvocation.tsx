import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, DamageEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import { SpellLink } from 'interface';
import { formatNumber } from 'common/format';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import { DamageIcon, UptimeIcon } from 'interface/icons';
import { addInefficientCastReason } from 'parser/core/EventMetaLib';
import RESOURCE_TYPES, { getResource } from 'game/RESOURCE_TYPES';
import typedKeys from 'common/typedKeys';
import { EnhancementEventLinks } from '../../constants';

/** Lightning Bolt and Chain Lightning damage increased by 20%.
 *
 * While Ascendance is active, Windstrike automatically consumes up to 5 Maelstrom Weapon stacks to
 * discharge a Lightning Bolt or Chain Lightning at your enemy, whichever you most recently used. */

interface ThorimsInvocationProc {
  casts: number;
  hits?: number | undefined;
  damage: number;
}

class ThorimsInvocation extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    gcd: GlobalCooldown,
  };

  protected spellUsable!: SpellUsable;
  protected gcd!: GlobalCooldown;
  protected lastSpellId: number | undefined;
  protected procs: Record<number, ThorimsInvocationProc> = {
    [SPELLS.LIGHTNING_BOLT.id]: { casts: 0, damage: 0 },
    [TALENTS.CHAIN_LIGHTNING_TALENT.id]: { casts: 0, hits: 0, damage: 0 },
    [SPELLS.TEMPEST_CAST.id]: { casts: 0, hits: 0, damage: 0 },
  };
  protected increaseDamage = 0;
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
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.WINDSTRIKE_CAST),
      this.onCast,
    );
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.LIGHTNING_BOLT, TALENTS.CHAIN_LIGHTNING_TALENT, SPELLS.TEMPEST_CAST]),
      this.onDamage,
    );
  }

  onCast(event: CastEvent) {
    const linkedEvents =
      event._linkedEvents
        ?.filter((le) => le.relation === EnhancementEventLinks.THORIMS_INVOCATION_LINK)
        .map((le) => le.event as DamageEvent) || [];
    if (linkedEvents.length === 0) {
      return;
    }

    const spellId = linkedEvents[0].ability.guid;
    const hits = linkedEvents.length;

    this.procs[spellId].casts += 1;
    this.procs[spellId].damage += linkedEvents.reduce(
      (total: number, event: DamageEvent) => (total += event.amount),
      0,
    );
    this.procs[spellId].hits! += hits;
    this.lastSpellCast = spellId;

    if (spellId === TALENTS.CHAIN_LIGHTNING_TALENT.id) {
      const cr = getResource(event.classResources, RESOURCE_TYPES.MAELSTROM_WEAPON.id);
      const mswStacks = cr?.cost ?? 0;
      const remainingAscendance = this.ascendanceEndTimestamp - event.timestamp;
      const cracklingThunder = this.selectedCombatant.hasBuff(
        SPELLS.CRACKLING_THUNDER_TIER_BUFF.id,
      );
      if (
        mswStacks >= 5 &&
        !cracklingThunder &&
        remainingAscendance >
          this.spellUsable.cooldownRemaining(SPELLS.WINDSTRIKE_CAST.id) +
            this.gcd.getGlobalCooldownDuration(event.ability.guid)
      ) {
        addInefficientCastReason(
          event,
          <>
            You should have re-primed <SpellLink spell={TALENTS.THORIMS_INVOCATION_TALENT} /> by
            casting <SpellLink spell={SPELLS.LIGHTNING_BOLT} />
          </>,
        );
      } else if (!cracklingThunder && hits < 2) {
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

  onDamage(event: DamageEvent) {
    this.increaseDamage += calculateEffectiveDamage(event, 0.2);
  }

  get damageDone() {
    return (
      this.increaseDamage +
      typedKeys(this.procs).reduce((total, spellId) => (total += this.procs[spellId].damage), 0)
    );
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
    const castComponent = (
      <>
        <SpellLink spell={SPELLS.TEMPEST_CAST} />
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
            <div>
              Total <SpellLink spell={SPELLS.LIGHTNING_BOLT} />
              {this.selectedCombatant.hasTalent(TALENTS.TEMPEST_TALENT) ? (
                <>
                  , <SpellLink spell={TALENTS.TEMPEST_TALENT} />{' '}
                </>
              ) : null}
              and <SpellLink spell={TALENTS.CHAIN_LIGHTNING_TALENT} /> damage increased by{' '}
              <DamageIcon /> <strong>{formatNumber(this.increaseDamage)}</strong>
            </div>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.THORIMS_INVOCATION_TALENT}>
          <ItemDamageDone amount={this.damageDone} />
          <br />
          <UptimeIcon /> {this.totalProcs} <small>spells cast</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default ThorimsInvocation;
