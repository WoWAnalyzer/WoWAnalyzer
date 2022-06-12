import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import { SpellIcon } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import EventFilter from 'parser/core/EventFilter';
import Events, { CastEvent, DamageEvent, Event, EventType } from 'parser/core/Events';
import AbilityTracker from 'parser/shared/modules/AbilityTracker';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { FINISHERS } from '../../constants';
import { getComboPointsSpent } from '../../modules/core/ResourceFromEvent';
import ConvokeSpiritsFeral from '../../modules/shadowlands/ConvokeSpiritsFeral';

const BERSERK_CDR_MS = 700;
const CONVOKE_BITE_CPS = 5;

/**
 * Feral Druid Tier 28 - 2pc - Heart of the Lion
 * Each combo point spent reduces the cooldown of Incarnation: King of the Jungle / Berserk by 0.7 sec.
 */
class Tier28_2pc extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    abilityTracker: AbilityTracker,
    convokeSpiritsFeral: ConvokeSpiritsFeral,
  };

  protected spellUsable!: SpellUsable;
  protected abilityTracker!: AbilityTracker;
  protected convokeSpiritsFeral!: ConvokeSpiritsFeral;

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
    this.active = this.selectedCombatant.has2Piece();

    this.cdSpell = this.selectedCombatant.hasTalent(SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT.id)
      ? SPELLS.INCARNATION_KING_OF_THE_JUNGLE_TALENT
      : SPELLS.BERSERK;
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(FINISHERS), this.onFinisher);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FEROCIOUS_BITE),
      this.onBiteDamage,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(this.cdSpell), this.onCdUse);
    this.addEventListener(
      new EventFilter(EventType.EndCooldown).by(SELECTED_PLAYER).spell(this.cdSpell),
      this.onCdAvailable,
    );
  }

  onFinisher(event: CastEvent) {
    if (this.spellUsable.isOnCooldown(this.cdSpell.id)) {
      this._tallyReduction(getComboPointsSpent(event));
    }
  }

  onBiteDamage(_: DamageEvent) {
    if (this.convokeSpiritsFeral.isConvoking()) {
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

  onCdAvailable(event: Event<EventType.EndCooldown>) {
    this.timestampAvailable = event.timestamp;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(20)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            This is the effect granted by the <strong>Tier 28 2-piece set bonus</strong>.
            <br />
            <br />
            The effective CD reduction stat considers only the reduction you used. For example if
            you spend enough combo points to take 15 seconds off your {this.cdSpell.name} cooldown
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
        <BoringSpellValueText spellId={SPELLS.HEART_OF_THE_LION.id}>
          <>
            <SpellIcon id={this.cdSpell.id} /> {(this.totalEffectiveCdReduced / 1000).toFixed(1)}s{' '}
            <small>eff. CD reduction</small> <br />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Tier28_2pc;
