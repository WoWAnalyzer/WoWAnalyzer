import { Trans } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { SpellLink } from 'interface';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, CastEvent, RemoveBuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import DeathTracker from 'parser/shared/modules/DeathTracker';
import Enemies from 'parser/shared/modules/Enemies';
import EventHistory from 'parser/shared/modules/EventHistory';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

import ArcaneChargeTracker from './ArcaneChargeTracker';

const ARCANE_POWER_SPELL_BLACKLIST = [
  SPELLS.ARCANE_BARRAGE,
  SPELLS.ARCANE_FAMILIAR_TALENT,
  SPELLS.ARCANE_INTELLECT,
  SPELLS.EVOCATION,
  SPELLS.SUPERNOVA_TALENT,
  SPELLS.NETHER_TEMPEST_TALENT,
  SPELLS.ARCANE_ORB_TALENT,
  SPELLS.RUNE_OF_POWER_TALENT,
];
const ARCANE_EXPLOSION_COST = 5000;
const ARCANE_BLAST_BASE_COST = 1375;
const OVERPOWERED_COST_REDUCTION = 0.5;

const debug = false;

class ArcanePower extends Analyzer {
  static dependencies = {
    abilityTracker: AbilityTracker,
    arcaneChargeTracker: ArcaneChargeTracker,
    spellUsable: SpellUsable,
    deathTracker: DeathTracker,
    // Needed for the `resourceCost` prop of events
    spellManaCost: SpellManaCost,
    enemies: Enemies,
    eventHistory: EventHistory,
  };
  protected abilityTracker!: AbilityTracker;
  protected arcaneChargeTracker!: ArcaneChargeTracker;
  protected spellUsable!: SpellUsable;
  protected deathTracker!: DeathTracker;
  protected spellManaCost!: SpellManaCost;
  protected enemies!: Enemies;
  protected eventHistory!: EventHistory;

  hasOverpowered: boolean;

  totalCastsDuringAP = 0;
  badCastsDuringAP = 0;
  outOfMana = 0;
  buffEndTimestamp = 0;
  arcanePowerCasted = false;

  constructor(options: Options) {
    super(options);
    this.hasOverpowered = this.selectedCombatant.hasTalent(SPELLS.OVERPOWERED_TALENT.id);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(SPELLS.ARCANE_POWER),
      this.onApplyBuff,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(SPELLS.ARCANE_POWER),
      this.onRemoveBuff,
    );
  }

  onCast(event: CastEvent) {
    const spellId = event.ability.guid;
    if (!this.selectedCombatant.hasBuff(SPELLS.ARCANE_POWER.id)) {
      return;
    }

    // Any spell except arcane power or rune of power that was cast during Arcane Power
    this.totalCastsDuringAP += 1;
    if (ARCANE_POWER_SPELL_BLACKLIST.includes(event.ability)) {
      debug && this.log('Cast ' + event.ability.name + ' during Arcane Power');
      this.badCastsDuringAP += 1;
    } else if (spellId === SPELLS.ARCANE_BLAST.id || spellId === SPELLS.ARCANE_EXPLOSION.id) {
      event.classResources &&
        event.classResources.forEach((resource) => {
          if (resource.type !== RESOURCE_TYPES.MANA.id) {
            return;
          }
          const currentMana = resource.amount;
          const manaCost: any =
            event.resourceCost &&
            event.resourceCost[RESOURCE_TYPES.MANA.id] +
              event.resourceCost[RESOURCE_TYPES.MANA.id] * this.arcaneChargeTracker.charges;
          const manaRemaining = currentMana - manaCost;
          const buffTimeRemaining = this.buffEndTimestamp - event.timestamp;
          if (manaRemaining < this.estimatedManaCost(spellId) && buffTimeRemaining > 1000) {
            debug && this.log('Ran Out of Mana during Arcane Power');
            this.outOfMana += 1;
          }
        });
    }
  }

  onApplyBuff(event: ApplyBuffEvent) {
    if (this.arcanePowerCasted) {
      this.buffEndTimestamp = event.timestamp + 10000;
    } else {
      this.buffEndTimestamp = event.timestamp + 8000;
    }
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    this.arcanePowerCasted = false;
  }

  estimatedManaCost(spellId: number) {
    if (spellId === SPELLS.ARCANE_EXPLOSION.id) {
      if (this.selectedCombatant.hasBuff(SPELLS.CLEARCASTING_ARCANE.id)) {
        return 0;
      } else {
        return this.hasOverpowered
          ? ARCANE_EXPLOSION_COST * OVERPOWERED_COST_REDUCTION
          : ARCANE_EXPLOSION_COST;
      }
    }

    const arcaneCharges =
      this.arcaneChargeTracker.charges < 4 ? this.arcaneChargeTracker.charges + 1 : 4;
    if (spellId === SPELLS.ARCANE_BLAST.id) {
      if (this.selectedCombatant.hasBuff(SPELLS.RULE_OF_THREES_BUFF.id)) {
        return 0;
      } else {
        return this.hasOverpowered
          ? ARCANE_BLAST_BASE_COST * arcaneCharges * OVERPOWERED_COST_REDUCTION
          : ARCANE_BLAST_BASE_COST * arcaneCharges;
      }
    }
    return 0;
  }

  get castUtilization() {
    return 1 - this.badCastsDuringAP / this.totalCastsDuringAP;
  }

  get totalArcanePowerCasts() {
    return this.abilityTracker.getAbility(SPELLS.ARCANE_POWER.id).casts;
  }

  get arcanePowerCastThresholds() {
    return {
      actual: this.castUtilization,
      isLessThan: {
        minor: 1,
        average: 0.95,
        major: 0.9,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  get arcanePowerManaUtilization() {
    return {
      actual: 1 - this.outOfMana / this.abilityTracker.getAbility(SPELLS.ARCANE_POWER.id).casts,
      isLessThan: {
        minor: 1,
        average: 0.95,
        major: 0.9,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.arcanePowerCastThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You cast spells other than <SpellLink id={SPELLS.ARCANE_BLAST.id} />,
          <SpellLink id={SPELLS.ARCANE_MISSILES.id} />,{' '}
          <SpellLink id={SPELLS.ARCANE_EXPLOSION.id} />, and{' '}
          <SpellLink id={SPELLS.PRESENCE_OF_MIND.id} /> during{' '}
          <SpellLink id={SPELLS.ARCANE_POWER.id} />. Arcane Power is a short duration, so you should
          ensure that you are getting the most use out of it. Buff spells like Rune of Power should
          be cast immediately before casting Arcane Power. Other spells such as Charged Up,
          Blink/Shimmer, etc are acceptable during Arcane Power, but should be avoided if possible.
        </>,
      )
        .icon(SPELLS.ARCANE_POWER.icon)
        .actual(
          <Trans id="mage.arcane.suggestions.arcanePower.utilization">
            {formatPercentage(actual)}% Utilization
          </Trans>,
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
    when(this.arcanePowerManaUtilization).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You ran dangerously low or ran out of mana during{' '}
          <SpellLink id={SPELLS.ARCANE_POWER.id} /> {this.outOfMana} times. Running out of mana
          during Arcane Power is a massive DPS loss and should be avoided at all costs.{' '}
          {!this.hasOverpowered
            ? 'To avoid this, ensure you have at least 40% mana before casting Arcane Power to ensure you have enough mana to finish Arcane Power.'
            : ''}
        </>,
      )
        .icon(SPELLS.ARCANE_POWER.icon)
        .actual(
          <Trans id="mage.arcane.suggestions.arcanePower.lowMana">
            {formatPercentage(actual)}% Utilization
          </Trans>,
        )
        .recommended(`${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            You should only be casting Arcane Blast (Single Target), Arcane Explosion (AOE), and
            Arcane Missiles (If you have a Clearcasting Proc) during Arcane Power to maximize the
            short cooldown duration.
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.ARCANE_FAMILIAR_TALENT.id}>
          <>
            <SpellIcon
              id={SPELLS.ARCANE_POWER.id}
              style={{
                height: '1.2em',
                marginBottom: '.15em',
              }}
            />{' '}
            {formatPercentage(this.castUtilization, 0)}% <small>Cast utilization</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default ArcanePower;
