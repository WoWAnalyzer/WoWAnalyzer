import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import TALENTS from 'common/TALENTS/evoker';
import SPELLS from 'common/SPELLS/evoker';
import Events, { ApplyBuffEvent, RemoveBuffEvent, ResourceChangeEvent } from 'parser/core/Events';
import { formatNumber, formatPercentage } from 'common/format';
import Combatants from 'parser/shared/modules/Combatants';
import Soup from 'interface/icons/Soup';
import { InformationIcon } from 'interface/icons';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';

type SourceOfMagicWindow = {
  start: number;
  end: number;
  player: string;
};

const MANA_POOL_SIZE = 2500000;

class SourceOfMagic extends Analyzer {
  static dependencies = {
    combatants: Combatants,
  };
  protected combatants!: Combatants;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.SOURCE_OF_MAGIC_TALENT);

    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.SOURCE_OF_MAGIC_MANA_GAIN),
      (event) => this.onResourceChange(event),
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS.SOURCE_OF_MAGIC_TALENT),
      (event) => this.onRemoveBuff(event),
    );
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.SOURCE_OF_MAGIC_TALENT),
      (event) => this.onApplyBuff(event),
    );
    this.addEventListener(Events.fightend, () => {
      if (this.sourceOfMagicActive && this.sourceOfMagicWindows.length) {
        this.sourceOfMagicWindows[this.sourceOfMagicWindows.length - 1].end =
          this.owner.fight.end_time;
      }
    });
  }

  totalManaGainedFromSourceOfMagic = 0;
  totalManaWastedFromSourceOfMagic = 0;

  sourceOfMagicActive = false;

  sourceOfMagicWindows: SourceOfMagicWindow[] = [];

  onResourceChange(event: ResourceChangeEvent) {
    // Just incase the applybuff didn't get fabricated properly
    if (!this.sourceOfMagicActive) {
      this.addSourceOfMagicWindow(event);
      this.sourceOfMagicActive = true;
    }

    this.totalManaGainedFromSourceOfMagic += event.resourceChange - event.waste;
    this.totalManaWastedFromSourceOfMagic += event.waste;
  }

  onApplyBuff(event: ApplyBuffEvent) {
    this.addSourceOfMagicWindow(event);
    this.sourceOfMagicActive = true;
  }

  onRemoveBuff(event: RemoveBuffEvent) {
    // Just incase the applybuff didn't get fabricated properly
    if (!this.sourceOfMagicWindows.length) {
      this.addSourceOfMagicWindow(event, true);
    }

    const activeWindow = this.sourceOfMagicWindows.find(
      (windows) => windows.player === this.getPlayerName(event) && windows.end === -1,
    );
    if (activeWindow) {
      activeWindow.end = event.timestamp;
    }

    this.sourceOfMagicActive = false;
  }

  addSourceOfMagicWindow(
    event: ApplyBuffEvent | ResourceChangeEvent | RemoveBuffEvent,
    isInitial = false,
  ) {
    const playerName = this.getPlayerName(event);

    /** Due to Source of Magic normally being applied pre-combat we usually don't
     * have applybuff events, since we work around this by "pretending" our first
     * resourceChange event is an applybuff event, we then need to make sure if the
     * buff is refreshed on the same player that we don't add a new window.
     * Since the combatlog will treat it as a new buff instead of a refresh. */
    if (
      this.sourceOfMagicWindows.length &&
      this.sourceOfMagicActive &&
      this.sourceOfMagicWindows[this.sourceOfMagicWindows.length - 1].player === playerName
    ) {
      return;
    }

    this.sourceOfMagicWindows.push({
      start: isInitial ? this.owner.fight.start_time : event.timestamp,
      end: -1,
      player: playerName,
    });
  }

  getPlayerName(event: ApplyBuffEvent | ResourceChangeEvent | RemoveBuffEvent): string {
    if (!this.combatants.players[event.targetID]) {
      return '';
    }
    return this.combatants.players[event.targetID].name;
  }

  statistic() {
    if (!this.active) {
      return null;
    }

    return (
      <Statistic size="flexible" category={STATISTIC_CATEGORY.TALENTS}>
        <TalentSpellText talent={TALENTS.SOURCE_OF_MAGIC_TALENT}>
          <div>
            <Soup /> {formatNumber(this.totalManaGainedFromSourceOfMagic)}
            <small>
              {' '}
              mana generated (
              {formatPercentage(this.totalManaGainedFromSourceOfMagic / MANA_POOL_SIZE)}%)
            </small>
          </div>
          {this.totalManaWastedFromSourceOfMagic > 0 && (
            <div>
              <InformationIcon /> {formatNumber(this.totalManaWastedFromSourceOfMagic)}
              <small> mana generation wasted</small>
            </div>
          )}
        </TalentSpellText>
      </Statistic>
    );
  }
}

export default SourceOfMagic;
