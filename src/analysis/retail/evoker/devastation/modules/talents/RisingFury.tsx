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
  DamageEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import { formatNumber } from 'common/format';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import TalentSpellText from 'parser/ui/TalentSpellText';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';

/**
 * (1) While Dragonrage is active you gain Rising Fury every 6 sec, increasing your haste by 4%, stacking up to 5 times.
 *
 * (2) At 5 stacks of Rising Fury, all damage dealt is increased by 8%.
 *
 * (3) At 5 stacks of Rising Fury, all damage dealt is increased by 15%.
 *
 * (4) When Dragonrage ends, gain Risen Fury for 4 sec for each stack of Rising Fury.
 * Risen Fury grants the damage and haste bonuses accumulated from Rising Fury and generates Essence Burst every 4 sec.
 */
class RisingFury extends Analyzer {
  maxStackAmp =
    RISING_FURY_DAMAGE_AMPS[
      this.selectedCombatant.getTalentRank(TALENTS.RISING_FURY_2_DEVASTATION_TALENT)
    ];

  risingFuryStacks = 0;
  risenFuryIsActive = false;
  risenFuryStacks = 0;

  damageFromRisingFury = 0;
  damageFromRisenFury = 0;

  hasRisenFury = this.selectedCombatant.hasTalent(TALENTS.RISING_FURY_3_DEVASTATION_TALENT);

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
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.RISEN_FURY_BUFF),
      this.onApplyRisenFury,
    );
    this.addEventListener(
      Events.removebuff
        .by(SELECTED_PLAYER)
        .spell([SPELLS.RISEN_FURY_BUFF, SPELLS.RISING_FURY_BUFF]),
      this.onRemoveBuff,
    );
  }

  private onDamage(event: DamageEvent) {
    if (this.risingFuryStacks === RISING_FURY_MAX_STACKS) {
      this.damageFromRisingFury += calculateEffectiveDamage(event, this.maxStackAmp);
    } else if (this.risenFuryIsActive) {
      this.damageFromRisenFury += calculateEffectiveDamage(event, this.maxStackAmp);
    }
  }

  private onApplyRisingFury(event: ApplyBuffStackEvent) {
    this.risingFuryStacks = event.stack;
  }

  private onApplyRisenFury(_event: ApplyBuffEvent) {
    if (
      this.risingFuryStacks === RISING_FURY_MAX_STACKS ||
      this.risenFuryStacks === RISING_FURY_MAX_STACKS
    ) {
      // damage amp comes on max stacks, so if we don't reach max stacks, we gain no damage essentially
      this.risenFuryIsActive = true;
    }
  }

  private onRemoveBuff(event: RemoveBuffEvent) {
    if (event.ability.guid === SPELLS.RISEN_FURY_BUFF.id) {
      this.risenFuryStacks = this.risingFuryStacks;
      this.risingFuryStacks = 0;
    } else {
      this.risenFuryIsActive = false;
      this.risenFuryStacks = 0;
    }
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
            {this.hasRisenFury && (
              <li>Damage from Risen Fury: {formatNumber(this.damageFromRisenFury)}</li>
            )}
          </>
        }
      >
        <TalentSpellText talent={TALENTS.RISING_FURY_2_DEVASTATION_TALENT}>
          <ItemDamageDone amount={this.damageFromRisingFury} />
        </TalentSpellText>
        {this.hasRisenFury && (
          <BoringSpellValueText spell={SPELLS.RISEN_FURY_BUFF}>
            <ItemDamageDone amount={this.damageFromRisenFury} />
          </BoringSpellValueText>
        )}
      </Statistic>
    );
  }
}

export default RisingFury;
