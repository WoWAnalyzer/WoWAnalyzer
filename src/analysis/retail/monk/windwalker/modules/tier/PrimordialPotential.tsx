import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER, SELECTED_PLAYER_PET } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import DonutChart from 'parser/ui/DonutChart';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { damageToCast } from '../../castDamage';
import {
  ABILITIES_THAT_CONSUME_PRIMORDIAL_POWER,
  DAMAGE_AFFECTED_BY_PRIMORDIAL_POWER,
  DAMAGE_AFFECTED_BY_PRIMORDIAL_POWER_NAIVELY,
} from '../../constants';
import { TIERS } from 'game/TIERS';

const abilityColors = {
  [SPELLS.BLACKOUT_KICK.id]: '#88265e',
  [SPELLS.CHI_BURST_TALENT.id]: '#a23b5e',
  [SPELLS.CHI_WAVE_TALENT.id]: '#b8535f',
  [SPELLS.CRACKLING_JADE_LIGHTNING.id]: '#c96d62',
  [SPELLS.FAELINE_STOMP_CAST.id]: '#d78869',
  [SPELLS.FIST_OF_THE_WHITE_TIGER_TALENT.id]: '#e2a474',
  [SPELLS.FISTS_OF_FURY_CAST.id]: '#eabf85',
  [SPELLS.FLYING_SERPENT_KICK.id]: '#d3bd77',
  [TALENTS_MONK.RISING_SUN_KICK_TALENT.id]: '#ffc425',
  [SPELLS.RUSHING_JADE_WIND.id]: '#9bb76c',
  [SPELLS.SPINNING_CRANE_KICK.id]: '#7ab36e',
  [SPELLS.TIGER_PALM.id]: '#0aa981',
  [SPELLS.WHIRLING_DRAGON_PUNCH_TALENT.id]: '#54af76',
} as const;

/** _After 10 offensive abilities, your next 3 offensive abilities deal an additional 22% damage._ */
const PP_MOD = 0.22;

/**
 * Monk Tier 28 "Garb of the Grand Upwelling" 4-Set Bonus for Windwalker
 *
 * Example logs:
 * - https://www.warcraftlogs.com/reports/1C4JhKbgyvRmQnX3#fight=31&type=damage-done&source=1
 * - JI+PP https://www.warcraftlogs.com/reports/mtvQXwYWJGFKbn3p/#fight=5&type=damage-done&source=257
 * - Faeline https://www.warcraftlogs.com/reports/nbg2DqdJQhryfApC/#fight=12&type=damage-done&source=82
 */
class PrimordialPotential extends Analyzer {
  numberPoweredCasts = 0;
  /** IDs of abilities casts that was cast during Primordial Power */
  poweredCasts: { [spellID: number]: number } = {};
  totalDamage = 0;
  /** If id is in Set, the last cast was B00STED, if any unpowered cast is detected, remove from set */
  wasLastCastPowered = new Set<number>();

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has4PieceByTier(TIERS.T28);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(ABILITIES_THAT_CONSUME_PRIMORDIAL_POWER),
      this.onCast,
    );
    this.addEventListener(
      Events.damage
        .by(SELECTED_PLAYER | SELECTED_PLAYER_PET)
        .spell(DAMAGE_AFFECTED_BY_PRIMORDIAL_POWER),
      this.onDamage,
    );
  }

  onCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(SPELLS.PRIMORDIAL_POWER_BUFF.id)) {
      this.wasLastCastPowered.delete(event.ability.guid);
      return;
    }

    this.wasLastCastPowered.add(event.ability.guid);

    this.numberPoweredCasts += 1;

    if (!this.poweredCasts[event.ability.guid]) {
      this.poweredCasts[event.ability.guid] = 0;
    }

    this.poweredCasts[event.ability.guid] += 1;

    event.meta = event.meta || {};
    event.meta.isEnhancedCast = true;
    const reason = (
      <>
        This cast was empowered by <SpellLink id={SPELLS.PRIMORDIAL_POWER_BUFF.id} /> (4-set bonus)
      </>
    );
    event.meta.enhancedCastReason = event.meta.enhancedCastReason ? (
      <>
        {event.meta.enhancedCastReason}
        <br />
        {reason}
      </>
    ) : (
      reason
    );
  }

  onDamage(event: DamageEvent) {
    const damageId = event.ability.guid;

    if (DAMAGE_AFFECTED_BY_PRIMORDIAL_POWER_NAIVELY.some(({ id }) => id === damageId)) {
      // Handle special cases of damage that benefits if the buff is up,
      // regardless if the original cast was powered or not
      if (this.selectedCombatant.hasBuff(SPELLS.PRIMORDIAL_POWER_BUFF.id)) {
        this.totalDamage += calculateEffectiveDamage(event, PP_MOD);
      }
      return;
    }

    // Need to figure out which casted ability causes this damage
    const abilityId = damageToCast[damageId]?.id ?? damageId;

    const isPowered = this.wasLastCastPowered.has(abilityId);

    if (isPowered) {
      this.totalDamage += calculateEffectiveDamage(event, PP_MOD);
    }
  }

  renderCastRatioChart() {
    const ratioChartItems = ABILITIES_THAT_CONSUME_PRIMORDIAL_POWER.map(
      (spell: { id: number; name: string }) => ({
        label: spell.name,
        spellId: spell.id,
        color: abilityColors[spell.id] || 'hotpink',
        value: this.poweredCasts[spell.id] || 0,
      }),
    )
      .filter((item) => item.value > 0)
      .sort((a, b) => b.value - a.value);

    return (
      <div className="pad">
        <div>Number of empowered casts:</div>
        <small>{this.numberPoweredCasts} total</small>
        <DonutChart items={ratioChartItems} />
      </div>
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(2)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            The {formatPercentage(PP_MOD, 0)}% increase on {this.numberPoweredCasts} casted
            abilities, from the 4-set bonus, <SpellLink id={SPELLS.PRIMORDIAL_POTENTIAL.id} />, was
            worth {formatNumber(this.totalDamage)} raw damage.
          </>
        }
        dropdown={this.numberPoweredCasts > 0 && this.renderCastRatioChart()}
      >
        <BoringSpellValueText spellId={SPELLS.PRIMORDIAL_POTENTIAL.id}>
          <ItemDamageDone amount={this.totalDamage} />
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default PrimordialPotential;
