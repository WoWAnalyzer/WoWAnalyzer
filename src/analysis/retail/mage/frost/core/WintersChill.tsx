import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  ApplyDebuffEvent,
  RemoveDebuffEvent,
  CastEvent,
  DamageEvent,
  GetRelatedEvent,
} from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const WINTERS_CHILL_SPENDERS = [SPELLS.ICE_LANCE_DAMAGE.id, SPELLS.GLACIAL_SPIKE_DAMAGE.id];

class WintersChill extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  hasGlacialSpike: boolean = this.selectedCombatant.hasTalent(TALENTS.GLACIAL_SPIKE_TALENT);
  wintersChill: {
    apply: ApplyDebuffEvent;
    remove: RemoveDebuffEvent | undefined;
    precast: CastEvent | undefined;
    precastIcicles: number;
    damageEvents: DamageEvent[];
  }[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.WINTERS_CHILL),
      this.onWintersChill,
    );
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([SPELLS.FROSTBOLT_DAMAGE, SPELLS.GLACIAL_SPIKE_DAMAGE, SPELLS.ICE_LANCE_DAMAGE]),
      this.onDamage,
    );
  }

  onWintersChill(event: ApplyDebuffEvent) {
    const remove: RemoveDebuffEvent | undefined = GetRelatedEvent(event, 'DebuffRemove');
    const flurry: CastEvent | undefined = GetRelatedEvent(event, 'SpellCast');
    const precast: CastEvent | undefined = GetRelatedEvent(event, 'PreCast');
    this.wintersChill.push({
      apply: event,
      remove: remove,
      precast: precast,
      precastIcicles:
        (flurry &&
          this.selectedCombatant.getBuff(SPELLS.ICICLES_BUFF.id, flurry.timestamp)?.stacks) ||
        0,
      damageEvents: [],
    });
  }

  onDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    if (!enemy || !enemy.hasBuff(SPELLS.WINTERS_CHILL.id)) {
      return;
    }
    const wintersChillDebuff: number | undefined = this.wintersChill.findIndex(
      (d) =>
        d.apply.timestamp <= event.timestamp && d.remove && d.remove.timestamp >= event.timestamp,
    );
    this.wintersChill[wintersChillDebuff].damageEvents?.push(event);
  }

  missedPreCasts = () => {
    //If there is no Pre Cast, or if there is a Precast but it didnt land in Winter's Chlll
    let missingPreCast = this.wintersChill.filter(
      (w) =>
        !w.precast ||
        w.damageEvents.filter((d) => w.precast?.ability.guid === d.ability.guid).length > 0,
    );

    //If the player had exactly 4 Icicles, disregard it
    missingPreCast = missingPreCast.filter((w) => w.precastIcicles !== 4);

    return missingPreCast.length;
  };

  wintersChillShatters = () => {
    //Winter's Chill Debuffs where there are at least 2 damage hits of Glacial Spike and/or Ice Lance
    const badDebuffs = this.wintersChill.filter(
      (w) =>
        w.damageEvents.filter((d) => WINTERS_CHILL_SPENDERS.includes(d.ability.guid)).length >= 2,
    );

    return badDebuffs.length;
  };

  get totalProcs() {
    return this.wintersChill.length;
  }

  get missedShatters() {
    return this.totalProcs - this.wintersChillShatters();
  }

  get shatterPercent() {
    return this.wintersChillShatters() / this.totalProcs || 0;
  }

  get preCastPercent() {
    return 1 - this.missedPreCasts() / this.totalProcs;
  }

  // less strict than the ice lance suggestion both because it's less important,
  // and also because using a Brain Freeze after being forced to move is a good excuse for missing the hardcast.
  get wintersChillPreCastThresholds() {
    return {
      actual: this.preCastPercent,
      isLessThan: {
        minor: 0.9,
        average: 0.8,
        major: 0.6,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get wintersChillShatterThresholds() {
    return {
      actual: this.shatterPercent,
      isLessThan: {
        minor: 0.95,
        average: 0.85,
        major: 0.75,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.wintersChillShatterThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You failed to properly take advantage of <SpellLink spell={SPELLS.WINTERS_CHILL} /> on
          your target {this.missedShatters} times ({formatPercentage(1 - actual)}%). After debuffing
          the target via <SpellLink spell={TALENTS.BRAIN_FREEZE_TALENT} /> and{' '}
          <SpellLink spell={TALENTS.FLURRY_TALENT} />, you should ensure that you hit the target
          with{' '}
          {this.hasGlacialSpike ? (
            <>
              a <SpellLink spell={TALENTS.GLACIAL_SPIKE_TALENT} /> and an{' '}
              <SpellLink spell={TALENTS.ICE_LANCE_TALENT} /> (If Glacial Spike is available), or{' '}
            </>
          ) : (
            ''
          )}{' '}
          two <SpellLink spell={TALENTS.ICE_LANCE_TALENT} />s before the{' '}
          <SpellLink spell={SPELLS.WINTERS_CHILL} /> debuff expires to get the most out of{' '}
          <SpellLink spell={TALENTS.SHATTER_TALENT} />.
        </>,
      )
        .icon(TALENTS.ICE_LANCE_TALENT.icon)
        .actual(`${formatPercentage(1 - actual)}% Winter's Chill not shattered with Ice Lance`)
        .recommended(`${formatPercentage(1 - recommended)}% is recommended`),
    );
    when(this.wintersChillPreCastThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You failed to use a pre-cast ability before <SpellLink spell={TALENTS.FLURRY_TALENT} />{' '}
          {this.missedPreCasts} times ({formatPercentage(1 - actual)}%). Because of the travel time
          of <SpellLink spell={TALENTS.FLURRY_TALENT} />, you should cast a damaging ability such as{' '}
          <SpellLink spell={SPELLS.FROSTBOLT} /> immediately before using{' '}
          <SpellLink spell={TALENTS.FLURRY_TALENT} />. Doing this will allow your pre-cast ability
          to hit the target after <SpellLink spell={TALENTS.FLURRY_TALENT} /> (unless you are
          standing too close to the target) allowing it to benefit from{' '}
          <SpellLink spell={TALENTS.SHATTER_TALENT} />. If you have 4 Icicles, it can be acceptable
          to use <SpellLink spell={TALENTS.FLURRY_TALENT} /> without a pre-cast.
        </>,
      )
        .icon(SPELLS.FROSTBOLT.icon)
        .actual(
          `${formatPercentage(
            1 - actual,
          )}% Winter's Chill not shattered with Frostbolt or Glacial Spike`,
        )
        .recommended(`${formatPercentage(1 - recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(30)}
        size="flexible"
        tooltip={
          <>
            When casting Flurry, you should always ensure that you have something immediately before
            it (Like Frostbolt or Ebonbolt) as well as 2 Ice Lance Casts (Or Glacial Spike + Ice
            Lance) immediately after to get the most out of the Winter's Chill debuff that is
            applied to the target. Doing so will allow the cast before and the 2 casts after to all
            benefit from Shatter. Note that if you are very close to your target, then the ability
            you used immediately before Flurry might hit the target too quickly and not get
            shattered.
          </>
        }
      >
        <BoringSpellValueText spell={SPELLS.WINTERS_CHILL}>
          <SpellIcon spell={SPELLS.WINTERS_CHILL} /> {formatPercentage(this.shatterPercent, 0)}%{' '}
          <small>Spells shattered</small>
          <br />
          <SpellIcon spell={SPELLS.FROSTBOLT} /> {formatPercentage(this.preCastPercent, 0)}%{' '}
          <small>Pre-casts shattered</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default WintersChill;
