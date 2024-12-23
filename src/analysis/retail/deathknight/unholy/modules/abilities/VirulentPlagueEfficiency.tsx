import { defineMessage } from '@lingui/macro';
import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/deathknight';
import { SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyDebuffEvent, RefreshDebuffEvent } from 'parser/core/Events';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import Enemies from 'parser/shared/modules/Enemies';
import { encodeTargetString } from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class VirulentPlagueEfficiency extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };

  protected enemies!: Enemies;

  private targets: { [key: string]: number } = {};

  constructor(options: Options) {
    super(options);

    this.addEventListener(
      Events.refreshdebuff.by(SELECTED_PLAYER).spell(SPELLS.VIRULENT_PLAGUE),
      this.onRefresh,
    );
    this.addEventListener(
      Events.applydebuff.by(SELECTED_PLAYER).spell(SPELLS.VIRULENT_PLAGUE),
      this.onApply,
    );
  }

  get Uptime() {
    return this.enemies.getBuffUptime(SPELLS.VIRULENT_PLAGUE.id) / this.owner.fightDuration;
  }

  get UptimeSuggestionThresholds() {
    const isVpImportant =
      this.selectedCombatant.hasTalent(TALENTS.EBON_FEVER_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.SUPERSTRAIN_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS.PLAGUEBRINGER_TALENT);

    return isVpImportant
      ? {
          actual: this.Uptime,
          isLessThan: {
            minor: 0.9,
            average: 0.8,
            major: 0.7,
          },
          style: ThresholdStyle.PERCENTAGE,
        }
      : {
          actual: this.Uptime,
          isLessThan: {
            minor: 0.85,
          },
          style: ThresholdStyle.PERCENTAGE,
        };
  }

  get VirulentDuration() {
    return this.selectedCombatant.hasTalent(TALENTS.EBON_FEVER_TALENT) ? 13.65 : 27.3;
  }

  onRefresh(event: RefreshDebuffEvent) {
    this.targets[encodeTargetString(event.targetID, event.targetInstance)] =
      event.timestamp + 1000 * this.VirulentDuration;
  }

  onApply(event: ApplyDebuffEvent) {
    this.targets[encodeTargetString(event.targetID, event.targetInstance)] =
      event.timestamp + 1000 * this.VirulentDuration - 1000 * 0.3 * this.VirulentDuration;
    //Removing 3.15 seconds when buff is only applied. This is for cases when the target does not benefit from the epidemic effect (Dots spreading to adds not staying by target for instance.)
  }

  suggestions(when: When) {
    when(this.UptimeSuggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <span>
          Your <SpellLink spell={SPELLS.VIRULENT_PLAGUE} /> uptime can be improved. Try to pay
          attention to when Virulent Plague is about to fall off the priority target, using{' '}
          <SpellLink spell={SPELLS.OUTBREAK} /> to refresh Virulent Plague. Using a debuff tracker
          can help.
        </span>,
      )
        .icon(SPELLS.VIRULENT_PLAGUE.icon)
        .actual(
          defineMessage({
            id: 'deathknight.unholy.suggestions.virulentPlague.uptime',
            message: `${formatPercentage(actual)}% Virulent Plague uptime`,
          }),
        )
        .recommended(`>${formatPercentage(recommended)}% is recommended`),
    );
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(7)} size="flexible">
        <BoringSpellValueText spell={SPELLS.VIRULENT_PLAGUE.id}>
          <>
            <UptimeIcon /> {formatPercentage(this.Uptime)}% <small>uptime</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default VirulentPlagueEfficiency;
