import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/rogue';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, RemoveDebuffEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

const COOLDOWN_REDUCTION_MS = 30_000;
const DOT_END_BUFFER_MS = 300;
const BASE_DOT_LENGTH_MS = 10_000;
const debug = false;

class Sepsis extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    spellUsable: SpellUsable,
  };
  damage: number = 0;
  poisonDamage: number = 0;
  lastSepsisCast: CastEvent | null = null;
  protected abilities!: Abilities;
  protected spellUsable!: SpellUsable;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SEPSIS_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.SEPSIS_FINAL_DMG),
      this.onDamage,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.SEPSIS_TALENT),
      this.onSepsisCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(TALENTS.SEPSIS_TALENT),
      this.onPoisonDamage,
    );
    this.addEventListener(
      Events.removedebuff.by(SELECTED_PLAYER).spell(TALENTS.SEPSIS_TALENT),
      this.onDebuffFade,
    );
  }

  onDebuffFade(event: RemoveDebuffEvent) {
    if (this.lastSepsisCast == null) {
      // This should never happen and indicates a bug if it does.
      debug && console.warn('Sepsis debuff faded before cast recorded.');
      return;
    }
    const lastCastTimestamp = this.lastSepsisCast.timestamp;
    const dotEndTimestamp = event.timestamp;
    const timestampDiff = dotEndTimestamp - lastCastTimestamp;

    // If the Sepsis DoT does not reach its full duration, the CD
    // of Sepsis is reduced by 30 seconds.
    if (
      timestampDiff < BASE_DOT_LENGTH_MS + DOT_END_BUFFER_MS &&
      !this.spellUsable.isAvailable(TALENTS.SEPSIS_TALENT.id)
    ) {
      this.spellUsable.reduceCooldown(TALENTS.SEPSIS_TALENT.id, COOLDOWN_REDUCTION_MS);
    }
  }

  onSepsisCast(event: CastEvent) {
    this.lastSepsisCast = event;
  }

  onDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
  }

  onPoisonDamage(event: DamageEvent) {
    this.damage += event.amount + (event.absorbed || 0);
    this.poisonDamage += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <>
        <Statistic
          size="flexible"
          category={STATISTIC_CATEGORY.TALENTS}
          tooltip={
            <ul>
              <li>{formatNumber(this.damage)} damage done by Sepsis Ability</li>
              <li>{formatNumber(this.poisonDamage)} damage done by Sepsis poison</li>
            </ul>
          }
        >
          <TalentSpellText talent={TALENTS.SEPSIS_TALENT}>
            <ItemDamageDone amount={this.damage + this.poisonDamage} />
          </TalentSpellText>
        </Statistic>
      </>
    );
  }
}

export default Sepsis;
