import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import { GUIDE_EXPLANATION_PERCENT_WIDTH, ON_CAST_BUFF_REMOVAL_GRACE_MS } from '../../constants';
import { ExplanationAndDataSubSection } from 'interface/guide/components/ExplanationRow';

const AFFECTED_ABILITIES = [
  SPELLS.LIGHTNING_BOLT_OVERLOAD,
  SPELLS.LIGHTNING_BOLT,
  SPELLS.CHAIN_LIGHTNING_OVERLOAD,
  TALENTS.CHAIN_LIGHTNING_TALENT,
];

class Stormkeeper extends Analyzer {
  damageDoneByBuffedCasts = 0;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.getRepeatedTalentCount(TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT) > 0;
    if (!this.active) {
      return;
    }
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(AFFECTED_ABILITIES),
      this.onSKDamage,
    );
  }

  onSKDamage(event: DamageEvent) {
    if (
      !this.selectedCombatant.hasBuff(
        TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT.id,
        event.timestamp,
        ON_CAST_BUFF_REMOVAL_GRACE_MS,
      )
    ) {
      return;
    }

    this.damageDoneByBuffedCasts += event.amount + (event.absorbed || 0);
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.OPTIONAL()} size="flexible">
        <BoringSpellValueText spell={TALENTS.STORMKEEPER_1_ELEMENTAL_TALENT}>
          <>
            <ItemDamageDone amount={this.damageDoneByBuffedCasts} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  guideSubsection(): JSX.Element {
    const explanation = <>TODO</>;
    const data = this.statistic();

    return (
      <ExplanationAndDataSubSection
        title="Stormkeeper"
        explanationPercent={GUIDE_EXPLANATION_PERCENT_WIDTH}
        explanation={explanation}
        data={data}
      />
    );
  }
}

export default Stormkeeper;
