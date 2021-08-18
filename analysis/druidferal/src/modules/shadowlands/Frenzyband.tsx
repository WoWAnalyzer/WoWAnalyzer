import { formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import EventFilter from 'parser/core/EventFilter';
import Events, { CastEvent, Event, EventType } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import React from 'react';

import { CP_GENERATORS } from '../../constants';

const CD_REDUCTION_PER_CAST = 300;

/**
 * **Frenzyband**
 * Runecarving Legendary
 *
 * Combo point-generating abilities reduce the cooldown of Berserk (or Incarnation) by 0.3 seconds
 * and during Berserk (or Incarnation) they cause the target to bleed for an additonal 150% of their damage over 8 sec.
 */
class Frenzyband extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
  };

  protected spellUsable!: SpellUsable;
  protected abilityTracker!: AbilityTracker;

  /** The total raw amount the CD was reduced */
  totalRawCdReduced: number = 0;
  /** The total effective amount the CD was reduced - penalized by delaying cast or being unable due to fight end */
  totalEffectiveCdReduced: number = 0;
  /** The amount the current CD has been reduced */
  currCastCdReduced: number = 0;
  /** Either Berserk or Incarnation depending on talent */
  cdSpell: Spell;

  /** The timestamp the CD became available */
  timestampAvailable?: number;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasLegendaryByBonusID(SPELLS.FRENZYBAND.bonusID);

    this.cdSpell = this.selectedCombatant.hasTalent(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id)
      ? SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT
      : SPELLS.BERSERK;
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(CP_GENERATORS), this.onCpGenerator);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.cdSpell), this.onCdUse);
    this.addEventListener(
      new EventFilter(EventType.EndCooldown).by(SELECTED_PLAYER).spell(this.cdSpell),
      this.onCdAvailable,
    );
  }

  onCpGenerator(_: CastEvent) {
    if (this.spellUsable.isOnCooldown(this.cdSpell.id)) {
      const reduced = this.spellUsable.reduceCooldown(this.cdSpell.id, CD_REDUCTION_PER_CAST);
      this.totalRawCdReduced += reduced;
      this.currCastCdReduced += reduced;
    }
  }

  onCdUse(event: CastEvent) {
    const timeAvailableBeforeCast =
      this.timestampAvailable === undefined ? 0 : event.timestamp - this.timestampAvailable;
    this.totalEffectiveCdReduced += Math.max(0, this.currCastCdReduced - timeAvailableBeforeCast);
  }

  onCdAvailable(event: Event<EventType.EndCooldown>) {
    this.timestampAvailable = event.timestamp;
  }

  get totalDotDamage() {
    return this.abilityTracker.getAbility(SPELLS.FRENZIED_ASSAULT.id).damageEffective;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            The effective CD reduction stat considers only the reduction you used. For example if
            you use enough combo builders to take 15 seconds off your {this.cdSpell.name} cooldown
            but then wait 10 seconds after its available to cast, you'll only be credited with 5
            seconds of effective reduction, or if the fight ended before you could use it at all
            then you'd be given no credit.
            <br />
            <br />
            The total raw amount you reduced the cooldown was{' '}
            <strong>{(this.totalRawCdReduced / 1000).toFixed(1)}s</strong>
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.FRENZYBAND.id}>
          <>
            <SpellIcon id={this.cdSpell.id} /> {(this.totalEffectiveCdReduced / 1000).toFixed(1)}s{' '}
            <small>eff. CD reduction</small> <br />
            <img src="/img/sword.png" alt="Damage" className="icon" />{' '}
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.totalDotDamage))} %{' '}
            <small>
              {formatNumber((this.totalDotDamage / this.owner.fightDuration) * 1000)} DPS from DoT
            </small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Frenzyband;
