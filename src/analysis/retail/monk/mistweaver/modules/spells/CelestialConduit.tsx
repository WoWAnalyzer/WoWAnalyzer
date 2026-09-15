import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { Options } from 'parser/core/Module';
import { EventType } from 'parser/core/Events';
import SpellLink from 'interface/SpellLink';
import { SubSection } from 'interface/guide';
import Explanation from 'interface/guide/components/Explanation';
import CooldownGrid from 'interface/CooldownGrid/CooldownGrid';
import CommonCelestialConduit from '../../../shared/hero/ConduitOfTheCelestials/talents/CelestialConduit';
import { CELESTIAL_CONDUIT_MAX_DURATION } from '../../../shared/hero/ConduitOfTheCelestials/constants';

const CONDUIT = TALENTS_MONK.CELESTIAL_CONDUIT_MISTWEAVER_TALENT;

class CelestialConduit extends CommonCelestialConduit {
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(CONDUIT);
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
