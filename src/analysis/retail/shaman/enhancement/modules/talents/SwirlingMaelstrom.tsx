import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options } from 'parser/core/Analyzer';
import TalentAggregateStatisticContainer from 'parser/ui/TalentAggregateStatisticContainer';
import { SpellLink } from 'interface';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentAggregateBars from 'parser/ui/TalentAggregateStatistic';
import SPELLS from 'common/SPELLS';
import MaelstromWeaponTracker from 'analysis/retail/shaman/enhancement/modules/resourcetracker/MaelstromWeaponTracker';

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

  statistic() {
    const frostShock = this.maelstromWeaponTracker.buildersObj[TALENTS.FROST_SHOCK_TALENT.id];
    // copy builderObj for ice strike or calculations will replace builder values
    const iceStrike = { ...this.maelstromWeaponTracker.buildersObj[TALENTS.ICE_STRIKE_TALENT.id] };
    iceStrike.generated = Math.floor(
      iceStrike.generated /
        (this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_ASSAULT_TALENT) ? 2 : 1),
    );
    iceStrike.wasted = Math.ceil(
      iceStrike.wasted /
        (this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_ASSAULT_TALENT) ? 2 : 1),
    );

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
