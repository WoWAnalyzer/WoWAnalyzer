import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent, FightEndEvent } from 'parser/core/Events';
import Abilities from 'parser/core/modules/Abilities';
import UptimeIcon from 'interface/icons/Uptime';
import { formatPercentage } from 'common/format';
import EventHistory from 'parser/shared/modules/EventHistory';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import Haste from 'parser/shared/modules/Haste';
import { TIERS } from 'game/TIERS';

class Tier29ShadowPriest4Set extends Analyzer {
  static dependencies = {
    abilities: Abilities,
    eventHistory: EventHistory,
    spellUsable: SpellUsable,
    haste: Haste,
  };
  protected abilities!: Abilities;
  protected eventHistory!: EventHistory;
  protected spellUsable!: SpellUsable;
  protected haste!: Haste;
  has4Piece: boolean = true;

  uptime4Set = 0; //Buff uptime in milliseconds
  is4SetActive = false;
  timestampOfLast4SetActivation = 0; //Used to calculate uptime in case the fight ends with the buff active

  constructor(options: Options) {
    super(options);
    this.has4Piece = this.selectedCombatant.has4PieceByTier(TIERS.DF1);
    this.active = this.has4Piece;

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_PRIEST_TIER_29_4_SET_BUFF),
      this.onBuffApplied,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.SHADOW_PRIEST_TIER_29_4_SET_BUFF),
      this.onBuffRemoved,
    );

    this.addEventListener(Events.fightend, this.onFightEnd);
  }

  onBuffApplied(Event: ApplyBuffEvent) {
    this.is4SetActive = true;
    this.timestampOfLast4SetActivation = Event.timestamp;
  }

  onBuffRemoved(Event: RemoveBuffEvent) {
    this.uptime4Set += Event.timestamp - this.timestampOfLast4SetActivation;
    this.is4SetActive = false;
  }

  onFightEnd(Event: FightEndEvent) {
    if (this.is4SetActive) {
      this.uptime4Set += Event.timestamp - this.timestampOfLast4SetActivation;
    }
  }

  statistic() {
    const uptimePercent = formatPercentage(this.uptime4Set / this.owner.fightDuration);
    if (this.has4Piece) {
      return (
        <Statistic category={STATISTIC_CATEGORY.ITEMS} size="flexible">
          <BoringSpellValueText spell={SPELLS.SHADOW_PRIEST_TIER_29_4_SET_BUFF}>
            <UptimeIcon /> {uptimePercent}% <small>uptime</small>
          </BoringSpellValueText>
        </Statistic>
      );
    }
  }
}
export default Tier29ShadowPriest4Set;
