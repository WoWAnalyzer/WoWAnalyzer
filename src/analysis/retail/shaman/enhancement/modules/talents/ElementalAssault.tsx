import { TALENTS_SHAMAN } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { STORMSTRIKE_DAMAGE_SPELLS } from '../../constants';
import { MaelstromWeaponTracker } from '../resourcetracker';
import TalentAggregateStatisticContainer from 'parser/ui/TalentAggregateStatisticContainer';
import { SpellLink } from 'interface';
import TalentAggregateBars, { TalentAggregateBarSpec } from 'parser/ui/TalentAggregateStatistic';
import SPELLS, { maybeGetSpell } from 'common/SPELLS';
import { TalentRankTooltip } from 'parser/ui/TalentSpellText';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';

const ELEMENTAL_ASSAULT_RANKS: Record<number, number> = {
  1: 0.1,
  2: 0.2,
};

const ELEMENTAL_ASSAULT_SPELLS: number[] = [
  TALENTS_SHAMAN.STORMSTRIKE_TALENT.id,
  TALENTS_SHAMAN.LAVA_LASH_TALENT.id,
  TALENTS_SHAMAN.ICE_STRIKE_TALENT.id,
];

const BAR_COLORS: Record<number, string> = {
  [TALENTS_SHAMAN.STORMSTRIKE_TALENT.id]: '#3b7fb0',
  [TALENTS_SHAMAN.LAVA_LASH_TALENT.id]: '#f37735',
  [TALENTS_SHAMAN.ICE_STRIKE_TALENT.id]: '#94d3ec',
};

/**
 * Stormstrike damage is increased by [10/20]%, and Stormstrike, Lava Lash, and Ice Strike
 * have a [50/100]% chance to generate 1 stack of Maelstrom Weapon.
 *
 * Example Log:
 *
 */
class ElementalAssault extends Analyzer {
  static dependencies = {
    maelstromTracker: MaelstromWeaponTracker,
    abilityTracker: AbilityTracker,
  };
  protected maelstromTracker!: MaelstromWeaponTracker;
  protected abilityTracker!: AbilityTracker;

  protected damageIncrease: number = 0;
  protected damageGained: number = 0;
  protected talentRanks: number = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_SHAMAN.ELEMENTAL_ASSAULT_TALENT);

    if (!this.active) {
      return;
    }

    this.talentRanks = this.selectedCombatant.getTalentRank(
      TALENTS_SHAMAN.ELEMENTAL_ASSAULT_TALENT,
    );
    this.damageIncrease = ELEMENTAL_ASSAULT_RANKS[this.talentRanks];

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(STORMSTRIKE_DAMAGE_SPELLS),
      this.onStormstrikeDamage,
    );
  }

  onStormstrikeDamage(event: DamageEvent): void {
    this.damageGained += calculateEffectiveDamage(event, this.damageIncrease);
  }

  get maelstromGenerators() {
    const elementalAssaultBuilders = Object.keys(this.maelstromTracker.buildersObj)
      .map((abilityId) => {
        const id = Number(abilityId);
        const ability = this.abilityTracker.getAbility(id);
        return {
          abilityId: id,
          casts: ability.casts,
          total:
            this.maelstromTracker.buildersObj[id].generated +
            this.maelstromTracker.buildersObj[id].wasted,
        };
      })
      .filter((ability) => ELEMENTAL_ASSAULT_SPELLS.includes(ability.abilityId));

    // if the combatant has the swirling maelstrom, assume SW generated the first stack as it's guaranteed. EA is only guaranteed with 2 points
    if (this.selectedCombatant.hasTalent(TALENTS_SHAMAN.SWIRLING_MAELSTROM_TALENT)) {
      const iceStrike = elementalAssaultBuilders.find(
        (x) => x.abilityId === TALENTS_SHAMAN.ICE_STRIKE_TALENT.id,
      );
      if (iceStrike) {
        iceStrike.total -= iceStrike.casts;
      }
    }
    return elementalAssaultBuilders;
  }

  get maelstromWeaponGained() {
    return this.maelstromGenerators.reduce((total, ability) => (total += ability.total), 0);
  }

  makeBars(): TalentAggregateBarSpec[] {
    return this.maelstromGenerators.map((generator) => {
      const spell = maybeGetSpell(generator.abilityId);
      return {
        spell: spell!,
        amount: generator.total,
        color: BAR_COLORS[generator.abilityId],
        subSpecs: [],
      };
    });
  }

  statistic() {
    const totalMaelstrom = this.maelstromWeaponGained;
    return (
      <TalentAggregateStatisticContainer
        title={
          <>
            <SpellLink spell={TALENTS_SHAMAN.ELEMENTAL_ASSAULT_TALENT} />
            <TalentRankTooltip rank={this.talentRanks} maxRanks={2} /> -{' '}
            <ItemDamageDone amount={this.damageGained} />
          </>
        }
        footer={
          <>
            Total <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} />: {totalMaelstrom}
            {this.talentRanks === 2 ? <> ({totalMaelstrom / 2} per point)</> : null}
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

export default ElementalAssault;
