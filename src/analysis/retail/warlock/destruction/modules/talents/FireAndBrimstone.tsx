import { formatThousands, formatNumber, formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/warlock';
import HIT_TYPES from 'game/HIT_TYPES';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent } from 'parser/core/Events';
import ISSUE_IMPORTANCE from 'parser/core/ISSUE_IMPORTANCE';
import { When } from 'parser/core/ParseResults';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

const debug = false;

type Target = {
  timestamp: number;
  targetID: CastEvent['targetID'];
  targetInstance: CastEvent['targetInstance'];
};

class FireAndBrimstone extends Analyzer {
  get dps() {
    return (this.bonusDmg / this.owner.fightDuration) * 1000;
  }

  _primaryTargets: Target[] = [];
  bonusFragments = 0;
  bonusDmg = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.FIRE_AND_BRIMSTONE_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.INCINERATE),
      this.onIncinerateCast,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.INCINERATE),
      this.onIncinerateDamage,
    );
  }

  onIncinerateCast(event: CastEvent) {
    debug && this.log(`Storing Incinerate cast on ${event.targetID}, ${event.targetInstance}`);
    this._primaryTargets.push({
      timestamp: event.timestamp,
      targetID: event.targetID,
      targetInstance: event.targetInstance,
    });
  }

  onIncinerateDamage(event: DamageEvent) {
    // should find FIRST (oldest) Incinerate cast, so even though you can fire multiple Incinerates before the first hits, this should pair the events correctly even if they have the same ID and instance
    const primaryTargetEventIndex = this._primaryTargets.findIndex(
      (primary) =>
        primary.targetID === event.targetID && primary.targetInstance === event.targetInstance,
    );
    if (primaryTargetEventIndex !== -1) {
      debug && this.log(`Found Incinerate cast on ${event.targetID}, ${event.targetInstance}`);
      // it's a Incinerate damage on primary target, delete the event so it doesn't interfere with another casts
      this._primaryTargets.splice(primaryTargetEventIndex, 1);
      return;
    }
    debug && this.log(`Incinerate CLEAVE on ${event.targetID}, ${event.targetInstance}`);
    // should be cleaved damage
    this.bonusFragments += event.hitType === HIT_TYPES.CRIT ? 2 : 1;
    this.bonusDmg += event.amount + (event.absorbed || 0);
    debug && this.log(`Current bonus fragments: ${this.bonusFragments}`);
  }

  suggestions(when: When) {
    // this is incorrect in certain situations with pre-casted Incinerates, but there's very little I can do about it
    // example: pre-cast Incinerate -> *combat starts* -> hard cast Incinerate -> first Incinerate lands -> second Incinerate lands
    // but because the second Incinerate "technically" doesn't have a cast event to pair with, it's incorrectly recognized as cleaved
    when(this.bonusFragments)
      .isEqual(0)
      .addSuggestion((suggest) =>
        suggest(
          <>
            Your <SpellLink spell={TALENTS.FIRE_AND_BRIMSTONE_TALENT} icon /> talent didn't
            contribute any bonus fragments. When there are no adds to cleave onto, this talent is
            useless and you should switch to a different talent.
          </>,
        )
          .icon(TALENTS.FIRE_AND_BRIMSTONE_TALENT.icon)
          .actual('No bonus Soul Shard Fragments generated')
          .recommended('Different talent is recommended')
          .staticImportance(ISSUE_IMPORTANCE.MAJOR),
      );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={`${formatThousands(this.bonusDmg)} bonus cleaved damage`}
      >
        <BoringSpellValueText spell={TALENTS.FIRE_AND_BRIMSTONE_TALENT}>
          {this.bonusFragments} <small>bonus Soul Shard Fragments</small> <br />
          {formatNumber(this.dps)} DPS{' '}
          <small>
            {formatPercentage(this.owner.getPercentageOfTotalDamageDone(this.bonusDmg))} % of total
          </small>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default FireAndBrimstone;
