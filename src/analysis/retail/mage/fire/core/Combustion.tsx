import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import BLOODLUST_BUFFS from 'game/BLOODLUST_BUFFS';
import { SpellLink } from 'interface';
import { highlightInefficientCast } from 'interface/report/Results/Timeline/Casts';
import CASTS_THAT_ARENT_CASTS from 'parser/core/CASTS_THAT_ARENT_CASTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  BeginCastEvent,
  GetRelatedEvent,
  HasRelatedEvent,
} from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class CombustionCasts extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
  };
  protected abilityTracker!: AbilityTracker;

  hasFlameOn: boolean = this.selectedCombatant.hasTalent(TALENTS.FLAME_ON_TALENT);
  hasFlameAccelerant: boolean = this.selectedCombatant.hasTalent(TALENTS.FLAME_ACCELERANT_TALENT);

  combustionCasts: { cast: CastEvent; precast: CastEvent | undefined; delay: number }[] = [];
  combustionCastEvents: CastEvent[] = [];
  fireballs: {
    beginCast: BeginCastEvent;
    cast: CastEvent | undefined;
    startedDuringCombust: boolean;
    finishedDuringCombust: boolean;
  }[] = [];

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.COMBUSTION_TALENT),
      this.onCombust,
    );
    this.addEventListener(
      Events.begincast.by(SELECTED_PLAYER).spell(SPELLS.FIREBALL),
      this.onFireballBegins,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onSpellCast);
  }

  onCombust(event: CastEvent) {
    const precast: CastEvent | undefined = GetRelatedEvent(event, 'PreCast');

    let castDelay = 0;
    if (precast && HasRelatedEvent(precast, 'SpellCast')) {
      const beginCast: BeginCastEvent | undefined = GetRelatedEvent(precast, 'CastBegin');
      castDelay =
        beginCast && precast.timestamp > event.timestamp && beginCast.timestamp < event.timestamp
          ? precast.timestamp - event.timestamp
          : 0;
    }

    this.combustionCasts[event.timestamp] = { cast: event, precast: precast, delay: castDelay };
  }

  onFireballBegins(event: BeginCastEvent) {
    const cast: CastEvent | undefined = GetRelatedEvent(event, 'SpellCast');
    this.fireballs.push({
      beginCast: event,
      cast: cast,
      startedDuringCombust: this.selectedCombatant.hasBuff(TALENTS.COMBUSTION_TALENT.id),
      finishedDuringCombust: cast
        ? this.selectedCombatant.hasBuff(TALENTS.COMBUSTION_TALENT.id, cast.timestamp)
        : false,
    });
  }

  onSpellCast(event: CastEvent) {
    if (
      !this.selectedCombatant.hasBuff(TALENTS.COMBUSTION_TALENT.id) ||
      CASTS_THAT_ARENT_CASTS.includes(event.ability.guid)
    ) {
      return;
    }
    this.combustionCastEvents.push(event);
  }

  //Removing this check for now as it is not relevant, but might become relevant again in the future
  //So just commenting it out for now.
  /*
  lowFireBlastCharges = () => {
    const maxFireBlastCharges = 1 + this.selectedCombatant.getTalentRank(TALENTS.FLAME_ON_TALENT);
    let casts = this.eventHistory.getEvents(EventType.Cast, {
      spell: TALENTS.COMBUSTION_TALENT,
    });

    //Filter out casts where the player was capped or almost capped on charges
    casts = casts.filter(
      (cast) =>
        this.cooldownHistory.chargesAvailable(TALENTS.FIRE_BLAST_TALENT.id, cast.timestamp) <
        maxFireBlastCharges - 1,
    );

    //Highlight bad casts
    const tooltip = 'This Combustion was cast with a low amount of Fire Blast charges.';
    casts.forEach((cast) => highlightInefficientCast(cast, tooltip));

    return casts.length;
  };
  */

  // prettier-ignore
  fireballCastsDuringCombustion = () => {
    let fireballCasts = this.fireballs.filter(e => e.cast && e.finishedDuringCombust)

    //If the Begin Cast event was before Combustion started, then disregard it.
    fireballCasts = fireballCasts.filter(e => e.startedDuringCombust)

    //If the player has Double Lust running, then diregard it.
    fireballCasts = fireballCasts.filter((f) => {
      let activeBuffs = 0;
      Object.keys(BLOODLUST_BUFFS).map((item) => Number(item)).forEach(lust => activeBuffs += this.selectedCombatant.hasBuff(lust, f.cast?.timestamp) ? 1 : 0)
      return activeBuffs < 2 ? true : false;
    })

    //If the player had a Flame Accelerant proc, disregard it.
    if (this.hasFlameAccelerant) {
      fireballCasts = fireballCasts.filter(f => this.selectedCombatant.hasBuff(SPELLS.FLAME_ACCELERANT_BUFF.id));
    }

    const tooltip = `This Fireball was cast during Combustion. Since Combustion has a short duration, you are better off using your instant abilities to get as many instant/free Pyroblasts as possible. If you run out of instant abilities, cast Scorch instead unless you have >100% Haste (Double Lust) or you have a Flame Accelerant proc`;
    fireballCasts.forEach(e => e.cast && highlightInefficientCast(e.cast, tooltip));

    return fireballCasts.length;
  }

  /*
  get fireBlastChargeUtil() {
    return (
      1 -
      this.lowFireBlastCharges() /
        this.abilityTracker.getAbility(TALENTS.COMBUSTION_TALENT.id).casts
    );
  }
  */

  get totalPreCastDelay() {
    let total = 0;
    this.combustionCasts.forEach((cast) => (total += cast.delay));
    return total;
  }

  get totalCombustionCasts() {
    return this.abilityTracker.getAbility(TALENTS.COMBUSTION_TALENT.id).casts;
  }

  get castBreakdown() {
    const castArray: number[][] = [];
    this.combustionCastEvents &&
      this.combustionCastEvents.forEach((c: CastEvent) => {
        const index = castArray.findIndex((arr) => arr.includes(c.ability.guid));
        if (index !== -1) {
          castArray[index][1] += 1;
        } else {
          castArray.push([c.ability.guid, 1]);
        }
      });
    return castArray;
  }

  /*
  get fireBlastThresholds() {
    return {
      actual: this.fireBlastChargeUtil,
      isLessThan: {
        minor: 1,
        average: 0.65,
        major: 0.45,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }
  */

  get combustionCastDelayThresholds() {
    return {
      actual: this.totalPreCastDelay / this.totalCombustionCasts / 1000,
      isGreaterThan: {
        minor: 0.7,
        average: 1,
        major: 1.5,
      },
      style: ThresholdStyle.DECIMAL,
    };
  }

  get fireballDuringCombustionThresholds() {
    return {
      actual: this.fireballCastsDuringCombustion() / this.totalCombustionCasts,
      isGreaterThan: {
        minor: 0,
        average: 0.5,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    /*
    when(this.fireBlastThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> {this.lowFireBlastCharges()}{' '}
          times with less than{' '}
          {this.selectedCombatant.hasTalent(TALENTS.FLAME_ON_TALENT) ? '2' : '1'} charges of{' '}
          <SpellLink spell={SPELLS.FIRE_BLAST} />. Make sure you are saving at least{' '}
          {this.selectedCombatant.hasTalent(TALENTS.FLAME_ON_TALENT) ? '2' : '1'} charges while
          Combustion is on cooldown so you can get as many <SpellLink spell={SPELLS.HOT_STREAK} />{' '}
          procs as possible before Combustion ends.
        </>,
      )
        .icon(TALENTS.COMBUSTION_TALENT.icon)
        .actual(
          <Trans id="mage.fire.suggestions.combustionCharges.flameOn.utilization">
            {formatPercentage(this.fireBlastChargeUtil)}% Utilization
          </Trans>,
        )
        .recommended(`${formatPercentage(recommended)} is recommended`),
    );
    */
    when(this.combustionCastDelayThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          On average, you used <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> with{' '}
          {formatNumber(actual)} seconds left on your pre-cast ability (The spell you were casting
          when you used <SpellLink spell={TALENTS.COMBUSTION_TALENT} />
          ). In order to maximize the number of casts you can get in during{' '}
          <SpellLink spell={TALENTS.COMBUSTION_TALENT} />, it is recommended that you are activating{' '}
          <SpellLink spell={TALENTS.COMBUSTION_TALENT} /> closer to the end of your pre-cast
          (preferably within {recommended} seconds of the cast completing).
        </>,
      )
        .icon(TALENTS.COMBUSTION_TALENT.icon)
        .actual(`${formatNumber(actual)}s Avg. Pre-Cast Delay`)
        .recommended(`${recommended} is recommended`),
    );
    when(this.fireballDuringCombustionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          On average, you cast <SpellLink spell={SPELLS.FIREBALL} />{' '}
          {this.fireballCastsDuringCombustion()} times ({actual.toFixed(2)} per Combustion), during{' '}
          <SpellLink spell={TALENTS.COMBUSTION_TALENT} />. In order to get the most casts (and{' '}
          <SpellLink spell={SPELLS.HOT_STREAK} />
          s) as possible before Combustion ends, you should use your instant abilities like
          <SpellLink spell={SPELLS.FIRE_BLAST} /> or{' '}
          <SpellLink spell={TALENTS.PHOENIX_FLAMES_TALENT} />. If you are running low on charges of
          those spells, or need to conserve charges to make it to the end of the Combustion buff,
          you should cast <SpellLink spell={SPELLS.SCORCH} /> instead of Fireball since it has a
          shorter cast time. The only exception to this is if you have 100% Haste (such as during
          Double Lust), or if you have a proc of{' '}
          <SpellLink spell={TALENTS.FLAME_ACCELERANT_TALENT} />.
        </>,
      )
        .icon(TALENTS.COMBUSTION_TALENT.icon)
        .actual(`${actual.toFixed(2)} Casts Per Combustion`)
        .recommended(`${formatNumber(recommended)} is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        wide
        size="flexible"
        position={STATISTIC_ORDER.CORE(30)}
        tooltip={
          <>
            When Combustion is active, you want to ensure you are only using damage spells that will
            allow you to get as many Pyroblast casts in as possible. Typically, you should be aiming
            to use up your charges of Phoenix Flames and Fire Blast first since they are both
            guaranteed to crit during Combustion. Then if you run out of charges and still have time
            left on Combustion, you can use Scorch to get an additional Pyroblast or two in before
            Combustion ends.
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.COMBUSTION_TALENT}>
          <>
            <table className="table table-condensed">
              <tbody>
                <tr>
                  <td>
                    <small>Spells cast during Combust</small>
                  </td>
                  <td>
                    <small>Total Casts</small>
                  </td>
                  <td>
                    <small>% of Total Combust Casts</small>
                  </td>
                </tr>
                {this.castBreakdown
                  .sort((a, b) => b[1] - a[1])
                  .map((spell) => (
                    <tr key={Number(spell)} style={{ fontSize: 16 }}>
                      <td>
                        <SpellLink spell={Number(spell[0])} />
                      </td>
                      <td style={{ textAlign: 'center' }}>{spell[1]}</td>
                      <td style={{ textAlign: 'center' }}>
                        {formatPercentage(spell[1] / this.combustionCastEvents.length || 0)}%
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default CombustionCasts;
