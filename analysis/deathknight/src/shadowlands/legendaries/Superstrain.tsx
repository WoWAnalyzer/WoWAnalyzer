import { Trans } from '@lingui/macro';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import RESOURCE_TYPES from 'game/RESOURCE_TYPES';
import SPECS from 'game/SPECS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, ResourceChangeEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const DEATH_STRIKE_RP = 40;
const DEATH_COIL_RP = 40;

class Superstrain extends Analyzer {
  frostFeverRPGained: number = 0;
  frostFeverRPWasted: number = 0;

  rpDamage: number = 0;
  rpSpenderUsed: number = 0;

  frostFeverDamage: number = 0;
  bloodPlagueDamage: number = 0;
  virulentPlagueDamage: number = 0;

  constructor(options: Options) {
    super(options);

    const active = this.selectedCombatant.hasLegendary(SPELLS.SUPERSTRAIN);
    this.active = active;
    if (!active) {
      return;
    }

    if (
      [SPECS.BLOOD_DEATH_KNIGHT.id, SPECS.UNHOLY_DEATH_KNIGHT.id].includes(
        this.selectedCombatant.specId,
      )
    ) {
      this.addEventListener(Events.resourcechange, this._onFrostFeverEnergize);
    }

    if (this.selectedCombatant.spec === SPECS.BLOOD_DEATH_KNIGHT) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FROST_FEVER),
        this._onFrostFeverDamage,
      );
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.VIRULENT_PLAGUE),
        this._onVirulentPlagueDamage,
      );
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DEATH_STRIKE),
        this._rpSpender,
      );
    }

    if (this.selectedCombatant.spec === SPECS.UNHOLY_DEATH_KNIGHT) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.FROST_FEVER),
        this._onFrostFeverDamage,
      );
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLOOD_PLAGUE),
        this._onBloodPlagueDamage,
      );
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DEATH_COIL_DAMAGE),
        this._rpSpender,
      );
    }

    if (this.selectedCombatant.spec === SPECS.FROST_DEATH_KNIGHT) {
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.VIRULENT_PLAGUE),
        this._onVirulentPlagueDamage,
      );
      this.addEventListener(
        Events.damage.by(SELECTED_PLAYER).spell(SPELLS.BLOOD_PLAGUE),
        this._onBloodPlagueDamage,
      );
      this.addEventListener(
        Events.damage
          .by(SELECTED_PLAYER)
          .spell([SPELLS.FROST_STRIKE_MAIN_HAND_DAMAGE, SPELLS.FROST_STRIKE_OFF_HAND_DAMAGE]),
        this._rpSpender,
      );
    }
  }

  _onFrostFeverDamage(event: DamageEvent) {
    this.frostFeverDamage += event.amount + (event.absorb || 0);
  }

  _onBloodPlagueDamage(event: DamageEvent) {
    this.bloodPlagueDamage += event.amount + (event.absorb || 0);
  }

  _onVirulentPlagueDamage(event: DamageEvent) {
    this.virulentPlagueDamage += event.amount + (event.absorb || 0);
  }

  _onFrostFeverEnergize(event: ResourceChangeEvent) {
    if (
      event.resourceChangeType !== RESOURCE_TYPES.RUNIC_POWER.id ||
      event.ability.guid !== SPELLS.FROST_FEVER_RP_GAIN.id
    ) {
      return;
    }

    this.frostFeverRPGained += event.resourceChange;
    this.frostFeverRPWasted += event.waste;
  }

  _rpSpender(event: DamageEvent) {
    this.rpDamage += event.amount + (event.absorb || 0);
    this.rpSpenderUsed += 1;
  }

  get rpSpenderAverageDamage() {
    return this.rpDamage / this.rpSpenderUsed;
  }

  get rpBonusDamage() {
    const rpSpenderCost =
      this.selectedCombatant.spec === SPECS.BLOOD_DEATH_KNIGHT ? DEATH_STRIKE_RP : DEATH_COIL_RP;
    return this.rpSpenderAverageDamage * Math.floor(this.frostFeverRPGained / rpSpenderCost);
  }

  get frostFeverTotalRP() {
    return this.frostFeverRPGained + this.frostFeverRPWasted;
  }

  get superStrainDamage() {
    return (
      this.frostFeverDamage +
      this.bloodPlagueDamage +
      this.virulentPlagueDamage +
      this.rpBonusDamage
    );
  }

  get rpSpenderName(): string {
    if (this.selectedCombatant.spec === SPECS.BLOOD_DEATH_KNIGHT) {
      return SPELLS.DEATH_STRIKE.name;
    }

    if (this.selectedCombatant.spec === SPECS.UNHOLY_DEATH_KNIGHT) {
      return SPELLS.DEATH_COIL.name;
    }

    return SPELLS.FROST_STRIKE_CAST.name;
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.ITEMS}
        size="flexible"
        tooltip={
          <>
            {this.frostFeverTotalRP > 0 && (
              <>
                <Trans id="deathknight.shared.legendaries.superstrain.frostFever.rp">
                  <strong>Runic Power:</strong> {this.frostFeverRPGained} RP gained (
                  {this.frostFeverRPWasted} wasted)
                </Trans>
                <br />
                <Trans id="deathknight.shared.legendaries.superstrain.frostFever.rpDamage">
                  <strong>Runic Power Damage:</strong> {formatNumber(this.rpBonusDamage)} damage (
                  {this.rpSpenderName} does an average of{' '}
                  {formatNumber(this.rpSpenderAverageDamage)} damage)
                  <br />
                </Trans>
              </>
            )}
            {this.frostFeverDamage > 0 && (
              <Trans id="deathknight.shared.legendaries.superstrain.frostFever.damage">
                <strong>Frost Fever:</strong> {formatNumber(this.frostFeverDamage)} damage
                <br />
              </Trans>
            )}
            {this.bloodPlagueDamage > 0 && (
              <Trans id="deathknight.shared.legendaries.superstrain.bloodPlagueDamage">
                <strong>Blood Plague:</strong> {formatNumber(this.bloodPlagueDamage)} damage
                <br />
              </Trans>
            )}
            {this.virulentPlagueDamage > 0 && (
              <Trans id="deathknight.shared.legendaries.superstrain.virulentPlagueDamage">
                <strong>Virulent Plague:</strong> {formatNumber(this.virulentPlagueDamage)} damage
                <br />
              </Trans>
            )}
          </>
        }
      >
        <BoringSpellValueText spellId={SPELLS.SUPERSTRAIN.id}>
          <>
            <ItemDamageDone amount={this.superStrainDamage} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default Superstrain;
