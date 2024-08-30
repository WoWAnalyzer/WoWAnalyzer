import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  EventType,
  GetRelatedEvent,
  ResourceChangeEvent,
} from 'parser/core/Events';
import TalentAggregateStatisticContainer from 'parser/ui/TalentAggregateStatisticContainer';
import { SpellLink } from 'interface';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentAggregateBars from 'parser/ui/TalentAggregateStatistic';
import SPELLS from 'common/SPELLS';
import { MAELSTROM_WEAPON_SOURCE } from '../normalizers/constants';

const BAR_COLORS: Record<number, string> = {
  [TALENTS.FROST_SHOCK_TALENT.id]: '#3b7fb0',
  [TALENTS.FIRE_NOVA_TALENT.id]: '#f37735', // placeholder for when fire nova is implemented
  [TALENTS.ICE_STRIKE_TALENT.id]: '#94d3ec',
  [-1]: '#532121', // wasted
};

/**
 * Consuming at least 2 stacks of Hailstorm, using Ice Strike, and each explosion
 * from Fire Nova now also grants you 1 stack of Maelstrom Weapon.
 */

class SwirlingMaelstrom extends Analyzer {
  static dependencies = {
    maelstromWeaponTracker: MaelstromWeaponTracker,
  };

  maelstromWeaponTracker!: MaelstromWeaponTracker;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.SWIRLING_MAELSTROM_TALENT);
    if (!this.active) {
      return;
    }
  }

    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(TALENTS.SWIRLING_MAELSTROM_TALENT),
      this.onResourceChange,
    );

  onResourceChange(event: ResourceChangeEvent) {
    const cast = GetRelatedEvent<CastEvent>(
      event,
      MAELSTROM_WEAPON_SOURCE,
      (e) => e.type === EventType.Cast,
    );
    switch (cast?.ability.guid) {
      case TALENTS.FROST_SHOCK_TALENT.id:
        this.frostShock += 1;
        break;
      case TALENTS.ICE_STRIKE_TALENT.id:
        this.iceStrike += 1;
        break;
    }
  }

  statistic() {
    const bars = [
      {
        spell: TALENTS.FROST_SHOCK_TALENT,
        amount: frostShock.generated,
        color: BAR_COLORS[TALENTS.FROST_SHOCK_TALENT.id],
        tooltip: <>{frostShock.generated} generated</>,
        subSpecs: [
          {
            spell: TALENTS.FROST_SHOCK_TALENT,
            amount: frostShock.wasted,
            color: BAR_COLORS[-1],
            tooltip: <>{frostShock.wasted} wasted</>,
          },
        ],
      },
      {
        spell: TALENTS.ICE_STRIKE_TALENT,
        amount: iceStrike.generated,
        color: BAR_COLORS[TALENTS.ICE_STRIKE_TALENT.id],
        tooltip: <>{iceStrike.generated} generated</>,
        subSpecs: [
          {
            spell: TALENTS.ICE_STRIKE_TALENT,
            amount: iceStrike.wasted,
            color: BAR_COLORS[-1],
            tooltip: <>{iceStrike.wasted} wasted</>,
          },
        ],
      },
    ];
    return (
      <TalentAggregateStatisticContainer
        title={
          <>
            <SpellLink spell={TALENTS.SWIRLING_MAELSTROM_TALENT} />
          </>
        }
        footer={
          <>
            Total <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} />:{' '}
            {bars.reduce((t, b) => (t += b.amount + b.subSpecs[0].amount), 0)}
          </>
        }
        smallFooter
        position={STATISTIC_ORDER.DEFAULT}
        category={STATISTIC_CATEGORY.TALENTS}
        wide
      >
        <TalentAggregateBars bars={bars} wide />
      </TalentAggregateStatisticContainer>
    );
  }
}

export default SwirlingMaelstrom;
