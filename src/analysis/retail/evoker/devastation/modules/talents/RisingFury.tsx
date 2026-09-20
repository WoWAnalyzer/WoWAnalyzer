import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import {
  RISING_FURY_DAMAGE_AMPS,
  RISING_FURY_MAX_STACKS,
  RISING_FURY_SPELLS,
} from 'analysis/retail/evoker/devastation/constants';
import Events, { ApplyBuffStackEvent, DamageEvent, RemoveBuffEvent } from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Soup from 'interface/icons/Soup';
import { WarningIcon } from 'interface/icons';
import { SpellLink } from 'interface';
import { formatNumber } from 'common/format';
import UnboundFlame from './UnboundFlame';

/**
 * (1) While Dragonrage is active you gain Rising Fury every 6 sec, increasing your haste by 4%, stacking up to 5 times.
 *
 * (2) At 5 stacks of Rising Fury, all damage dealt is increased by 8%.
 *
 * (3) At 5 stacks of Rising Fury, all damage dealt is increased by 15%.
 *
 * (4) When Dragonrage ends, Rising Fury persists for 4 sec per stack, and Dragonrage becomes Unbound Flame. Unbound Flame may be cast 4 times before Dragonrage
 * finishes its cooldown.
 * Unbound Flame
 * Exhale destructive flame, critically striking for [(800% of Spell Power) * 2] Fire damage to your target and nearby enemies, reduced beyond 5 targets.
 * Causes 1 Essence Burst
 */
class RisingFury extends Analyzer.withDependencies({ unboundFlame: UnboundFlame }) {
  maxStackAmp =
    RISING_FURY_DAMAGE_AMPS[
      this.selectedCombatant.getTalentRank(TALENTS.RISING_FURY_2_DEVASTATION_TALENT)
    ];

  risingFuryStacks = 0;
  damageFromRisingFury = 0;
  hasUnboundFlame = this.selectedCombatant.hasTalent(TALENTS.RISING_FURY_3_DEVASTATION_TALENT);

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.RISING_FURY_2_DEVASTATION_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(RISING_FURY_SPELLS),
      this.onDamage,
    );

    this.addEventListener(
      Events.applybuffstack.by(SELECTED_PLAYER).spell(SPELLS.RISING_FURY_BUFF),
      this.onApplyRisingFury,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.RISING_FURY_BUFF),
      this.onRemoveRisingFury,
    );
  }

  private onDamage(event: DamageEvent) {
    if (this.risingFuryStacks === RISING_FURY_MAX_STACKS) {
      this.damageFromRisingFury += calculateEffectiveDamage(event, this.maxStackAmp);
    }
  }

  private onApplyRisingFury(event: ApplyBuffStackEvent) {
    this.risingFuryStacks = event.stack;
  }

  private onRemoveRisingFury(event: RemoveBuffEvent) {
    this.risingFuryStacks = 0;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <li>Damage from Rising Fury: {formatNumber(this.damageFromRisingFury)}</li>
            {this.hasUnboundFlame && (
              <li>Damage from Unbound Flame: {formatNumber(this.deps.unboundFlame.damage)}</li>
            )}
          </>
        }
      >
        <TalentSpellText talent={TALENTS.RISING_FURY_2_DEVASTATION_TALENT}>
          <ItemDamageDone amount={this.damageFromRisingFury} />
        </TalentSpellText>
        {this.hasUnboundFlame && (
          <BoringSpellValueText spell={SPELLS.UNBOUND_FLAME}>
            <ItemDamageDone amount={this.deps.unboundFlame.damage} />
            <div>
              <Soup /> {this.deps.unboundFlame.essenceBurstGenerated}{' '}
              <small>
                <SpellLink spell={SPELLS.ESSENCE_BURST_BUFF} /> generated
              </small>
            </div>
            {this.deps.unboundFlame.essenceBurstWasted > 0 && (
              <div>
                <WarningIcon /> {this.deps.unboundFlame.essenceBurstWasted}{' '}
                <small>
                  <SpellLink spell={SPELLS.ESSENCE_BURST_BUFF} /> wasted
                </small>
              </div>
            )}
          </BoringSpellValueText>
        )}
      </Statistic>
    );
  }
}

export default RisingFury;
