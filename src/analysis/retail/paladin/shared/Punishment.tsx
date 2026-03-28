import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import SPECS from 'game/SPECS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, HealEvent, InterruptEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const EXTRA_SPELL_MAP = {
  [SPECS.RETRIBUTION_PALADIN.id]: SPELLS.CRUSADER_STRIKE,
  [SPECS.HOLY_PALADIN.id]: TALENTS.HOLY_SHOCK_TALENT,
};

// For Protection, the damage event IDs may differ from cast IDs
const PROTECTION_EXTRA_DAMAGE_SPELL_MAP = {
  [TALENTS.BLESSED_HAMMER_TALENT.id]: SPELLS.BLESSED_HAMMER_DEBUFF,
  [TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT.id]: TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT,
};

class Punishment extends Analyzer {
  triggers = 0;
  extraDamage = 0;
  extraHealing = 0;
  lastInterruptTimestamp = 0;

  private extraDamageSpellId: number | null = null;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.PUNISHMENT_TALENT);
    if (!this.active) {
      return;
    }

    this.extraDamageSpellId = this.getExtraDamageSpellId();

    this.addEventListener(Events.interrupt.by(SELECTED_PLAYER), this.onInterrupt);
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  getExtraDamageSpellId(): number | null {
    const specId = this.selectedCombatant.specId;
    if (specId === SPECS.PROTECTION_PALADIN.id) {
      if (this.selectedCombatant.hasTalent(TALENTS.BLESSED_HAMMER_TALENT)) {
        return PROTECTION_EXTRA_DAMAGE_SPELL_MAP[TALENTS.BLESSED_HAMMER_TALENT.id]?.id;
      }
      if (this.selectedCombatant.hasTalent(TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT)) {
        return PROTECTION_EXTRA_DAMAGE_SPELL_MAP[TALENTS.HAMMER_OF_THE_RIGHTEOUS_TALENT.id]?.id;
      }
      // Fallback (should never happen)
      return SPELLS.CRUSADER_STRIKE.id;
    }
    // For Ret and Holy, use the cast spell ID (same as damage ID)
    return (EXTRA_SPELL_MAP[specId] || SPELLS.CRUSADER_STRIKE).id;
  }

  onInterrupt(event: InterruptEvent) {
    this.triggers += 1;
    this.lastInterruptTimestamp = event.timestamp;
  }

  onDamage(event: DamageEvent) {
    if (!this.extraDamageSpellId) return;
    if (event.ability.guid !== this.extraDamageSpellId) return;
    if (event.timestamp - this.lastInterruptTimestamp < 200) {
      this.extraDamage += event.amount + (event.absorbed || 0);
    }
  }

  onHeal(event: HealEvent) {
    if (!this.extraDamageSpellId) return;
    if (event.ability.guid !== this.extraDamageSpellId) return;
    if (event.timestamp - this.lastInterruptTimestamp < 200) {
      this.extraHealing += event.amount + (event.absorbed || 0);
    }
  }

  statistic() {
    const hasDamage = this.extraDamage > 0;
    const hasHealing = this.extraHealing > 0;
    const avgDamage = this.triggers ? this.extraDamage / this.triggers : 0;
    const avgHealing = this.triggers ? this.extraHealing / this.triggers : 0;

    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            Triggered {this.triggers} times.
            {hasDamage && (
              <>
                <br />
                Total extra damage: {formatNumber(this.extraDamage)}
              </>
            )}
            {hasHealing && (
              <>
                <br />
                Total extra healing: {formatNumber(this.extraHealing)}
              </>
            )}
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.PUNISHMENT_TALENT}>
          {hasDamage && (
            <>
              {formatNumber(this.extraDamage)} <small>damage</small>
              <br />
              {formatNumber(avgDamage)} <small>avg dmg/trigger</small>
              <br />
            </>
          )}
          {hasHealing && (
            <>
              {formatNumber(this.extraHealing)} <small>healing</small>
              <br />
              {formatNumber(avgHealing)} <small>avg healing/trigger</small>
              <br />
            </>
          )}
          {this.triggers} <small>triggers</small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Punishment;
