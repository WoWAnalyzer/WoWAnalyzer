import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, {
  CastEvent,
  DamageEvent,
  EventType,
  GetRelatedEvent,
  ResourceChangeEvent,
} from 'parser/core/Events';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { STORMSTRIKE_DAMAGE_SPELLS } from '../../constants';
import { MaelstromWeaponTracker } from '../resourcetracker';
import TalentAggregateStatisticContainer from 'parser/ui/TalentAggregateStatisticContainer';
import { SpellLink } from 'interface';
import TalentAggregateBars, { TalentAggregateBarSpec } from 'parser/ui/TalentAggregateStatistic';
import SPELLS from 'common/SPELLS';
import { TalentRankTooltip } from 'parser/ui/TalentSpellText';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import { MAELSTROM_WEAPON_SOURCE } from '../normalizers/constants';
import typedKeys from 'common/typedKeys';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';

const ELEMENTAL_ASSAULT_RANKS: Record<number, number> = {
  1: 0.1,
  2: 0.2,
};

const BAR_COLORS: Record<number, string> = {
  [SPELLS.STORMSTRIKE.id]: '#3b7fb0',
  [TALENTS.LAVA_LASH_TALENT.id]: '#f37735',
  [TALENTS.ICE_STRIKE_1_ENHANCEMENT_TALENT.id]: '#94d3ec',
  [TALENTS.ICE_STRIKE_2_ENHANCEMENT_TALENT.id]: '#94d3ec',
  [-1]: '#532121', // wasted
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

  protected elementalAssaultGenerators: {
    [spellId: number]: { generated: number; wasted: number };
  } = {};

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.ELEMENTAL_ASSAULT_TALENT);

    if (!this.active) {
      return;
    }

    this.talentRanks = this.selectedCombatant.getTalentRank(TALENTS.ELEMENTAL_ASSAULT_TALENT);
    this.damageIncrease = ELEMENTAL_ASSAULT_RANKS[this.talentRanks];

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(STORMSTRIKE_DAMAGE_SPELLS),
      this.onStormstrikeDamage,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(TALENTS.ELEMENTAL_ASSAULT_TALENT),
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
      const spellId =
        cast.ability.guid === SPELLS.WINDSTRIKE_CAST.id ? SPELLS.STORMSTRIKE.id : cast.ability.guid;
      if (!this.elementalAssaultGenerators[spellId]) {
        this.elementalAssaultGenerators[spellId] = { generated: 0, wasted: 0 };
      }
      this.elementalAssaultGenerators[spellId].generated += 1;
      this.elementalAssaultGenerators[spellId].wasted += event.waste;
    }
  }

  onStormstrikeDamage(event: DamageEvent): void {
    this.damageGained += calculateEffectiveDamage(event, this.damageIncrease);
  }

  get maelstromWeaponGained() {
    return typedKeys(this.elementalAssaultGenerators).reduce(
      (total, spellId) => (total += this.elementalAssaultGenerators[spellId].generated),
      0,
    );
  }

  makeBars(): TalentAggregateBarSpec[] {
    return typedKeys(this.elementalAssaultGenerators).map((spellId) => {
      const spell = maybeGetTalentOrSpell(spellId)!;
      const builder = this.elementalAssaultGenerators[spellId];
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
    const totalMaelstrom = this.maelstromWeaponGained;
    return (
      <TalentAggregateStatisticContainer
        title={
          <>
            <SpellLink spell={TALENTS.ELEMENTAL_ASSAULT_TALENT} />
            <TalentRankTooltip rank={this.talentRanks} maxRanks={2} /> -{' '}
            <ItemDamageDone amount={this.damageGained} />
          </>
        }
        footer={
          this.talentRanks === 2 && (
            <>
              <SpellLink spell={SPELLS.MAELSTROM_WEAPON_BUFF} /> per point: {totalMaelstrom / 2}
            </>
          )
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
