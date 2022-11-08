import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import EventFilter from 'parser/core/EventFilter';
import Events, {
  CastEvent,
  DamageEvent,
  EventType,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { cdSpell, FINISHERS } from 'analysis/retail/druid/feral/constants';
import { TALENTS_DRUID } from 'common/TALENTS';
import { formatNumber, formatPercentage } from 'common/format';
import getResourceSpent from 'parser/core/getResourceSpent';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import { isConvoking } from 'analysis/retail/druid/shared/spells/ConvokeSpirits';

const BERSERK_CDR_MS = 700;
const CONVOKE_BITE_CPS = 5;

/**
 * This tracks the two 'upgrade' talents for Berserk.
 *
 * **Berserk: Heart of the Lion**
 * Spec Talent Tier 7
 *
 * Each combo point spent reduces the cooldown of Berserk (or Incarnation) by 0.5 seconds.
 *
 * **Berserk: Frenzy**
 * Spec Talent Tier 7
 *
 * During Berserk (or Incarnation) your combo-point generating abilites bleed the target for
 * an additional 150% of their damage over 8 seconds.
 */
class BerserkBoosts extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
  };

  protected spellUsable!: SpellUsable;
  protected abilityTracker!: AbilityTracker;

  /** If player has the Berserk: Heart of the Lion talent */
  hasHeartOfTheLion: boolean;
  /** If player has the Berserk: Frenzy talent */
  hasFrenzy: boolean;
  /** If player has both the above talents */
  hasBoth: boolean;
  /** Either Berserk or Incarnation depending on talent */
  cdSpell: Spell;
  /** The total raw amount the CD was reduced */
  totalRawCdReduced: number = 0;
  /** The total effective amount the CD was reduced - penalized by delaying cast or being unable due to fight end */
  totalEffectiveCdReduced: number = 0;
  /** The amount the current CD has been reduced */
  currCastCdReduced: number = 0;

  /** The timestamp the CD became available */
  timestampAvailable?: number;

  constructor(options: Options) {
    super(options);

    this.hasHeartOfTheLion = this.selectedCombatant.hasTalent(
      TALENTS_DRUID.BERSERK_HEART_OF_THE_LION_TALENT,
    );
    this.hasFrenzy = this.selectedCombatant.hasTalent(TALENTS_DRUID.BERSERK_FRENZY_TALENT);
    this.hasBoth = this.hasHeartOfTheLion && this.hasFrenzy;
    this.active = this.hasHeartOfTheLion || this.hasFrenzy;

    this.cdSpell = cdSpell(this.selectedCombatant);
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(FINISHERS), this.onFinisher);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FEROCIOUS_BITE),
      this.onBiteDamage,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.cdSpell), this.onCdUse);
    this.addEventListener(
      new EventFilter(EventType.UpdateSpellUsable).by(SELECTED_PLAYER).spell(this.cdSpell),
      this.onCdAvailable,
    );
  }

  onFinisher(event: CastEvent) {
    if (this.spellUsable.isOnCooldown(this.cdSpell.id)) {
      this._tallyReduction(getResourceSpent(event, RESOURCE_TYPES.COMBO_POINTS));
    }
  }

  onBiteDamage(_: DamageEvent) {
    if (isConvoking(this.selectedCombatant)) {
      this._tallyReduction(CONVOKE_BITE_CPS);
    }
  }

  _tallyReduction(cpsUsed: number) {
    if (this.spellUsable.isOnCooldown(this.cdSpell.id)) {
      const reduction = cpsUsed * BERSERK_CDR_MS;
      const reduced = this.spellUsable.reduceCooldown(this.cdSpell.id, reduction);
      this.totalRawCdReduced += reduced;
      this.currCastCdReduced += reduced;
    }
  }

  onCdUse(event: CastEvent) {
    const timeAvailableBeforeCast =
      this.timestampAvailable === undefined ? 0 : event.timestamp - this.timestampAvailable;
    this.totalEffectiveCdReduced += Math.max(0, this.currCastCdReduced - timeAvailableBeforeCast);
    this.currCastCdReduced = 0;
  }

  onCdAvailable(event: UpdateSpellUsableEvent) {
    if (event.updateType === UpdateSpellUsableType.EndCooldown) {
      this.timestampAvailable = event.timestamp;
    }
  }

  get totalDotDamage() {
    return this.abilityTracker.getAbility(SPELLS.FRENZIED_ASSAULT.id).damageEffective;
  }

  // TODO probably want to update this display, but talents might change more in DF beta so gonna wait
  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(20)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spellId={SPELLS.BERSERK.id}>
          <>
            {this.hasHeartOfTheLion && (
              <>
                <SpellIcon id={TALENTS_DRUID.BERSERK_HEART_OF_THE_LION_TALENT.id} />{' '}
                {(this.totalEffectiveCdReduced / 1000).toFixed(1)}s <small>eff. CD reduction</small>
              </>
            )}
            {this.hasBoth && <br />}
            {this.hasFrenzy && (
              <>
                <SpellIcon id={SPELLS.FRENZIED_ASSAULT.id} />{' '}
                <img src="/img/sword.png" alt="Damage" className="icon" />{' '}
                {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.totalDotDamage))} %{' '}
                <small>
                  {formatNumber((this.totalDotDamage / this.owner.fightDuration) * 1000)} DPS
                </small>
              </>
            )}
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BerserkBoosts;
