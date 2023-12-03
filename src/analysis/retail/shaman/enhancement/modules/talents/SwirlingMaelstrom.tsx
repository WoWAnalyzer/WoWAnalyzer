import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, GetRelatedEvents } from 'parser/core/Events';
import { MAELSTROM_GENERATOR_LINK } from '../normalizers/EventLinkNormalizer';
import TalentAggregateStatisticContainer from 'parser/ui/TalentAggregateStatisticContainer';
import { SpellLink } from 'interface';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentAggregateBars from 'parser/ui/TalentAggregateStatistic';

const BAR_COLORS: Record<number, string> = {
  [TALENTS.FROST_SHOCK_TALENT.id]: '#3b7fb0',
  [TALENTS.FIRE_NOVA_TALENT.id]: '#f37735', // placeholder for when fire nova is implemented
  [TALENTS.ICE_STRIKE_TALENT.id]: '#94d3ec',
};

/**
 * Consuming at least 2 stacks of Hailstorm, using Ice Strike, and each explosion
 * from Fire Nova now also grants you 1 stack of Maelstrom Weapon.
 */

class SwirlingMaelstrom extends Analyzer {
  protected frostShock: number = 0;
  protected iceStrike: number = 0;
  protected fireNova: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.SWIRLING_MAELSTROM_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast
        .by(SELECTED_PLAYER)
        .spell([TALENTS.FROST_SHOCK_TALENT, TALENTS.ICE_STRIKE_TALENT]),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    if (GetRelatedEvents(event, MAELSTROM_GENERATOR_LINK)) {
      if (event.ability.guid === TALENTS.FROST_SHOCK_TALENT.id) {
        this.frostShock += 1;
      } else if (event.ability.guid === TALENTS.ICE_STRIKE_TALENT.id) {
        this.iceStrike += 1;
      }
    }
  }

  statistic() {
    const bars = [
      {
        spell: TALENTS.FROST_SHOCK_TALENT,
        amount: this.frostShock,
        color: BAR_COLORS[TALENTS.FROST_SHOCK_TALENT.id],
        subSpecs: [],
      },
      {
        spell: TALENTS.ICE_STRIKE_TALENT,
        amount: this.iceStrike,
        color: BAR_COLORS[TALENTS.ICE_STRIKE_TALENT.id],
        subSpecs: [],
      },
    ];
    return (
      <TalentAggregateStatisticContainer
        title={
          <>
            <SpellLink spell={TALENTS.SWIRLING_MAELSTROM_TALENT} />
          </>
        }
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
