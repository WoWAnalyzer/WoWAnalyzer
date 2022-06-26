import { formatDuration, formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import COVENANTS from 'game/shadowlands/COVENANTS';
import { ControlledExpandable, SpellLink } from 'interface';
import { GuideProps, PassFailBar, SectionHeader, SubSection } from 'interface/guide';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  DamageEvent,
  DeathEvent,
  EventType,
  FightEndEvent,
  RemoveStaggerEvent,
  SummonEvent,
} from 'parser/core/Events';
import { Info } from 'parser/core/metric';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import { useState } from 'react';

const RECENT_PURIFY_WINDOW = 6000;

const NIUZAO_PET_BUFF_IDS = new Set([
  SPELLS.CTA_INVOKE_NIUZAO_BUFF.id, // real niuzao
  SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id, // cta niuzao
]);

type NiuzaoCastData = {
  prePurified: RemoveStaggerEvent[];
  purifyingAtCast: {
    charges: number;
    cooldown: number;
  };
  purifyStompContribution: number;
  stompDamage: number;
  purifies: RemoveStaggerEvent[];
  stomps: StompData[];
  startEvent: SummonEvent;
  endEvent: DeathEvent | FightEndEvent;
};

type StompData = {
  event: CastEvent;
  damage: DamageEvent[];
  purifies: RemoveStaggerEvent[];
};

export class InvokeNiuzao extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
  };

  protected spellUsable!: SpellUsable;

  readonly casts: NiuzaoCastData[] = [];
  private activeCasts: Record<number, Omit<NiuzaoCastData, 'endEvent'>> = {};

  private recentPurifies: RemoveStaggerEvent[] = [];

  constructor(options: Options) {
    super(options);

    this.addEventListener(EventType.RemoveStagger, this.removeStagger);
    this.addEventListener(
      Events.damage.spell(SPELLS.NIUZAO_STOMP_DAMAGE).by(SELECTED_PLAYER_PET),
      this.stompDamage,
    );
    this.addEventListener(
      Events.cast.spell(SPELLS.NIUZAO_STOMP_DAMAGE).by(SELECTED_PLAYER_PET),
      this.stompCast,
    );

    // we may have multiple niuzaos active at once because of Call to Arms. handle it using summon/death rather than buffs
    this.addEventListener(Events.summon.by(SELECTED_PLAYER), this.onSummon);

    this.addEventListener(EventType.Death, this.onDeath);

    this.addEventListener(Events.fightend, this.endNiuzao);
  }

  private removeStagger(event: RemoveStaggerEvent) {
    if (event.trigger?.ability.guid !== SPELLS.PURIFYING_BREW.id) {
      return;
    }

    this.recentPurifies.push(event);
    Object.values(this.activeCasts).forEach((data) => {
      data.purifies!.push(event);
    });
  }

  private onSummon(event: SummonEvent) {
    const petId = event.ability.guid;
    if (!NIUZAO_PET_BUFF_IDS.has(petId)) {
      return;
    }

    this.activeCasts[event.targetID] = this.constructCastData(event);
  }

  private onDeath(event: DeathEvent) {
    const active = this.activeCasts[event.targetID] as NiuzaoCastData | undefined;
    delete this.activeCasts[event.targetID];

    if (active) {
      active.endEvent = event;
      this.casts.push(active);
    }
  }

  private endNiuzao(event: FightEndEvent) {
    Object.values(this.activeCasts).forEach((cast) => {
      const active = cast as NiuzaoCastData;
      active.endEvent = event;
      this.casts.push(active);
    });

    this.activeCasts = {};
  }

  private stompCast(event: CastEvent) {
    const purifies = this.retrieveRecentPurifies(event.timestamp);
    this.resetRecentlyPurified();

    const cast = this.activeCasts[event.sourceID ?? -1];

    if (cast === undefined) {
      console.warn('Stomp found with no niuzao active', event, purifies);
      return;
    }

    cast.stomps!.push({
      event,
      purifies,
      damage: [],
    });
  }

  private stompDamage(event: DamageEvent) {
    const cast = this.activeCasts[event.sourceID ?? -1];
    if (!cast) {
      return;
    }

    const stomp = cast.stomps![cast.stomps!.length - 1];
    if (stomp === undefined || event.timestamp - stomp.event.timestamp > 250) {
      return;
    }

    stomp.damage.push(event);
  }

  /**
   * Retrieve the amount of recently purified damage
   */
  private retrieveRecentPurifies(now: number) {
    return this.recentPurifies.filter(({ timestamp }) => now - timestamp < RECENT_PURIFY_WINDOW);
  }

  private resetRecentlyPurified() {
    this.recentPurifies = [];
  }

  private constructCastData(summonEvent: SummonEvent): Omit<NiuzaoCastData, 'endEvent'> {
    const prePurified = this.retrieveRecentPurifies(summonEvent.timestamp);
    return {
      prePurified,
      get purifyStompContribution() {
        return this.stomps.reduce(
          (total, { purifies }) =>
            total + purifies.reduce((total, { amount }) => total + amount, 0) / 4,
          0,
        );
      },
      get stompDamage() {
        return this.stomps
          .flatMap((stomp) => stomp.damage)
          .reduce((total, { amount }) => total + amount, 0);
      },
      purifies: [],
      stomps: [],
      purifyingAtCast: {
        charges: this.spellUsable.chargesAvailable(SPELLS.PURIFYING_BREW.id),
        cooldown: this.spellUsable.cooldownRemaining(SPELLS.PURIFYING_BREW.id),
      },
      startEvent: summonEvent,
    };
  }
}

const NIUZAO_BUFF_ID_TO_CAST = {
  [SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id]: SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id,
  [SPELLS.CTA_INVOKE_NIUZAO_BUFF.id]: SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL.id,
};

const MAX_STOMPS = {
  [SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id]: 5,
  [SPELLS.CTA_INVOKE_NIUZAO_BUFF.id]: 3,
};

function NiuzaoChecklistHeader({ cast, info }: { cast: NiuzaoCastData; info: Info }): JSX.Element {
  return (
    <SectionHeader>
      {formatDuration(cast.startEvent.timestamp - info.fightStart)} &mdash;{' '}
      <SpellLink id={NIUZAO_BUFF_ID_TO_CAST[cast.startEvent.ability.guid]} /> (
      {formatNumber(cast.stompDamage)})
    </SectionHeader>
  );
}

function InvokeNiuzaoChecklist({ cast, info }: { cast: NiuzaoCastData; info: Info }): JSX.Element {
  const [isExpanded, setIsExpanded] = useState(false);
  return (
    <ControlledExpandable
      header={<NiuzaoChecklistHeader cast={cast} info={info} />}
      element="section"
      expanded={isExpanded}
      inverseExpanded={() => setIsExpanded(!isExpanded)}
    >
      <table className="hits-list">
        <tbody>
          <tr>
            <td>
              <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} /> casts
            </td>
            <td className="pass-fail-counts">
              {cast.stomps.length} / {MAX_STOMPS[cast.startEvent.ability.guid]}
            </td>
            <td>
              <PassFailBar
                pass={cast.stomps.length}
                total={MAX_STOMPS[cast.startEvent.ability.guid]}
              />
            </td>
          </tr>
          <tr>
            <td>
              Total <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} /> damage
            </td>
            <td className="pass-fail-counts">{formatNumber(cast.stompDamage)}</td>
            <td></td>
          </tr>
          <tr>
            <td>Amount Purified</td>
            <td className="pass-fail-counts">{formatNumber(cast.purifyStompContribution)}</td>
          </tr>
        </tbody>
      </table>
    </ControlledExpandable>
  );
}

export function InvokeNiuzaoSection({
  castEfficiency,
  events,
  info,
  module,
}: Pick<GuideProps<any>, 'events' | 'info'> & {
  castEfficiency: CastEfficiency;
  module: InvokeNiuzao;
}): JSX.Element {
  const efficiency = castEfficiency.getCastEfficiencyForSpellId(
    SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id,
  )!;

  const wooEfficiency = castEfficiency.getCastEfficiencyForSpellId(
    SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL.id,
  );

  return (
    <SubSection title="Invoke Niuzao, the Black Ox">
      <p>
        <SpellLink id={SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id} /> is one of the most powerful damage
        cooldowns in the game&mdash;and one of the most dangerous. Using this ability, we can
        efficiently turn massive amounts of damage taken into massive amounts of damage dealt.
      </p>
      <p>
        The level 58 upgrade to this ability causes <SpellLink id={SPELLS.PURIFYING_BREW.id} /> to
        add 25% of the purified damage to the next <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} />{' '}
        within 6 seconds. Niuzao casts <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} /> when he is
        summoned, and then every 5 seconds after that, for a total of 5
        <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} />s per{' '}
        <SpellLink id={SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id} />.
        {info.combatant.hasCovenant(COVENANTS.KYRIAN.id) && (
          <>
            {' '}
            A cast of <SpellLink id={SPELLS.WEAPONS_OF_ORDER_BUFF_AND_HEAL.id} /> will trigger 3{' '}
            <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} />
            s&mdash;though this Niuzao has some issues hitting bosses with large models.
          </>
        )}{' '}
        Casting <SpellLink id={SPELLS.PURIFYING_BREW.id} /> prior to summoning Niuzao will
        contribute to the damage of the first <SpellLink id={SPELLS.NIUZAO_STOMP_DAMAGE.id} />.
      </p>
      <p>
        Unlike most damage cooldowns, it is frequently correct to sacrifice a cast of{' '}
        <SpellLink id={SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id} /> in order to get a better cast later.
        This is because <em>so much</em> of the damage of this cooldown is tied up in using{' '}
        <SpellLink id={SPELLS.PURIFYING_BREW.id} /> to convert damage taken into damage dealt that a
        single <em>great</em> cast can be worth more than multiple mediocre casts.
      </p>
      <table className="hits-list">
        <tbody>
          <tr>
            <td>
              <SpellLink id={SPELLS.INVOKE_NIUZAO_THE_BLACK_OX.id} /> casts
            </td>

            <td className="pass-fail-counts">
              {efficiency.casts} / {efficiency.maxCasts}{' '}
            </td>
            <td>
              <PassFailBar pass={efficiency.casts} total={efficiency.maxCasts} />
            </td>
          </tr>
          {info.combatant.hasCovenant(COVENANTS.KYRIAN.id) && (
            <tr>
              <td>
                <SpellLink id={SPELLS.WEAPONS_OF_ORDER_CAST.id} /> casts
              </td>
              <td className="pass-fail-counts">
                {wooEfficiency?.casts} / {wooEfficiency?.maxCasts}{' '}
              </td>
              <td>
                <PassFailBar pass={wooEfficiency!.casts} total={wooEfficiency!.maxCasts} />
              </td>
            </tr>
          )}
        </tbody>
      </table>
      <SubSection title="Casts">
        {module.casts.map((cast, ix) => (
          <InvokeNiuzaoChecklist key={ix} cast={cast} info={info} />
        ))}
      </SubSection>
    </SubSection>
  );
}
