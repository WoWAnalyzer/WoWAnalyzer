import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { Options } from 'parser/core/Module';
import Events, { DamageEvent, EventType, HealEvent } from 'parser/core/Events';
import { SELECTED_PLAYER } from 'parser/core/Analyzer';
import SpellLink from 'interface/SpellLink';
import { SubSection } from 'interface/guide';
import Explanation from 'interface/guide/components/Explanation';
import CooldownGrid from 'interface/CooldownGrid/CooldownGrid';
import CommonCelestialConduit, {
  CastInfo,
} from '../../../shared/hero/ConduitOfTheCelestials/talents/CelestialConduit';
import { CELESTIAL_CONDUIT_MAX_DURATION } from '../../../shared/hero/ConduitOfTheCelestials/constants';

const CONDUIT = TALENTS_MONK.CELESTIAL_CONDUIT_MISTWEAVER_TALENT;
// 1 pulse on cast + 4 hasted ticks
const FULL_CHANNEL_PULSES = 5;
const PULSE_GROUP_MS = 100;

class CelestialConduit extends CommonCelestialConduit {
  private pulses = new Map<CastInfo, number>();
  private lastPulseTimestamp = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(CONDUIT);

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.CELESTIAL_CONDUIT_HEAL),
      this.onPulseEvent,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.CELESTIAL_CONDUIT_DAMAGE),
      this.onPulseEvent,
    );
    this.addEventListener(Events.fightend, this.onFightEndPulses);
  }

  private onPulseEvent(event: HealEvent | DamageEvent) {
    const cast = this.castInfoList.at(-1);
    if (!cast) {
      return;
    }
    if (event.timestamp - this.lastPulseTimestamp > PULSE_GROUP_MS) {
      this.pulses.set(cast, (this.pulses.get(cast) ?? 0) + 1);
    }
    this.lastPulseTimestamp = event.timestamp;
  }

  // last pulse can land after the buff fades
  private onFightEndPulses() {
    this.castInfoList.forEach((cast) => {
      cast.cancelled = (this.pulses.get(cast) ?? 0) < FULL_CHANNEL_PULSES;
    });
    this.cancelledCasts = this.castInfoList.filter((cast) => cast.cancelled).length;
  }

  get guideCastBreakdown() {
    const explanation = (
      <p>
        Before casting <SpellLink spell={CONDUIT} />, make sure that all spells reduced by{' '}
        <SpellLink spell={TALENTS_MONK.HEART_OF_THE_JADE_SERPENT_TALENT} /> are on cooldown so that
        the extra CDR granted when casting <SpellLink spell={TALENTS_MONK.UNITY_WITHIN_TALENT} /> is
        not wasted. Additionally, make sure to never cancel the spell and to hit at least 5 targets
        in order to get the maximum healing/damage buff (up to 30%).
      </p>
    );

    const items = this.castInfoList.map((cast) => {
      const analysis = this.getChecklistForCast(cast);
      return {
        perf: analysis.perf,
        checklistItems: analysis.items,
        range: {
          start: cast.timestamp,
          end: Math.min(
            cast.channelEnd ?? cast.timestamp + CELESTIAL_CONDUIT_MAX_DURATION,
            this.owner.fight.end_time,
          ),
        },
      };
    });

    return (
      <SubSection title={<SpellLink spell={CONDUIT} />}>
        <Explanation>{explanation}</Explanation>
        <CooldownGrid
          label={<SpellLink spell={CONDUIT} />}
          timeline={{
            cooldowns: [TALENTS_MONK.UNITY_WITHIN_TALENT],
            cooldownLegend: true,
          }}
          table={{
            type: EventType.Heal,
            abilityFilter: [
              SPELLS.CELESTIAL_CONDUIT_HEAL,
              SPELLS.STRENGTH_OF_THE_BLACK_OX_SHIELD,
              SPELLS.COURAGE_OF_THE_WHITE_TIGER_HEAL,
              SPELLS.FLIGHT_OF_THE_RED_CRANE_HEAL,
            ],
            omitOtherRow: true,
          }}
          items={items}
        />
      </SubSection>
    );
  }
}

export default CelestialConduit;
