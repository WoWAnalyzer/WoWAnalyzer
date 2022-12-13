import SPELLS from 'common/SPELLS';
import Spell from 'common/SPELLS/Spell';
import talents from 'common/TALENTS/monk';
import HIT_TYPES from 'game/HIT_TYPES';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import CastEfficiency from 'parser/shared/modules/CastEfficiency';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import StatTracker from 'parser/shared/modules/StatTracker';

import SharedBrews from '../core/SharedBrews';

const TIGER_PALM_REDUCTION = 1000;
const FACE_PALM_REDUCTION = 1000;
const BUFF_BUFFER = 100;
const TP_AP_COEFF = 0.27;

const AMP_FP = 3;
const AMP_CS = 2;
const AMP_BOC = 2;

// TODO: revisit with real logs
class TigerPalm extends Analyzer {
  static dependencies = {
    brews: SharedBrews,
    statTracker: StatTracker,
    spellUsable: SpellUsable,
    castEfficiency: CastEfficiency,
  };

  cdr = 0;
  wastedCDR = 0;
  fpCdr = 0;
  wastedFpCdr = 0;

  protected brews!: SharedBrews;
  protected statTracker!: StatTracker;
  protected spellUsable!: SpellUsable;
  protected castEfficiency!: CastEfficiency;

  private hasBoC = false;
  private hasCounterstrike = false;
  private hasFp = false;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.TIGER_PALM),
      this.onDamage,
    );

    this.hasFp = this.selectedCombatant.hasTalent(talents.FACE_PALM_TALENT);
    this.hasBoC = this.selectedCombatant.hasTalent(talents.BLACKOUT_COMBO_TALENT);
    this.hasCounterstrike = this.selectedCombatant.hasTalent(talents.COUNTERSTRIKE_TALENT);
  }

  get totalCasts(): number {
    return this.castEfficiency.getCastEfficiencyForSpell(SPELLS.TIGER_PALM)?.casts ?? 0;
  }

  private hasAmpBuff(event: DamageEvent, spell: Spell) {
    return this.selectedCombatant.hasBuff(spell.id, event.timestamp - BUFF_BUFFER);
  }

  private hasBoCBuff(event: DamageEvent): boolean {
    // TODO: make this robust against off-gcd consumption by PB
    return this.hasBoC && this.hasAmpBuff(event, SPELLS.BLACKOUT_COMBO_BUFF);
  }

  private hasCounterstrikeBuff(event: DamageEvent): boolean {
    return this.hasCounterstrike && this.hasAmpBuff(event, SPELLS.COUNTERSTRIKE_BUFF);
  }

  /**
   * Checking if a damage event benefits from face palm is slightly complicated. We need to know the other major damage buffs the TP benefitted from so we can check if there is a further +200% from a Face Palm proc.
   *
   * This is relatively robust against smaller buffs like unknown temporary versatility or damage amp buffs, since FP is *so* large (+200%!).
   */
  private hasFacePalmBuff(event: DamageEvent, priorAmp: number): boolean {
    if (!this.hasFp || !event.attackPower) {
      // bail. the latter is super uncommon, and a pain to work around
      return false;
    }

    const expectedRawHit = (event.attackPower ?? 0) * TP_AP_COEFF;
    const expectedPriorAmpHit = expectedRawHit * priorAmp;
    const expectedFpHit = expectedPriorAmpHit * AMP_FP;

    // unmitigated amount is spicy when looking at player-sourced damage events
    const actualHit = event.amount + (event.absorbed ?? 0) + (event.overkill ?? 0);

    return actualHit - expectedPriorAmpHit > (expectedFpHit - expectedPriorAmpHit) / 2;
  }

  onDamage(event: DamageEvent) {
    // OK SO we have a hit, lets reduce the CD by the base amount...
    const actualReduction = this.brews.reduceCooldown(TIGER_PALM_REDUCTION);
    this.cdr += actualReduction;
    this.wastedCDR += TIGER_PALM_REDUCTION - actualReduction;

    let amplifier = event.hitType === HIT_TYPES.CRIT ? 2 : 1;
    if (this.hasCounterstrikeBuff(event)) {
      amplifier *= AMP_CS;
    }

    if (this.hasBoCBuff(event)) {
      amplifier *= AMP_BOC;
    }

    if (this.hasFacePalmBuff(event, amplifier)) {
      amplifier *= AMP_FP;
      // apply FP CDR
      const actualReduction = this.brews.reduceCooldown(FACE_PALM_REDUCTION);
      this.fpCdr += actualReduction;
      this.wastedCDR += FACE_PALM_REDUCTION - actualReduction;
    }
  }
}

export default TigerPalm;
