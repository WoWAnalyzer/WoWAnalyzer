import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  RefreshDebuffEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Enemies from 'parser/shared/modules/Enemies';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';

const BASE_MANA = 2500000;
const HOLY_FIRE_MANA_COST = Math.floor(BASE_MANA * 0.0024); // 6000

/**
 * Empyreal Blaze
 * Holy Word: Chastise causes your next 2 casts of Holy Fire to be instant, cost no mana, and incur no cooldown.
 * Refreshing Holy Fire on a target now extends its duration by 7 sec.
 */

class EmpyrealBlaze extends Analyzer {
  static dependencies = {
    enemies: Enemies,
    spellUsable: SpellUsable,
    abilities: Abilities,
  };

  protected enemies!: Enemies;
  protected spellUsable!: SpellUsable;
  protected abilities!: Abilities;

  private empoweredStacks = 0;
  private empoweredCasts = 0;
  private manaSaved = 0;

  private refreshCount = 0;
  private totalExtensionMs = 0;

  private lastEmpoweredCastTimestamp = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.EMPYREAL_BLAZE_TALENT);
    if (!this.active) return;

    // Gain stacks on Chastise
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.HOLY_WORD_CHASTISE_TALENT),
      this.onChastiseCast,
    );

    // Empowered Holy Fire casts
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOLY_FIRE),
      this.onHolyFireCast,
    );

    // Duration extension on refresh
    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.HOLY_FIRE),
      this.onHolyFireRefresh,
    );

    // Cancel cooldown for empowered casts
    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(SPELLS.HOLY_FIRE),
      this.onUpdateSpellUsable,
    );
  }

  private onChastiseCast() {
    this.empoweredStacks = 2;
  }

  private onHolyFireCast(event: CastEvent) {
    if (this.empoweredStacks > 0) {
      this.empoweredStacks -= 1;
      this.empoweredCasts += 1;

      const cost = event.rawResourceCost?.[0] ?? HOLY_FIRE_MANA_COST;
      this.manaSaved += cost;

      this.lastEmpoweredCastTimestamp = event.timestamp;
    } else {
      this.lastEmpoweredCastTimestamp = 0;
    }
  }

  private onUpdateSpellUsable(event: UpdateSpellUsableEvent) {
    if (
      event.updateType === UpdateSpellUsableType.BeginCooldown &&
      Math.abs(event.timestamp - this.lastEmpoweredCastTimestamp) < 50
    ) {
      const cooldownRemaining = this.spellUsable.cooldownRemaining(SPELLS.HOLY_FIRE.id);
      if (cooldownRemaining > 0) {
        this.spellUsable.reduceCooldown(SPELLS.HOLY_FIRE.id, cooldownRemaining);
      }
      this.lastEmpoweredCastTimestamp = 0;
    }
  }

  private onHolyFireRefresh(event: RefreshDebuffEvent) {
    this.refreshCount += 1;
    this.totalExtensionMs += 7000;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <ul>
              <li>
                <strong>{this.empoweredCasts}</strong> empowered Holy Fire casts (instant, free, no
                cooldown)
              </li>
              <li>
                <strong>{(this.totalExtensionMs / 1000).toFixed(1)}s</strong> total duration added
                from refreshes
              </li>
            </ul>
          </>
        }
      >
        <TalentSpellText talent={TALENTS_PRIEST.EMPYREAL_BLAZE_TALENT}>
          <ItemManaGained amount={this.manaSaved} />
          {/* oxlint-disable-next-line @wowanalyzer/no-br */}
          <br />
          {this.refreshCount} <small>refreshes (7s each)</small>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default EmpyrealBlaze;
