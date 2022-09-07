import { t, Trans } from '@lingui/macro';
import { DISSONANT_ECHOES_DAMAGE_INCREASE } from 'analysis/retail/priest/shadow/constants';
import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Events, { DamageEvent } from 'parser/core/Events';
import { Options } from 'parser/core/Module';
import { When, ThresholdStyle } from 'parser/core/ParseResults';
import EventHistory from 'parser/shared/modules/EventHistory';
import ConduitSpellText from 'parser/ui/ConduitSpellText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class DissonantEchoes extends Analyzer {
  static dependencies = {
    eventHistory: EventHistory,
  };
  protected eventHistory!: EventHistory;

  conduitRank = 0;
  damage = 0;
  procsGained = 0;
  procsUsed = 0;

  get procsWasted() {
    return this.procsGained - this.procsUsed;
  }

  get procsWastedPercentage() {
    return this.procsWasted / this.procsGained;
  }

  constructor(options: Options) {
    super(options);

    this.conduitRank = this.selectedCombatant.conduitRankBySpellID(SPELLS.DISSONANT_ECHOES.id);
    if (!this.conduitRank) {
      this.active = false;
      return;
    }

    this.addEventListener(Events.damage.by(SELECTED_PLAYER).spell(SPELLS.VOID_BOLT), this.onDamage);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DISSONANT_ECHOES_BUFF),
      this.onBuffApplied,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.DISSONANT_ECHOES_BUFF),
      this.onBuffRemoved,
    );
  }

  onDamage(event: DamageEvent) {
    this.damage += calculateEffectiveDamage(event, DISSONANT_ECHOES_DAMAGE_INCREASE);
  }

  onBuffApplied() {
    this.procsGained += 1;
  }

  onBuffRemoved() {
    if (
      this.eventHistory.last(1, 100, Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VOID_BOLT))
        .length === 0
    ) {
      return;
    }

    this.procsUsed += 1;
  }

  get suggestionThresholds() {
    return {
      actual: this.procsWastedPercentage,
      isGreaterThan: {
        minor: 0,
        average: 0,
        major: 0.1,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          You wasted {this.procsWasted} out of {this.procsGained}{' '}
          <SpellLink id={SPELLS.DISSONANT_ECHOES_BUFF.id} /> procs. Make sure to use these procs to
          benefit from the increased <SpellLink id={SPELLS.VOID_BOLT.id} /> damage and extend your
          damage over time abilities.
        </>,
      )
        .icon(SPELLS.DISSONANT_ECHOES_BUFF.icon)
        .actual(
          t({
            id: 'priest.shadow.conduits.dissonantEchoes.efficiency',
            message: `You wasted ${this.procsWasted} out of ${this.procsGained} Dissonant Echoes procs.`,
          }),
        )
        .recommended(`None wasted is recommended.`),
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.COVENANTS}
        tooltip={
          <>
            <Trans id="priest.shadow.conduits.dissonantEchoes.tooltip">
              You used {this.procsUsed} out of the {this.procsGained} procs gained.
              <br />
              <br />
              Total damage: {formatNumber(this.damage)}
            </Trans>
          </>
        }
      >
        <ConduitSpellText spellId={SPELLS.DISSONANT_ECHOES.id} rank={this.conduitRank}>
          <>
            <ItemDamageDone amount={this.damage} /> <br />
          </>
        </ConduitSpellText>
      </Statistic>
    );
  }
}

export default DissonantEchoes;
