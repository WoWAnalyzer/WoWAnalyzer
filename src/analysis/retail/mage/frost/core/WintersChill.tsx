import { Trans } from '@lingui/macro';
import { formatPercentage, formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { SpellIcon } from 'interface';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import { EventType } from 'parser/core/Events';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import EventHistory from 'parser/shared/modules/EventHistory';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const WINTERS_CHILL_SPENDERS = [
  SPELLS.ICE_LANCE_DAMAGE,
  SPELLS.GLACIAL_SPIKE_DAMAGE,
  TALENTS.ICE_NOVA_TALENT,
  TALENTS.RAY_OF_FROST_TALENT,
];

const WINTERS_CHILL_PRECAST_CASTS = [SPELLS.FROSTBOLT, TALENTS.GLACIAL_SPIKE_TALENT];

const WINTERS_CHILL_PRECAST_DAMAGE = [SPELLS.FROSTBOLT_DAMAGE, SPELLS.GLACIAL_SPIKE_DAMAGE];

const debug = false;

class WintersChill extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    eventHistory: EventHistory,
  };
  protected enemies!: Enemies;
  protected eventHistory!: EventHistory;

  hasGlacialSpike: boolean = this.selectedCombatant.hasTalent(TALENTS.GLACIAL_SPIKE_TALENT);

  wintersChillHardCasts = () => {
    let debuffApplies = this.eventHistory.getEvents(EventType.ApplyDebuff, {
      searchBackwards: true,
      spell: SPELLS.WINTERS_CHILL,
    });

    //Filter out buffs where there was not a valid precast before Winter's Chill was applied or the precast didnt land in Winter's Chill
    debuffApplies = debuffApplies.filter((e) => {
      const debuffRemoved = this.eventHistory.getEvents(EventType.RemoveDebuff, {
        searchBackwards: false,
        spell: SPELLS.WINTERS_CHILL,
        count: 1,
        startTimestamp: e.timestamp,
      })[0];
      const preCast = this.eventHistory.getEvents(EventType.Cast, {
        searchBackwards: true,
        spell: WINTERS_CHILL_PRECAST_CASTS,
        count: 1,
        startTimestamp: e.timestamp,
        duration: 1000,
      })[0];
      if (!preCast) {
        debug &&
          this.log(
            'PRECAST NOT FOUND @' + formatDuration(e.timestamp - this.owner.fight.start_time),
          );
        return false;
      }

      //Check to see if the precast landed in Winter's Chill
      const duration = debuffRemoved
        ? debuffRemoved.timestamp - e.timestamp
        : this.owner.fight.end_time - e.timestamp;
      const damageEvents = this.eventHistory.getEvents(EventType.Damage, {
        searchBackwards: false,
        spell: WINTERS_CHILL_PRECAST_DAMAGE,
        startTimestamp: preCast.timestamp,
        duration: duration,
      });
      if (!damageEvents || damageEvents.length === 0) {
        debug &&
          this.log(
            'PRECAST DAMAGE NOT FOUND @' +
              formatDuration(e.timestamp - this.owner.fight.start_time),
          );
        return false;
      }

      //Check if the target had Winter's Chill
      let preCastHits = 0;
      damageEvents.forEach((d) => {
        const enemy = this.enemies.getEntity(d);
        if (enemy && enemy.hasBuff(SPELLS.WINTERS_CHILL.id, d.timestamp)) {
          preCastHits += 1;
        }
      });
      if (preCastHits < 1) {
        debug &&
          this.log(
            'PRECAST DAMAGE NOT SHATTERED @ ' +
              formatDuration(e.timestamp - this.owner.fight.start_time),
          );
        return false;
      }
      return true;
    });
    return debuffApplies.length;
  };

  wintersChillShatters = () => {
    let debuffApplies = this.eventHistory.getEvents(EventType.ApplyDebuff, {
      searchBackwards: true,
      spell: SPELLS.WINTERS_CHILL,
    });

    //Filter out buffs where both stacks of Winter's Chill were used before Winter's Chill expired
    debuffApplies = debuffApplies.filter((e) => {
      const debuffRemoved = this.eventHistory.getEvents(EventType.RemoveDebuff, {
        searchBackwards: false,
        spell: SPELLS.WINTERS_CHILL,
        count: 1,
        startTimestamp: e.timestamp,
      })[0];
      const duration = debuffRemoved
        ? debuffRemoved.timestamp - e.timestamp
        : this.owner.fight.end_time - e.timestamp;
      const damageEvents = this.eventHistory.getEvents(EventType.Damage, {
        searchBackwards: false,
        spell: WINTERS_CHILL_SPENDERS,
        startTimestamp: e.timestamp,
        duration: duration,
      });
      if (!damageEvents) {
        return false;
      }

      //Check if the target had Winter's Chill
      let shatteredCasts = 0;
      damageEvents.forEach((d) => {
        const enemy = this.enemies.getEntity(d);
        if (enemy && enemy.hasBuff(SPELLS.WINTERS_CHILL.id, d.timestamp)) {
          shatteredCasts += 1;
        }
      });
      debug &&
        this.log(
          'Shattered Casts: ' +
            shatteredCasts +
            ' @ ' +
            formatDuration(e.timestamp - this.owner.fight.start_time),
        );
      return shatteredCasts >= 2;
    });
    return debuffApplies.length;
  };

  get totalProcs() {
    return this.eventHistory.getEvents(EventType.ApplyDebuff, {
      searchBackwards: true,
      spell: SPELLS.WINTERS_CHILL,
    }).length;
  }

  get missedShatters() {
    return this.totalProcs - this.wintersChillShatters();
  }

  get shatterPercent() {
    return this.wintersChillShatters() / this.totalProcs || 0;
  }

  get missedPreCasts() {
    return this.totalProcs - this.wintersChillHardCasts();
  }

  get preCastPercent() {
    return this.wintersChillHardCasts() / this.totalProcs || 0;
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
        .actual(
          <Trans id="mage.frost.suggestions.wintersChill.notShatteredIceLance">
            {formatPercentage(1 - actual)}% Winter's Chill not shattered with Ice Lance
          </Trans>,
        )
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
          <SpellLink spell={TALENTS.SHATTER_TALENT} />.
        </>,
      )
        .icon(SPELLS.FROSTBOLT.icon)
        .actual(
          <Trans id="mage.frost.suggestions.wintersChill.notShattered">
            {formatPercentage(1 - actual)}% Winter's Chill not shattered with Frostbolt, Glacial
            Spike, or Ebonbolt
          </Trans>,
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
