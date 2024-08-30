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
import TalentAggregateBars, { TalentAggregateBarSpec } from 'parser/ui/TalentAggregateStatistic';
import SPELLS from 'common/SPELLS';
import { MAELSTROM_WEAPON_SOURCE } from '../normalizers/constants';
import { MaelstromWeaponTracker } from '../resourcetracker';
import typedKeys from 'common/typedKeys';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';

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

  protected swirlingMaelstromGenerators: {
    [spellId: number]: { generated: number; wasted: number };
  } = {};

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.SWIRLING_MAELSTROM_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(TALENTS.SWIRLING_MAELSTROM_TALENT),
      this.onResourceChange,
    );
  }

  onResourceChange(event: ResourceChangeEvent) {
    const cast = GetRelatedEvent<CastEvent>(
      event,
      MAELSTROM_WEAPON_SOURCE,
      (e) => e.type === EventType.Cast,
    );
    if (cast) {
      const spellId = cast.ability.guid;
      if (!this.swirlingMaelstromGenerators[spellId]) {
        this.swirlingMaelstromGenerators[spellId] = { generated: 0, wasted: 0 };
      }
      this.swirlingMaelstromGenerators[spellId].generated += 1;
      this.swirlingMaelstromGenerators[spellId].wasted += event.waste;
    }
  }

  get maelstromWeaponGained() {
    return typedKeys(this.swirlingMaelstromGenerators).reduce(
      (total, spellId) => (total += this.swirlingMaelstromGenerators[spellId].generated),
      0,
    );
  }

  makeBars(): TalentAggregateBarSpec[] {
    return typedKeys(this.swirlingMaelstromGenerators).map((spellId) => {
      const spell = maybeGetTalentOrSpell(spellId)!;
      const builder = this.swirlingMaelstromGenerators[spellId];
      return {
        spell: spell,
        amount: builder.generated - builder.wasted,
        color: BAR_COLORS[spellId],
        tooltip: <>{builder.generated - builder.wasted}</>,
        subSpecs: [
          {
            spell: spell,
            amount: builder.wasted,
            color: BAR_COLORS[-1],
            tooltip: <>{builder.wasted} wasted</>,
          },
        ],
      };
    });
  }

  statistic() {
    return (
      <TalentAggregateStatisticContainer
        title={
          <>
            <SpellLink spell={TALENTS.SWIRLING_MAELSTROM_TALENT} />
          </>
        }
        footer={
          <>
            Total <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} />: {this.maelstromWeaponGained}
          </>
        }
        smallFooter
        position={STATISTIC_ORDER.DEFAULT}
        category={STATISTIC_CATEGORY.TALENTS}
        wide
      >
        <TalentAggregateBars bars={this.makeBars()} wide />
      </TalentAggregateStatisticContainer>
    );
  }
}

export default SwirlingMaelstrom;
