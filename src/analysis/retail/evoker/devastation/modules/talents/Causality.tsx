import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { Trans } from '@lingui/macro';
import { SpellLink } from 'interface';

const DIS_REDUCTION_MS = 500;
const PYRE_REDUCTION_MS = 500;

class Causality extends Analyzer {
  combatant = this.selectedCombatant;
  fireBreathCooldownReduced: number = 0;
  fireBreathWastedCDR: number = 0;

  eternitySurgeCooldownReduced: number = 0;
  eternitySurgeWastedCDR: number = 0;

  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(props: Options) {
    super(props);
    this.active = this.selectedCombatant.hasTalent(TALENTS.CAUSALITY_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DISINTEGRATE),
      this._disReduceCooldown,
    );
    // TODO: This needs more work before it's ready for the world
    // Pyre reduces based on enemies hit 0.4s per target hit - maximum 2s CDR = maximum of 5 damage events should be tracked
    // It would be nice to just track after spell cast, buuut, we have volatility to take into account
    /**this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PYRE),
      this._pyreReduceCooldown,
    );**/
  }

  // TODO: Make it not just add static values, check against if spells were actually effectively reduced by full amount
  _disReduceCooldown() {
    if (!this.combatant.hasTalent(TALENTS.FONT_OF_MAGIC_DEVASTATION_TALENT)) {
      if (this.spellUsable.isOnCooldown(SPELLS.ETERNITY_SURGE.id)) {
        // Track the effective CDR
        if (this.spellUsable.cooldownRemaining(SPELLS.ETERNITY_SURGE.id) > DIS_REDUCTION_MS) {
          this.eternitySurgeCooldownReduced += DIS_REDUCTION_MS / 1000;
        } else {
          this.eternitySurgeCooldownReduced +=
            this.spellUsable.cooldownRemaining(SPELLS.ETERNITY_SURGE.id) / 1000;
          this.eternitySurgeWastedCDR +=
            (DIS_REDUCTION_MS - this.spellUsable.cooldownRemaining(SPELLS.ETERNITY_SURGE.id)) /
            1000;
        }
        this.spellUsable.reduceCooldown(SPELLS.ETERNITY_SURGE.id, DIS_REDUCTION_MS);
      } else {
        this.eternitySurgeWastedCDR += DIS_REDUCTION_MS / 1000;
      }

      if (this.spellUsable.isOnCooldown(SPELLS.FIRE_BREATH.id)) {
        // Track the effective CDR
        if (this.spellUsable.cooldownRemaining(SPELLS.FIRE_BREATH.id) > DIS_REDUCTION_MS) {
          this.fireBreathCooldownReduced += DIS_REDUCTION_MS / 1000;
        } else {
          this.fireBreathCooldownReduced +=
            this.spellUsable.cooldownRemaining(SPELLS.FIRE_BREATH.id) / 1000;
          this.fireBreathWastedCDR +=
            (DIS_REDUCTION_MS - this.spellUsable.cooldownRemaining(SPELLS.FIRE_BREATH.id)) / 1000;
        }
        this.spellUsable.reduceCooldown(SPELLS.FIRE_BREATH.id, DIS_REDUCTION_MS);
      } else {
        this.fireBreathWastedCDR += DIS_REDUCTION_MS / 1000;
      }
    } else {
      if (this.spellUsable.isOnCooldown(SPELLS.ETERNITY_SURGE_FONT.id)) {
        // Track the effective CDR
        if (this.spellUsable.cooldownRemaining(SPELLS.ETERNITY_SURGE_FONT.id) > DIS_REDUCTION_MS) {
          this.eternitySurgeCooldownReduced += DIS_REDUCTION_MS / 1000;
        } else {
          this.eternitySurgeCooldownReduced +=
            this.spellUsable.cooldownRemaining(SPELLS.ETERNITY_SURGE_FONT.id) / 1000;
          this.eternitySurgeWastedCDR +=
            (DIS_REDUCTION_MS - this.spellUsable.cooldownRemaining(SPELLS.ETERNITY_SURGE_FONT.id)) /
            1000;
        }
        this.spellUsable.reduceCooldown(SPELLS.ETERNITY_SURGE_FONT.id, DIS_REDUCTION_MS);
      } else {
        this.eternitySurgeWastedCDR += DIS_REDUCTION_MS / 1000;
      }
      if (this.spellUsable.isOnCooldown(SPELLS.FIRE_BREATH_FONT.id)) {
        // Track the effective CDR
        if (this.spellUsable.cooldownRemaining(SPELLS.FIRE_BREATH_FONT.id) > DIS_REDUCTION_MS) {
          this.fireBreathCooldownReduced += DIS_REDUCTION_MS / 1000;
        } else {
          this.fireBreathCooldownReduced +=
            this.spellUsable.cooldownRemaining(SPELLS.FIRE_BREATH_FONT.id) / 1000;
          this.fireBreathWastedCDR +=
            (DIS_REDUCTION_MS - this.spellUsable.cooldownRemaining(SPELLS.FIRE_BREATH_FONT.id)) /
            1000;
        }
        this.spellUsable.reduceCooldown(SPELLS.FIRE_BREATH_FONT.id, DIS_REDUCTION_MS);
      } else {
        this.fireBreathWastedCDR += DIS_REDUCTION_MS / 1000;
      }
    }
  }

  _pyreReduceCooldown() {
    if (this.spellUsable.isOnCooldown(SPELLS.ETERNITY_SURGE.id)) {
      this.spellUsable.reduceCooldown(SPELLS.ETERNITY_SURGE.id, PYRE_REDUCTION_MS);
    }
    if (this.spellUsable.isOnCooldown(SPELLS.FIRE_BREATH.id)) {
      this.spellUsable.reduceCooldown(SPELLS.FIRE_BREATH.id, PYRE_REDUCTION_MS);
    }
    if (this.spellUsable.isOnCooldown(SPELLS.ETERNITY_SURGE_FONT.id)) {
      this.spellUsable.reduceCooldown(SPELLS.ETERNITY_SURGE_FONT.id, PYRE_REDUCTION_MS);
    }
    if (this.spellUsable.isOnCooldown(SPELLS.FIRE_BREATH_FONT.id)) {
      this.spellUsable.reduceCooldown(SPELLS.FIRE_BREATH_FONT.id, PYRE_REDUCTION_MS);
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(60)}
        size="flexible"
        tooltip={
          <>
            <ul>
              <li>
                {' '}
                <SpellLink spell={SPELLS.FIRE_BREATH} /> CDR wasted:{' '}
                {this.fireBreathWastedCDR.toFixed(2)}s
              </li>
              <li>
                {' '}
                <SpellLink spell={SPELLS.ETERNITY_SURGE} /> CDR wasted:{' '}
                {this.eternitySurgeWastedCDR.toFixed(2)}s
              </li>
            </ul>
          </>
        }
      >
        <label style={{ margin: '10px' }}>
          <BoringSpellValueText spellId={TALENTS.CAUSALITY_TALENT.id}>
            <div>
              <BoringSpellValue
                spellId={SPELLS.ETERNITY_SURGE.id}
                value={`${this.eternitySurgeCooldownReduced.toFixed(2)}s`}
                label={<Trans>Total CDR</Trans>}
              ></BoringSpellValue>
            </div>
            <div>
              <BoringSpellValue
                spellId={SPELLS.FIRE_BREATH.id}
                value={`${this.fireBreathCooldownReduced.toFixed(2)}s`}
                label={<Trans>Total CDR</Trans>}
              ></BoringSpellValue>
            </div>
          </BoringSpellValueText>
        </label>
      </Statistic>
    );
  }
}

export default Causality;
