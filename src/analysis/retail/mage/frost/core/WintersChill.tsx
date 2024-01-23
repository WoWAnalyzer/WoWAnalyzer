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
  FightEndEvent,
} from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { BoxRowEntry, PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/frost/Guide';
import WintersChillEvent from 'analysis/retail/mage/frost/core/WintersChillEvent';
import { PerformanceMark } from 'interface/guide';
import { SpellSeq } from 'parser/ui/SpellSeq';

const WINTERS_CHILL_SPENDERS = [SPELLS.ICE_LANCE_DAMAGE.id, SPELLS.GLACIAL_SPIKE_DAMAGE.id];

class WintersChill extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  hasRayOfFrost: boolean = this.selectedCombatant.hasTalent(TALENTS.RAY_OF_FROST_TALENT);
  hasGlacialSpike: boolean = this.selectedCombatant.hasTalent(TALENTS.GLACIAL_SPIKE_TALENT);
  wintersChill: WintersChillEvent[] = [];
  castEntries: BoxRowEntry[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.WINTERS_CHILL),
      this.onWintersChill,
    );
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER)
        .spell([
          SPELLS.FROSTBOLT_DAMAGE,
          SPELLS.GLACIAL_SPIKE_DAMAGE,
          SPELLS.ICE_LANCE_DAMAGE,
          TALENTS.RAY_OF_FROST_TALENT,
        ]),
      this.onDamage,
    );
    this.addEventListener(Events.fightend, this.analyzeCasts);
  }

  onWintersChill(event: ApplyDebuffEvent) {
    const remove: RemoveDebuffEvent | undefined = GetRelatedEvent(event, 'DebuffRemove');
    const flurry: CastEvent | undefined = GetRelatedEvent(event, 'SpellCast');
    const precast: CastEvent | undefined = GetRelatedEvent(event, 'PreCast');
    const precastIcicles =
      (flurry &&
        this.selectedCombatant.getBuff(SPELLS.ICICLES_BUFF.id, flurry.timestamp)?.stacks) ||
      0;
    const wintersChillEvent = new WintersChillEvent(event, remove, precast, precastIcicles, flurry);
    this.wintersChill.push(wintersChillEvent);
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
    if (wintersChillDebuff === -1) {
      return;
    }
    this.wintersChill[wintersChillDebuff].damageEvents?.push(event);
  }

  missedPreCasts = () => {
    //If there is no Pre Cast, or if there is a Precast but it didnt land in Winter's Chlll
    let missingPreCast = this.wintersChill.filter((w) => !w.precast || !w.precastInDamageEvents());

    //If the player had exactly 4 Icicles, disregard it
    missingPreCast = missingPreCast.filter((w) => w.precastIcicles !== 4);

    return missingPreCast.length;
  };

  missedShatters = () => {
    //Winter's Chill Debuffs where there are at least 2 damage hits of Glacial Spike and/or Ice Lance
    let badDebuffs = this.wintersChill.filter((w) => {
      const shatteredSpenders = w.damageEvents.filter((d) =>
        WINTERS_CHILL_SPENDERS.includes(d.ability.guid),
      );
      return shatteredSpenders.length < 2;
    });

    //If they shattered one spell but also they used Ray Of Frost, then disregard it.
    badDebuffs = badDebuffs.filter((w) => {
      const shatteredSpenders = w.damageEvents.filter((d) =>
        WINTERS_CHILL_SPENDERS.includes(d.ability.guid),
      );
      const rayHits = w.damageEvents.filter(
        (d) => d.ability.guid === TALENTS.RAY_OF_FROST_TALENT.id,
      );
      return shatteredSpenders.length !== 1 || rayHits.length < 2;
    });

    return badDebuffs.length;
  };

  get totalProcs() {
    return this.wintersChill.length;
  }

  get shatterPercent() {
    return 1 - this.missedShatters() / this.totalProcs;
  }

  get preCastPercent() {
    return 1 - this.missedPreCasts() / this.totalProcs;
  }

  analyzeCasts(event: FightEndEvent) {
    // this module is only analizyng flurry winter's chill applications
    this.wintersChill
      .filter((wintersChillEvent) => wintersChillEvent.flurry)
      .forEach((winterChill) => {
        const tooltip = (
          <>
            <b>
              @ {this.owner.formatTimestamp(winterChill.apply.timestamp)} -{' '}
              {winterChill.remove && this.owner.formatTimestamp(winterChill.remove.timestamp)}
              <br />
              <PerformanceMark perf={winterChill.getPerformance()} /> {winterChill.getPerformance()}
            </b>
            <br />
            <b>Perf. Details</b>
            <br />
            {winterChill.getPerformanceDetails()}
          </>
        );
        this.castEntries.push({
          value: winterChill.getPerformance(),
          tooltip,
        });
      });
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
          your target {this.missedShatters()} times ({formatPercentage(1 - actual)}%). After
          debuffing the target via <SpellLink spell={TALENTS.BRAIN_FREEZE_TALENT} /> and{' '}
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
          {this.missedPreCasts()} times ({formatPercentage(1 - actual)}%). Because of the travel
          time of <SpellLink spell={TALENTS.FLURRY_TALENT} />, you should cast a damaging ability
          such as <SpellLink spell={SPELLS.FROSTBOLT} /> immediately before using{' '}
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

  get guideSubsection(): JSX.Element {
    const cooldown = {
      id: -1,
      name: 'Cooldown',
      icon: 'inv_misc_questionmark',
    };

    const wintersChill = <SpellLink spell={SPELLS.WINTERS_CHILL} />;
    const flurry = <SpellLink spell={TALENTS.FLURRY_TALENT} />;
    const frostbolt = <SpellLink spell={SPELLS.FROSTBOLT} />;
    const glacialSpike = <SpellLink spell={TALENTS.GLACIAL_SPIKE_TALENT} />;
    const iceLance = <SpellLink spell={TALENTS.ICE_LANCE_TALENT} />;
    const rayOfFrost = <SpellLink spell={TALENTS.RAY_OF_FROST_TALENT} />;

    const cooldownIcon = <SpellIcon spell={cooldown} />;
    const glacialSpikeIcon = <SpellIcon spell={TALENTS.GLACIAL_SPIKE_TALENT} />;
    const iceLanceIcon = <SpellIcon spell={TALENTS.ICE_LANCE_TALENT} />;
    const rayOfFrostIcon = <SpellIcon spell={TALENTS.RAY_OF_FROST_TALENT} />;

    const explanation = (
      <>
        <b>{wintersChill}</b> is an extremely important part of playing Frost effectively.
        <br />
        There are 2 main rules to follow:
        <ul>
          <li>
            <b>Precast</b>
          </li>
          You should cast {this.hasGlacialSpike ? <>{glacialSpike} or </> : ''}
          {frostbolt} before {flurry}.<br />
          {this.hasGlacialSpike && (
            <>
              At 4 <SpellLink spell={SPELLS.MASTERY_ICICLES} /> you can cast {flurry} without
              precast.
              <br />
              <small>
                Precast priority order: {glacialSpike} {frostbolt}{' '}
              </small>
            </>
          )}
          <li>
            <b>{wintersChill} stacks</b>
          </li>
          Consume both {wintersChill} stacks with {this.hasGlacialSpike && <>{glacialSpike} or </>}
          {iceLance}.<br />
          {this.hasRayOfFrost && (
            <>
              If {rayOfFrost} is available, use it at 1 stack of {wintersChill}.<br />
            </>
          )}
          <small>
            Priority order: {this.hasRayOfFrost && <>{rayOfFrost} </>}
            {this.hasGlacialSpike && <>{glacialSpike} </>}
            {iceLance}
          </small>
        </ul>
        Your rotations should look like this: <br />
        <SpellSeq spells={[SPELLS.FROSTBOLT, TALENTS.FLURRY_TALENT, cooldown, cooldown]} /> <br />
        <SpellSeq
          spells={[TALENTS.GLACIAL_SPIKE_TALENT, TALENTS.FLURRY_TALENT, cooldown, cooldown]}
        />{' '}
        <br />
        filling the {cooldownIcon}s with {this.hasGlacialSpike && <>{glacialSpikeIcon} </>},{' '}
        {iceLanceIcon} or
        {this.hasRayOfFrost && <>{rayOfFrostIcon} </>} following the rules and priorities above.
      </>
    );
    const data = (
      <div>
        <RoundedPanel>
          <strong>Cast details</strong>
          <PerformanceBoxRow values={this.castEntries} />
          <small>green (good) / red (fail) mouseover the rectangles to see more details</small>
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      "Winter's Chill",
    );
  }
}

export default WintersChill;
