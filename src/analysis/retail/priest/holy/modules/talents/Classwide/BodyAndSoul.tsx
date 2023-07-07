import TALENTS from 'common/TALENTS/priest';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class BodyAndSoul extends Analyzer {
  buffCount: number = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.BODY_AND_SOUL_TALENT);

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(TALENTS.BODY_AND_SOUL_TALENT),
      this.bodyAndSoulApplied,
    );
  }

  bodyAndSoulApplied(event: ApplyBuffEvent) {
    this.buffCount += 1;
  }

  statistic() {
    return (
      <Statistic
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        position={STATISTIC_ORDER.OPTIONAL(2)}
      >
        <BoringSpellValueText spell={TALENTS.BODY_AND_SOUL_TALENT}>
          {this.buffCount} Speed Buffs
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default BodyAndSoul;
