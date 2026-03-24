import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { HOLY_WORD_LIST } from '../../../constants';
import SpellManaCost from 'parser/shared/modules/SpellManaCost';
import { SpellLink } from 'interface';

const HOLY_WORD_IDS = HOLY_WORD_LIST.map((spell) => spell.id);
const MANA_REDUCTION_PERCENT = 0.5; // 50% reduction

/**
 * Apotheosis:
 * - Instantly resets the cooldown of all Holy Words (or restores all charges if talented into Miracle Worker).
 * - For 20 sec, increases cooldown reduction to Holy Words by 200% and reduces their mana cost by 50%.
 */
class Apotheosis extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    spellManaCost: SpellManaCost,
  };

  protected spellUsable!: SpellUsable;
  protected spellManaCost!: SpellManaCost;

  apotheosisCasts = 0;
  manaSavedFromSerenity = 0;
  manaSavedFromSanctify = 0;
  manaSavedFromChastise = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.APOTHEOSIS_TALENT);
    if (!this.active) return;

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.APOTHEOSIS_TALENT),
      this.onApotheosisCast,
    );

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(HOLY_WORD_LIST),
      this.onHolyWordCast,
    );
    this.addEventListener(
      Events.applybuff.to(SELECTED_PLAYER).spell(TALENTS.APOTHEOSIS_TALENT),
      this.onApplyApotheosis,
    );
    this.addEventListener(
      Events.removebuff.to(SELECTED_PLAYER).spell(TALENTS.APOTHEOSIS_TALENT),
      this.onRemoveApotheosis,
    );
  }

  private onApplyApotheosis() {
    // Apply a 3x cooldown rate to all Holy Words
    this.spellUsable.applyCooldownRateChange(HOLY_WORD_IDS, 3);
  }

  private onRemoveApotheosis() {
    // Remove the rate multiplier
    this.spellUsable.removeCooldownRateChange(HOLY_WORD_IDS, 3);
  }

  private onApotheosisCast(event: CastEvent) {
    this.apotheosisCasts += 1;

    // Reset all Holy Words (restore all charges)
    HOLY_WORD_IDS.forEach(spellId => {
        this.spellUsable.endCooldown(spellId, event.timestamp, true, true);
    });
  }

  private onHolyWordCast(event: CastEvent) {
    if (!this.selectedCombatant.hasBuff(TALENTS.APOTHEOSIS_TALENT.id)) {
      return;
    }

    const fullCost = this.spellManaCost.getRawResourceCost(event) || 0;
    // Saved mana is 50% of the full cost (since we only pay half)
    const saved = Math.floor(fullCost * MANA_REDUCTION_PERCENT);

    const spellId = event.ability.guid;
    if (spellId === TALENTS.HOLY_WORD_SERENITY_TALENT.id) {
      this.manaSavedFromSerenity += saved;
    } else if (spellId === TALENTS.HOLY_WORD_SANCTIFY_TALENT.id) {
      this.manaSavedFromSanctify += saved;
    } else if (spellId === TALENTS.HOLY_WORD_CHASTISE_TALENT.id) {
      this.manaSavedFromChastise += saved;
    }
  }

  get totalManaSaved() {
    return this.manaSavedFromChastise + this.manaSavedFromSanctify + this.manaSavedFromSerenity;
  }

  statistic() {
    return (
      <Statistic
        tooltip={
          <>
            For detailed Holy Word CDR breakdown, see the Holy Word module at the top.
            {/* oxlint-disable-next-line @wowanalyzer/no-br */}
            <br />
            {/* oxlint-disable-next-line @wowanalyzer/no-br */}
            <br />
            Mana saved during Apotheosis (50% reduction):
            {/* oxlint-disable-next-line @wowanalyzer/no-br */}
            <br />
            <SpellLink spell={TALENTS.HOLY_WORD_SERENITY_TALENT} />: {this.manaSavedFromSerenity}
            {/* oxlint-disable-next-line @wowanalyzer/no-br */}
            <br />
            <SpellLink spell={TALENTS.HOLY_WORD_SANCTIFY_TALENT} />: {this.manaSavedFromSanctify}
            {/* oxlint-disable-next-line @wowanalyzer/no-br */}
            <br />
            <SpellLink spell={TALENTS.HOLY_WORD_CHASTISE_TALENT} />: {this.manaSavedFromChastise}
          </>
        }
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(7)}
      >
        <BoringSpellValueText spell={TALENTS.APOTHEOSIS_TALENT}>
          <ItemManaGained amount={this.totalManaSaved} />
          {/* oxlint-disable-next-line @wowanalyzer/no-br */}
          <br />
          <small>mana saved</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Apotheosis;