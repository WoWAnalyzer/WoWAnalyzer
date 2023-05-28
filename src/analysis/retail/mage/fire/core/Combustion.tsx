import { Trans } from '@lingui/macro';
import { SharedCode } from 'analysis/retail/mage/shared';
import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellLink } from 'interface';
import { highlightInefficientCast } from 'interface/report/Results/Timeline/Casts';
import Analyzer from 'parser/core/Analyzer';
import { EventType, CastEvent } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import CooldownHistory from 'parser/shared/modules/CooldownHistory';
import EventHistory from 'parser/shared/modules/EventHistory';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const COMBUSTION_PRE_CASTS = [
  SPELLS.FIREBALL,
  TALENTS.PYROBLAST_TALENT,
  SPELLS.SCORCH,
  TALENTS.FLAMESTRIKE_TALENT,
];

class CombustionCasts extends Analyzer {
  static dependencies = {
    sharedCode: SharedCode,
    abilityTracker: AbilityTracker,
    eventHistory: EventHistory,
    cooldownHistory: CooldownHistory,
  };
  protected sharedCode!: SharedCode;
  protected abilityTracker!: AbilityTracker;
  protected eventHistory!: EventHistory;
  protected cooldownHistory!: CooldownHistory;

  hasFlameOn: boolean = this.selectedCombatant.hasTalent(TALENTS.FLAME_ON_TALENT);

  lowFireBlastCharges = () => {
    const maxFireBlastCharges = 1 + this.selectedCombatant.getTalentRank(TALENTS.FLAME_ON_TALENT);
    let casts = this.eventHistory.getEvents(EventType.Cast, {
      searchBackwards: true,
      spell: TALENTS.COMBUSTION_TALENT,
    });

    //Filter out casts where the player was capped or almost capped on charges
    casts = casts.filter(
      (cast) =>
        this.cooldownHistory.chargesAvailable(TALENTS.FIRE_BLAST_TALENT.id, cast.timestamp) <
        maxFireBlastCharges - 1,
    );

    //Highlight bad casts
    const tooltip =
      'This Combustion was cast with a low amount of Fire Blast and/or Phoenix Flames charges.';
    casts.forEach((cast) => highlightInefficientCast(cast, tooltip));

    return casts.length;
  };

  lowPhoenixFlamesCharges = () => {
    const maxPhoenixFlamesCharges =
      2 + this.selectedCombatant.getTalentRank(TALENTS.CALL_OF_THE_SUN_KING_TALENT);
    let casts = this.eventHistory.getEvents(EventType.Cast, {
      searchBackwards: true,
      spell: TALENTS.COMBUSTION_TALENT,
    });

    //Filter out casts where the player was capped or almost capped on charges
    casts = casts.filter(
      (cast) =>
        this.cooldownHistory.chargesAvailable(TALENTS.PHOENIX_FLAMES_TALENT.id, cast.timestamp) <
        maxPhoenixFlamesCharges - 1,
    );

    //Highlight bad casts
    const tooltip =
      'This Combustion was cast with a low amount of Fire Blast and/or Phoenix Flames charges.';
    casts.forEach((cast) => highlightInefficientCast(cast, tooltip));

    return casts.length;
  };

  //prettier-ignore
  preCastDelay = () => {
    const combustCasts = this.eventHistory.getEvents(EventType.Cast, { searchBackwards: true, spell: TALENTS.COMBUSTION_TALENT });
    const combustionCasts: number[] = [];

    combustCasts.forEach(cast => {
      const preCastBegin = this.eventHistory.getEvents(EventType.BeginCast, { searchBackwards: true, spell: COMBUSTION_PRE_CASTS, count: 1, startTimestamp: cast.timestamp })[0]
      if (preCastBegin && preCastBegin.castEvent) {
        const castDelay = preCastBegin.castEvent.timestamp > cast.timestamp ? preCastBegin.castEvent.timestamp - cast.timestamp : 0
        combustionCasts[cast.timestamp] = castDelay
      }
    })
    return combustionCasts;
  }

  // prettier-ignore
  fireballCastsDuringCombustion = () => {
    
    const casts = this.eventHistory.getEventsWithBuff(TALENTS.COMBUSTION_TALENT, EventType.Cast, SPELLS.FIREBALL);

    //If the Begin Cast event was before Combustion started, then disregard it.
    const fireballCasts = casts.filter((e: CastEvent) => {
      const beginCast = this.eventHistory.getEvents(EventType.BeginCast, { searchBackwards: true, spell: SPELLS.FIREBALL, count: 1, startTimestamp: e.timestamp })[0];
      return beginCast ? this.selectedCombatant.hasBuff(TALENTS.COMBUSTION_TALENT.id, beginCast.timestamp) : false;
    });
    const tooltip = `This Fireball was cast during Combustion. Since Combustion has a short duration, you are better off using your instant abilities to get as many instant/free Pyroblasts as possible. If you run out of instant abilities, cast Scorch instead since it has a shorter cast time.`;
    fireballCasts && highlightInefficientCast(fireballCasts, tooltip);
    return fireballCasts.length;
  }

  get phoenixFlamesChargeUtil() {
    return (
      1 -
      this.lowPhoenixFlamesCharges() /
        this.abilityTracker.getAbility(TALENTS.COMBUSTION_TALENT.id).casts
    );
  }

  get fireBlastChargeUtil() {
    return (
      1 -
      this.lowFireBlastCharges() /
        this.abilityTracker.getAbility(TALENTS.COMBUSTION_TALENT.id).casts
    );
  }

  get totalPreCastDelay() {
    const casts = this.preCastDelay();

    let total = 0;
    casts.forEach((cast) => (total += cast));
    return total;
  }

  get fireballBeginCasts() {
    return (
      this.eventHistory.getEventsWithBuff(
        TALENTS.COMBUSTION_TALENT,
        EventType.BeginCast,
        SPELLS.FIREBALL,
      ).length || 0
    );
  }

  get phoenixFlamesThresholds() {
    return {
      actual: this.phoenixFlamesChargeUtil,
      isLessThan: {
        minor: 1,
        average: 0.65,
        major: 0.45,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

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

  get combustionCastDelayThresholds() {
    return {
      actual:
        this.totalPreCastDelay /
        (this.eventHistory.getEvents(EventType.Cast, {
          searchBackwards: true,
          spell: TALENTS.COMBUSTION_TALENT,
        }).length || 0) /
        1000,
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
      actual:
        this.fireballCastsDuringCombustion() /
          this.eventHistory.getEvents(EventType.Cast, {
            searchBackwards: true,
            spell: TALENTS.COMBUSTION_TALENT,
          }).length || 0,
      isGreaterThan: {
        minor: 0,
        average: 0.5,
        major: 1,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.phoenixFlamesThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> {this.lowPhoenixFlamesCharges()}{' '}
          times with less than 2 charges of <SpellLink id={TALENTS.PHOENIX_FLAMES_TALENT.id} />.
          Make sure you are saving at least 2 charges while Combustion is on cooldown so you can get
          as many <SpellLink id={SPELLS.HOT_STREAK.id} /> procs as possible before Combustion ends.
        </>,
      )
        .icon(TALENTS.COMBUSTION_TALENT.icon)
        .actual(
          <Trans id="mage.fire.suggestions.combustionCharges.phoenixFlames.utilization">
            {formatPercentage(this.phoenixFlamesChargeUtil)}% Utilization
          </Trans>,
        )
        .recommended(`${formatPercentage(recommended)} is recommended`),
    );
    when(this.fireBlastThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> {this.lowFireBlastCharges()}{' '}
          times with less than{' '}
          {this.selectedCombatant.hasTalent(TALENTS.FLAME_ON_TALENT) ? '2' : '1'} charges of{' '}
          <SpellLink id={SPELLS.FIRE_BLAST.id} />. Make sure you are saving at least{' '}
          {this.selectedCombatant.hasTalent(TALENTS.FLAME_ON_TALENT) ? '2' : '1'} charges while
          Combustion is on cooldown so you can get as many <SpellLink id={SPELLS.HOT_STREAK.id} />{' '}
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
    when(this.combustionCastDelayThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          On average, you used <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> with{' '}
          {formatNumber(actual)} seconds left on your pre-cast ability (The spell you were casting
          when you used <SpellLink id={TALENTS.COMBUSTION_TALENT.id} />
          ). In order to maximize the number of casts you can get in during{' '}
          <SpellLink id={TALENTS.COMBUSTION_TALENT.id} />, it is recommended that you are activating{' '}
          <SpellLink id={TALENTS.COMBUSTION_TALENT.id} /> closer to the end of your pre-cast
          (preferably within {recommended} seconds of the cast completing).
        </>,
      )
        .icon(TALENTS.COMBUSTION_TALENT.icon)
        .actual(
          <Trans id="mage.fire.suggestions.combustion.castDelay">
            {formatNumber(actual)}s Avg. Pre-Cast Delay
          </Trans>,
        )
        .recommended(`${recommended} is recommended`),
    );
    when(this.fireballDuringCombustionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You started to cast <SpellLink id={SPELLS.FIREBALL.id} /> {this.fireballBeginCasts} times
          ({this.fireballDuringCombustionThresholds.actual.toFixed(2)} per Combustion), and
          completed {this.fireballCastsDuringCombustion} casts, during{' '}
          <SpellLink id={TALENTS.COMBUSTION_TALENT.id} />. Combustion has a short duration, so you
          are better off using instant abilities like <SpellLink id={SPELLS.FIRE_BLAST.id} /> or{' '}
          <SpellLink id={TALENTS.PHOENIX_FLAMES_TALENT.id} />. If you run out of instant cast
          abilities, use <SpellLink id={SPELLS.SCORCH.id} /> instead of Fireball since it has a
          shorter cast time.
        </>,
      )
        .icon(TALENTS.COMBUSTION_TALENT.icon)
        .actual(
          <Trans id="mage.fire.suggestions.combustion.castsPerCombustion">
            {this.fireballDuringCombustionThresholds.actual.toFixed(2)} Casts Per Combustion
          </Trans>,
        )
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
        <BoringSpellValueText spellId={TALENTS.COMBUSTION_TALENT.id}>
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
                {this.sharedCode
                  .castBreakdownByBuff(true, TALENTS.COMBUSTION_TALENT)
                  .sort((a, b) => b[1] - a[1])
                  .map((spell) => (
                    <tr key={Number(spell)} style={{ fontSize: 16 }}>
                      <td>
                        <SpellLink id={Number(spell[0])} />
                      </td>
                      <td style={{ textAlign: 'center' }}>{spell[1]}</td>
                      <td style={{ textAlign: 'center' }}>
                        {formatPercentage(
                          spell[1] /
                            this.eventHistory.getEventsWithBuff(
                              TALENTS.COMBUSTION_TALENT,
                              EventType.Cast,
                            ).length || 0,
                        )}
                        %
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
