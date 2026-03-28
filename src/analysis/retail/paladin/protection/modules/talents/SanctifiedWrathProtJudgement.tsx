import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent, ResourceChangeEvent } from 'parser/core/Events';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { Abilities } from '../../gen';

/**
 * Analyzer to track additional and wasted Holy Power from Sanctified Wrath for Protection Paladins.
 * During Avenging Wrath or Sentinel, Hammer of Wrath generates 1 additional Holy Power.
 */
class SanctifiedWrathProtJudgement extends Analyzer {
  buffedHammerCasts = 0;
  hammerCasts = 0;
  holyPowerWastes: number[] = [];
  MAX_HOLY_POWER = 5;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SANCTIFIED_WRATH_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HAMMER_OF_WRATH),
      this.trackHammerCasts,
    );
    // Listen to resource change events for the energize effect (may have a separate ID)
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.JUDGMENT_HP_ENERGIZE),
      this.trackWastedHP,
    );
  }

  trackHammerCasts(event: CastEvent) {
    const hasBuff =
      this.selectedCombatant.hasBuff(TALENTS.AVENGING_WRATH_TALENT.id) ||
      this.selectedCombatant.hasBuff(TALENTS.SENTINEL_TALENT.id);
    if (hasBuff) {
      this.hammerCasts += 1;
      this.buffedHammerCasts += 2;
    }
  }

  trackWastedHP(event: ResourceChangeEvent) {
    const hasBuff =
      this.selectedCombatant.hasBuff(TALENTS.AVENGING_WRATH_TALENT.id) ||
      this.selectedCombatant.hasBuff(TALENTS.SENTINEL_TALENT.id);
    if (!hasBuff) {
      return;
    }

    const wasted = event.waste || 0;
    if (wasted === 0) {
      return;
    }

    // Hammer of Wrath normally generates 1 Holy Power; with Sanctified Wrath it generates 2.
    // If pre-cast HP > 3, the extra 1 HP will be wasted.
    const preCastHP = this.MAX_HOLY_POWER - (event.resourceChange - wasted);
    if (preCastHP > 3) {
      this.holyPowerWastes.push(wasted);
    }
  }

  get totalWastedHP(): number {
    return this.holyPowerWastes.reduce((sum, cur) => sum + cur, 0);
  }

  get bonusHP(): number {
    // Each buffed Hammer cast gives +1 Holy Power (instead of +0)
    return this.buffedHammerCasts - this.totalWastedHP;
  }

  statistic() {
    const totalWastedHP = this.totalWastedHP;
    const bonusHP = this.bonusHP;
    return (
      <Statistic
        position={STATISTIC_ORDER.DEFAULT}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            <b>{this.hammerCasts}</b> Hammer of Wrath casts during Avenging Wrath or Sentinel.
            <br />
            <b>{this.buffedHammerCasts}</b> additional Holy Power generated (1 per cast).
            <br />
            <b>{totalWastedHP}</b> additional Holy Power wasted by overcapping.
          </>
        }
      >
        <BoringSpellValue
          spell={TALENTS.SANCTIFIED_WRATH_TALENT.id}
          value={formatNumber(bonusHP)}
          label="Extra Holy Power"
        />
      </Statistic>
    );
  }
}

export default SanctifiedWrathProtJudgement;
