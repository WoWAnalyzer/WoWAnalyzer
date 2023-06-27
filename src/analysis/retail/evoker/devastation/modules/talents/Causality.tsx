import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/evoker';
import Analyzer, { Options } from 'parser/core/Analyzer';
import { SELECTED_PLAYER } from 'parser/core/EventFilter';
import Events, { DamageEvent, ApplyBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';

import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import BoringSpellValue from 'parser/ui/BoringSpellValue';

import { SpellLink } from 'interface';
import {
  CAUSALITY_DISINTEGRATE_CDR_MS,
  CAUSALITY_PYRE_CDR_MS,
} from 'analysis/retail/evoker/devastation/constants';
import TalentSpellText from 'parser/ui/TalentSpellText';

class Causality extends Analyzer {
  combatant = this.selectedCombatant;
  fireBreathCooldownReduced: number = 0;
  fireBreathWastedCDR: number = 0;
  fireBreatWastedCDRDuringBlazing: number = 0;

  eternitySurgeCooldownReduced: number = 0;
  eternitySurgeWastedCDR: number = 0;
  eternitySurgeWastedCDRDuringBlazing: number = 0;

  pyreCounter: number = 0;
  maxPyreCount: number = 5;

  pyreDamageEvent: number = 0;
  previousPyreDamageEvent: number = 0;

  pyreFromDragonrage: number = 0;
  dragonRageApplied: number = 0;

  static dependencies = {
    spellUsable: SpellUsable,
  };
  protected spellUsable!: SpellUsable;

  constructor(props: Options) {
    super(props);
    this.active = this.selectedCombatant.hasTalent(TALENTS.CAUSALITY_TALENT);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.DISINTEGRATE),
      this.disReduceCooldown,
    );

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.PYRE),
      this.pyreReduceCooldown,
    );

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.DRAGONRAGE_TALENT),
      this.dragonRage,
    );
  }

  // Pyre can at most trigger 5 CDR events per cast (this includes Pyres procced from Volatility and Dragonrage)
  // With how dragonrage pyres work however, that would actually be 15 events (3xpyres)
  private pyreReduceCooldown(event: DamageEvent) {
    this.pyreDamageEvent = event.timestamp;

    if (this.previousPyreDamageEvent < this.dragonRageApplied) {
      this.pyreCounter = 0;
      this.previousPyreDamageEvent = this.pyreDamageEvent;
    }
    if (this.previousPyreDamageEvent < this.pyreDamageEvent) {
      this.pyreFromDragonrage = 0;
      this.pyreCounter = 0;
      this.previousPyreDamageEvent = this.pyreDamageEvent;
    }
    this.pyreCounter += 1;
    if (this.pyreCounter <= this.maxPyreCount + this.pyreFromDragonrage * 3) {
      this.calculateCDR(CAUSALITY_PYRE_CDR_MS);
    }
  }

  private disReduceCooldown() {
    this.calculateCDR(CAUSALITY_DISINTEGRATE_CDR_MS);
  }

  dragonRage(event: ApplyBuffEvent) {
    this.dragonRageApplied = event.timestamp;
    this.pyreFromDragonrage = 1;
  }

  // TODO: possibly track CDR gained from pyre and dis seperatly
  // TODO: Simplify at some point.
  calculateCDR(CDRAmount: number) {
    const CDRAmountSeconds = CDRAmount / 1000;
    if (!this.combatant.hasTalent(TALENTS.FONT_OF_MAGIC_DEVASTATION_TALENT)) {
      if (this.spellUsable.isOnCooldown(SPELLS.ETERNITY_SURGE.id)) {
        // Track the effective CDR
        if (this.spellUsable.cooldownRemaining(SPELLS.ETERNITY_SURGE.id) > CDRAmount) {
          this.eternitySurgeCooldownReduced += CDRAmountSeconds;
        } else {
          this.eternitySurgeCooldownReduced +=
            this.spellUsable.cooldownRemaining(SPELLS.ETERNITY_SURGE.id) / 1000;
          this.eternitySurgeWastedCDR +=
            (CDRAmount - this.spellUsable.cooldownRemaining(SPELLS.ETERNITY_SURGE.id)) / 1000;
        }
        // Reduce the CD
        this.spellUsable.reduceCooldown(SPELLS.ETERNITY_SURGE.id, CDRAmount);
      } else {
        if (this.combatant.hasBuff(SPELLS.BLAZING_SHARDS.id)) {
          this.eternitySurgeWastedCDRDuringBlazing += CDRAmountSeconds;
        }
        this.eternitySurgeWastedCDR += CDRAmountSeconds;
      }

      if (this.spellUsable.isOnCooldown(SPELLS.FIRE_BREATH.id)) {
        // Track the effective CDR
        if (this.spellUsable.cooldownRemaining(SPELLS.FIRE_BREATH.id) > CDRAmount) {
          this.fireBreathCooldownReduced += CDRAmountSeconds;
        } else {
          this.fireBreathCooldownReduced +=
            this.spellUsable.cooldownRemaining(SPELLS.FIRE_BREATH.id) / 1000;
          this.fireBreathWastedCDR +=
            (CDRAmount - this.spellUsable.cooldownRemaining(SPELLS.FIRE_BREATH.id)) / 1000;
        }
        // Reduce the CD
        this.spellUsable.reduceCooldown(SPELLS.FIRE_BREATH.id, CDRAmount);
      } else {
        if (this.combatant.hasBuff(SPELLS.BLAZING_SHARDS.id)) {
          this.fireBreatWastedCDRDuringBlazing += CDRAmountSeconds;
        }
        this.fireBreathWastedCDR += CDRAmountSeconds;
      }
    } else {
      if (this.spellUsable.isOnCooldown(SPELLS.ETERNITY_SURGE_FONT.id)) {
        // Track the effective CDR
        if (this.spellUsable.cooldownRemaining(SPELLS.ETERNITY_SURGE_FONT.id) > CDRAmount) {
          this.eternitySurgeCooldownReduced += CDRAmountSeconds;
        } else {
          this.eternitySurgeCooldownReduced +=
            this.spellUsable.cooldownRemaining(SPELLS.ETERNITY_SURGE_FONT.id) / 1000;
          this.eternitySurgeWastedCDR +=
            (CDRAmount - this.spellUsable.cooldownRemaining(SPELLS.ETERNITY_SURGE_FONT.id)) / 1000;
        }
        // Reduce the CD
        this.spellUsable.reduceCooldown(SPELLS.ETERNITY_SURGE_FONT.id, CDRAmount);
      } else {
        if (this.combatant.hasBuff(SPELLS.BLAZING_SHARDS.id)) {
          this.eternitySurgeWastedCDRDuringBlazing += CDRAmountSeconds;
        }
        this.eternitySurgeWastedCDR += CDRAmountSeconds;
      }
      if (this.spellUsable.isOnCooldown(SPELLS.FIRE_BREATH_FONT.id)) {
        // Track the effective CDR
        if (this.spellUsable.cooldownRemaining(SPELLS.FIRE_BREATH_FONT.id) > CDRAmount) {
          this.fireBreathCooldownReduced += CDRAmountSeconds;
        } else {
          this.fireBreathCooldownReduced +=
            this.spellUsable.cooldownRemaining(SPELLS.FIRE_BREATH_FONT.id) / 1000;
          this.fireBreathWastedCDR +=
            (CDRAmount - this.spellUsable.cooldownRemaining(SPELLS.FIRE_BREATH_FONT.id)) / 1000;
        }
        // Reduce the CD
        this.spellUsable.reduceCooldown(SPELLS.FIRE_BREATH_FONT.id, CDRAmount);
      } else {
        if (this.combatant.hasBuff(SPELLS.BLAZING_SHARDS.id)) {
          this.fireBreatWastedCDRDuringBlazing += CDRAmountSeconds;
        }
        this.fireBreathWastedCDR += CDRAmountSeconds;
      }
    }
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(60)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            <li>
              {' '}
              <SpellLink spell={SPELLS.FIRE_BREATH} /> CDR wasted:{' '}
              <strong>{this.fireBreathWastedCDR.toFixed(2)}s</strong> of which{' '}
              <strong>{this.fireBreatWastedCDRDuringBlazing.toFixed(2)}s</strong> was during{' '}
              <SpellLink spell={SPELLS.BLAZING_SHARDS} />
            </li>
            <li>
              {' '}
              <SpellLink spell={SPELLS.ETERNITY_SURGE} /> CDR wasted:{' '}
              <strong>{this.eternitySurgeWastedCDR.toFixed(2)}s</strong> of which{' '}
              <strong>{this.eternitySurgeWastedCDRDuringBlazing.toFixed(2)}s</strong> was during{' '}
              <SpellLink spell={SPELLS.BLAZING_SHARDS} />
            </li>
          </>
        }
      >
        <TalentSpellText talent={TALENTS.CAUSALITY_TALENT}>
          <div>
            <BoringSpellValue
              spellId={SPELLS.ETERNITY_SURGE.id}
              value={`${this.eternitySurgeCooldownReduced.toFixed(2)}s`}
              label={<>Total CDR</>}
            ></BoringSpellValue>
          </div>
          <div>
            <BoringSpellValue
              spellId={SPELLS.FIRE_BREATH.id}
              value={`${this.fireBreathCooldownReduced.toFixed(2)}s`}
              label={<>Total CDR</>}
            ></BoringSpellValue>
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default Causality;
