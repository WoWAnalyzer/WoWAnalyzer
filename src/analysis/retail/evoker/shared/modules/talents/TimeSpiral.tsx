import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { TALENTS_EVOKER } from 'common/TALENTS';
import TalentSpellText from 'parser/ui/TalentSpellText';
import SPELLS from 'common/SPELLS';
import Events, {
  ApplyBuffEvent,
  CastEvent,
  RefreshBuffEvent,
  RemoveBuffEvent,
} from 'parser/core/Events';
import { InformationIcon, SoupIcon, WarningIcon } from 'interface/icons';
import { TIME_SPIRAL_BASE_DURATION_MS } from '../../constants';
import { TIMEWALKER_BASE_EXTENSION } from 'analysis/retail/evoker/augmentation/constants';
import StatTracker from 'parser/shared/modules/StatTracker';
import SPECS from 'game/SPECS';
import {
  hasTimeSpiralCastEvent,
  hasTimeSpiralConsumeEvent,
} from '../normalizers/MobilityCastLinkNormalizer';
import SpellLink from 'interface/SpellLink';
/**
 * Grants all players in the group a buff that grants them 1 free cast of their movement ability within 10 sec.
 * Aug: Available duration increased by Mastery.
 */
class TimeSpiral extends Analyzer {
  static dependencies = {
    stats: StatTracker,
  };
  protected stats!: StatTracker;
  timeSpiralApplyTimestamps: { [key: number]: number } = {};
  timeSpiralTimestampExists: { [key: number]: boolean } = {};
  timeSpiralDuration: { [key: number]: number } = {};
  externalBuffsApplied = 0;
  externalBuffsUsed = 0;
  personalBuffsApplied = 0;
  personalBuffsUsed = 0;
  constructor(options: Options) {
    super(options);
    const timeSpiralBuffs = [
      SPELLS.TIME_SPIRAL_DEATH_KNIGHT_BUFF,
      SPELLS.TIME_SPIRAL_DEMON_HUNTER_BUFF,
      SPELLS.TIME_SPIRAL_DRUID_BUFF,
      SPELLS.TIME_SPIRAL_EVOKER_BUFF,
      SPELLS.TIME_SPIRAL_HUNTER_BUFF,
      SPELLS.TIME_SPIRAL_HUNTER_BUFF,
      SPELLS.TIME_SPIRAL_MAGE_BUFF,
      SPELLS.TIME_SPIRAL_MONK_BUFF,
      SPELLS.TIME_SPIRAL_PALADIN_BUFF,
      SPELLS.TIME_SPIRAL_PRIEST_BUFF,
      SPELLS.TIME_SPIRAL_ROGUE_BUFF,
      SPELLS.TIME_SPIRAL_SHAMAN_BUFF,
      SPELLS.TIME_SPIRAL_WARLOCK_BUFF,
      SPELLS.TIME_SPIRAL_WARRIOR_BUFF,
    ];
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.TIME_SPIRAL_TALENT);

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.HOVER), this.onHoverCast);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(timeSpiralBuffs),
      this.onApplyRefreshBuff,
    );

    this.addEventListener(
      Events.refreshbuff.by(SELECTED_PLAYER).spell(timeSpiralBuffs),
      this.onApplyRefreshBuff,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(timeSpiralBuffs),
      this.onRemoveBuff,
    );
  }

  onHoverCast(event: CastEvent) {}

  onApplyRefreshBuff(event: ApplyBuffEvent | RefreshBuffEvent) {
    if (!hasTimeSpiralCastEvent(event) && event.targetID !== this.selectedCombatant.id) {
      //Precast Time Spiral, cannot determine event duration.
      //For personal Time Spirals, we can instead use a CastLink to determine if it was consumed.
      return;
    }
    if (event.targetID === this.selectedCombatant.id) {
      this.personalBuffsApplied += 1;
    } else {
      this.externalBuffsApplied += 1;
    }
    this.timeSpiralApplyTimestamps[event.targetID] = event.timestamp;
    this.timeSpiralTimestampExists[event.targetID] = true;
    this.timeSpiralDuration[event.targetID] = this.calculateTimeSpiralBuffDuration();
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    if (event.targetID === this.selectedCombatant.id) {
      if (hasTimeSpiralConsumeEvent(event)) {
        this.personalBuffsUsed += 1;
      }
    } else {
      if (!this.timeSpiralTimestampExists[event.targetID]) {
        //Can occur if Time Spiral was precast, but we have no way of knowing the buff duration in this case.
        return;
      }
      // 900 (0.9 * 1000) is used to account for variations in timestamp.
      if (
        event.timestamp <
        this.timeSpiralApplyTimestamps[event.targetID] +
          this.timeSpiralDuration[event.targetID] * 900
      ) {
        // This can also be triggered by the player dying or cancelling the buff, but the former would require querying to check, and the latter is unlikely.
        this.externalBuffsUsed += 1;
      }
    }
    this.timeSpiralTimestampExists[event.targetID] = false;
  }

  calculateTimeSpiralBuffDuration() {
    if (this.selectedCombatant.spec !== SPECS.AUGMENTATION_EVOKER) {
      return TIME_SPIRAL_BASE_DURATION_MS / 1000;
    } else {
      return (
        (TIME_SPIRAL_BASE_DURATION_MS / 1000) *
        (1 + TIMEWALKER_BASE_EXTENSION + this.stats.currentMasteryPercentage)
      );
    }
  }

  statistic() {
    const externalBuffsWasted = Math.max(this.externalBuffsApplied - this.externalBuffsUsed, 0);
    const personalBuffsWasted = Math.max(this.personalBuffsApplied - this.personalBuffsUsed, 0);
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>Other players dying with or cancelling the buff will also trigger the 'used' count.</>
        }
      >
        <TalentSpellText talent={TALENTS_EVOKER.TIME_SPIRAL_TALENT}>
          <div>
            <SoupIcon /> {this.personalBuffsUsed}
            <small>
              {' '}
              personal <SpellLink spell={SPELLS.HOVER} /> casts gained
            </small>
            {personalBuffsWasted > 0 && (
              <>
                <br />
                <WarningIcon /> {personalBuffsWasted}
                <small>
                  {' '}
                  personal <SpellLink spell={SPELLS.HOVER} /> casts wasted
                </small>
              </>
            )}
            <br />
            <InformationIcon /> {this.externalBuffsUsed}
            <small> external buffs used</small>
            {externalBuffsWasted > 0 && (
              <>
                <br />
                <WarningIcon /> {externalBuffsWasted}
                <small> external buffs unused</small>
              </>
            )}
          </div>
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default TimeSpiral;
