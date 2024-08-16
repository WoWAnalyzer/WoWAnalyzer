import SPELLS from 'common/SPELLS';
import TALENTS, { TALENTS_PRIEST } from 'common/TALENTS/priest';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, ChangeBuffStackEvent, HealEvent } from 'parser/core/Events';
import ItemManaGained from 'parser/ui/ItemManaGained';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { calculateEffectiveHealing } from 'parser/core/EventCalculateLib';
import { formatPercentage, formatNumber } from 'common/format';

//Archon Hero Talent
const EMPOWERED_SURGES_AMP = 0.3;
const SURGES_PER_HALO = 3;
/**
 * **Empowered Surges**
 * Increase the healing done by Flash Heals affected by Surge of Light by 30%.
 *
 * **Manifested Power**
 * Creating a Halo grants Surge of Light
 */

// Example Log: /report/da4AL7QPr36btCmV/8-Heroic+Huntsman+Altimor+-+Kill+(5:13)/Daemonlight/standard/statistics
class SurgeOfLight extends Analyzer {
  solStacksGained = 0;
  solStacksLost = 0;
  solFlashHeals = 0;
  currentSolStacks = 0;
  solStacksSpent = 0;
  solHealing = 0;
  solOverHealing = 0;
  empoweredSurgesActive = false;
  empoweredSurgesHealing = 0;
  manifestedPowerActive = false;
  manifestedPowerSolNum = 0;

  get freeFlashHealPending() {
    return this.currentSolStacks > 0;
  }

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SURGE_OF_LIGHT_TALENT);

    this.empoweredSurgesActive = this.selectedCombatant.hasTalent(TALENTS.EMPOWERED_SURGES_TALENT);
    this.manifestedPowerActive = this.selectedCombatant.hasTalent(TALENTS.MANIFESTED_POWER_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.changebuffstack.by(SELECTED_PLAYER).spell(SPELLS.SURGE_OF_LIGHT_BUFF),
      this.onChangeBuffStack,
    );
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.FLASH_HEAL), this.onCast);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER).spell(SPELLS.FLASH_HEAL), this.onHeal);

    if (this.manifestedPowerActive) {
      this.addEventListener(
        Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HALO_TALENT),
        this.onHaloCast,
      );
    }
  }

  get solManaSaved() {
    return this.solFlashHeals * SPELLS.FLASH_HEAL.manaCost;
  }

  onChangeBuffStack(event: ChangeBuffStackEvent) {
    if (event.stacksGained > 0) {
      this.solStacksGained += 1;
    } else {
      this.solStacksSpent += 1;
    }
    this.currentSolStacks = event.newStacks;
  }

  onCast(event: CastEvent) {
    if (this.freeFlashHealPending) {
      this.solFlashHeals += 1;
    }
  }

  onHaloCast(event: CastEvent) {
    this.manifestedPowerSolNum += Number(SURGES_PER_HALO);
  }

  onHeal(event: HealEvent) {
    if (this.freeFlashHealPending) {
      this.solHealing += event.amount + (event.absorbed || 0);
      this.solOverHealing += event.overheal || 0;
      if (this.empoweredSurgesActive) {
        this.empoweredSurgesHealing += calculateEffectiveHealing(event, EMPOWERED_SURGES_AMP);
      }
    }
  }

  //TODO: Clean up the empowered Surges/manifested power section formatting (react formatting is hard)
  statistic() {
    return (
      <Statistic
        tooltip={`${this.solFlashHeals}/${this.solStacksGained} Surge of Light buffs used`}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(5)}
      >
        <TalentSpellText talent={TALENTS.SURGE_OF_LIGHT_TALENT}>
          <>
            {this.solFlashHeals}{' '}
            <small>
              free <SpellLink spell={SPELLS.FLASH_HEAL} /> casts
            </small>
            <br />
            <ItemManaGained amount={this.solManaSaved} useAbbrev />
            {this.manifestedPowerActive ? (
              <li>
                <small>
                  <SpellLink spell={TALENTS_PRIEST.MANIFESTED_POWER_TALENT} /> procced{' '}
                </small>
                <strong>{this.manifestedPowerSolNum}</strong>
                <small> times</small>
              </li>
            ) : (
              <></>
            )}
            {this.empoweredSurgesActive ? (
              <li>
                <small>
                  <SpellLink spell={TALENTS_PRIEST.EMPOWERED_SURGES_TALENT} /> contributed{' '}
                </small>
                <strong>
                  {formatNumber((this.empoweredSurgesHealing / this.owner.fightDuration) * 1000)}{' '}
                  HPS
                </strong>
                <small>
                  {' '}
                  {formatPercentage(
                    this.owner.getPercentageOfTotalHealingDone(this.empoweredSurgesHealing),
                  )}
                  % of total
                </small>
              </li>
            ) : (
              <></>
            )}
          </>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default SurgeOfLight;
