import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import {
  RISING_FURY_DAMAGE_AMPS,
  RISING_FURY_MAX_STACKS,
  RISING_FURY_SPELLS,
} from 'analysis/retail/evoker/devastation/constants';
import Events, {
  ApplyBuffEvent,
  ApplyBuffStackEvent,
  CastEvent,
  DamageEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import {
  EBSource,
  isEBFrom,
} from 'analysis/retail/evoker/shared/modules/normalizers/EssenceBurstCastLinkNormalizer';
import Soup from 'interface/icons/Soup';
import { WarningIcon } from 'interface/icons';
import { SpellLink } from 'interface';
import { formatNumber } from 'common/format';

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
class RisingFury extends Analyzer {
  maxStackAmp =
    RISING_FURY_DAMAGE_AMPS[
      this.selectedCombatant.getTalentRank(TALENTS.RISING_FURY_2_DEVASTATION_TALENT)
    ];

  statsUnboundFlame = {
    usedStacks: 0,
    totalStacks: 0,
  };

  risingFuryStacks = 0;
  unboundFlameStacks = 0;

  damageFromRisingFury = 0;
  damageFromUnboundFlame = 0;

  essenceBurstGenerated = 0;
  essenceBurstWasted = 0;

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

    if (this.hasUnboundFlame) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.UNBOUND_FLAME),
        this.onCastUnboundFlame,
      );

      this.addEventListener(
        Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.UNBOUND_FLAME_BUFF),
        this.onApplyUnboundFlame,
      );

      this.addEventListener(
        Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.UNBOUND_FLAME_BUFF),
        this.onRemoveUnboundFlame,
      );

      [Events.applybuff, Events.applybuffstack].forEach((event) =>
        this.addEventListener(
          event.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_BURST_DEV_BUFF),
          this.onApplyEssenceBurst,
        ),
      );
      this.addEventListener(
        Events.refreshbuff.by(SELECTED_PLAYER).spell(SPELLS.ESSENCE_BURST_DEV_BUFF),
        this.onRefreshEssenceBurst,
      );
    }
  }

  private onDamage(event: DamageEvent) {
    if (this.risingFuryStacks === RISING_FURY_MAX_STACKS) {
      this.damageFromRisingFury += calculateEffectiveDamage(event, this.maxStackAmp);
    }
    if (event.ability.guid === SPELLS.UNBOUND_FLAME_DAMAGE.id) {
      this.damageFromUnboundFlame += (event.amount || 0) + (event.absorbed || 0);
    }
  }

  private onApplyRisingFury(event: ApplyBuffStackEvent) {
    this.risingFuryStacks = event.stack;
  }

  private onRemoveRisingFury(event: RemoveBuffEvent) {
    this.risingFuryStacks = 0;
  }

  private onApplyUnboundFlame(event: ApplyBuffEvent) {
    this.unboundFlameStacks = 4;
    this.statsUnboundFlame.totalStacks += 4;
  }

  private onCastUnboundFlame(event: CastEvent) {
    this.unboundFlameStacks -= 1;
    this.statsUnboundFlame.usedStacks += 1;
  }

  private onRemoveUnboundFlame(event: RemoveBuffEvent) {
    this.unboundFlameStacks = 0;
  }

  private onApplyEssenceBurst(event: ApplyBuffEvent | ApplyBuffStackEvent) {
    if (isEBFrom(event, EBSource.UnboundFlame)) {
      this.essenceBurstGenerated += 1;
    }
  }
  private onRefreshEssenceBurst(event: RefreshBuffEvent) {
    if (isEBFrom(event, EBSource.UnboundFlame)) {
      this.essenceBurstWasted += 1;
    }
  }

  get usedUnboundFlameStacks() {
    return this.statsUnboundFlame.usedStacks;
  }

  get totalUnboundFlameStacks() {
    return this.statsUnboundFlame.totalStacks;
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
              <li>Damage from Unbound Flame: {formatNumber(this.damageFromUnboundFlame)}</li>
            )}
          </>
        }
      >
        <TalentSpellText talent={TALENTS.RISING_FURY_2_DEVASTATION_TALENT}>
          <ItemDamageDone amount={this.damageFromRisingFury} />
        </TalentSpellText>
        {this.hasUnboundFlame && (
          <BoringSpellValueText spell={SPELLS.UNBOUND_FLAME}>
            <ItemDamageDone amount={this.damageFromUnboundFlame} />
            <div>
              <Soup /> {this.essenceBurstGenerated}{' '}
              <small>
                <SpellLink spell={SPELLS.ESSENCE_BURST_BUFF} /> generated
              </small>
            </div>
            {this.essenceBurstWasted > 0 && (
              <div>
                <WarningIcon /> {this.essenceBurstWasted}{' '}
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
