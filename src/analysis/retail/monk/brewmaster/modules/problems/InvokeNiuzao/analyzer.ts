import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/monk';
import HIT_TYPES from 'game/HIT_TYPES';
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
import Enemies from 'parser/shared/modules/Enemies';
import { shouldIgnore } from 'parser/shared/modules/hit-tracking/utilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';

const RECENT_PURIFY_WINDOW = 6000;

const NIUZAO_PET_BUFF_IDS = new Set([
  SPELLS.CTA_INVOKE_NIUZAO_BUFF.id, // cta niuzao
  talents.INVOKE_NIUZAO_THE_BLACK_OX_TALENT.id, // real niuzao
]);

export type NiuzaoCastData = {
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
  relevantHits: DamageEvent[];
  sitDetected: boolean;
};

type StompData = {
  event: CastEvent;
  damage: DamageEvent[];
  purifies: RemoveStaggerEvent[];
};

export class InvokeNiuzao extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    enemies: Enemies,
  };

  protected spellUsable!: SpellUsable;
  protected enemies!: Enemies;

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

    this.addEventListener(Events.damage.to(SELECTED_PLAYER), this.onDamage);
  }

  private onDamage(event: DamageEvent) {
    if (shouldIgnore(this.enemies, event)) {
      return;
    }

    Object.values(this.activeCasts).forEach((cast) => {
      cast.relevantHits.push(event);

      if (event.hitType === HIT_TYPES.CRIT) {
        cast.sitDetected = true;
      }
    });
  }

  private removeStagger(event: RemoveStaggerEvent) {
    if (event.trigger?.ability.guid !== talents.PURIFYING_BREW_TALENT.id) {
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
            total + purifies.reduce((total, { amount }) => total + amount, 0),
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
      relevantHits: [],
      purifyingAtCast: {
        charges: this.spellUsable.chargesAvailable(talents.PURIFYING_BREW_TALENT.id),
        cooldown: this.spellUsable.cooldownRemaining(talents.PURIFYING_BREW_TALENT.id),
      },
      startEvent: summonEvent,
      sitDetected: false,
    };
  }
}
