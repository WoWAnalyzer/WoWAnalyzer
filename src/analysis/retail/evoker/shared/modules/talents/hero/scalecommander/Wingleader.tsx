import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import SPELLS from 'common/SPELLS/evoker';
import TALENTS from 'common/TALENTS/evoker';
import Events, { CastEvent } from 'parser/core/Events';
import {
  WINGLEADER_CDR_PER_HIT_MS,
  WINGLEADER_CDR_PER_HIT_MS_DEVASTATION,
} from 'analysis/retail/evoker/shared/constants';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import SPECS from 'game/SPECS';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SpellLink from 'interface/SpellLink';
import DonutChart from 'parser/ui/DonutChart';
import Spell from 'common/SPELLS/Spell';
import { getMassEventTargetCount, isMassEvent } from './ScalecommanderTargetHelper';

/** Mass Disintegrate/Eruption reduces the cooldown of Deep Breath/Breath of Eons by 0.5/1 sec for each strike.
 * */
class Wingleader extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  damageRecord: Record<
    number,
    {
      initialTimestamp: number;
      hits: number;
    }
  > = {};

  wingleaderCDR =
    this.owner.selectedCombatant.specId === SPECS.DEVASTATION_EVOKER.id
      ? WINGLEADER_CDR_PER_HIT_MS_DEVASTATION
      : WINGLEADER_CDR_PER_HIT_MS;

  effectiveCDR = 0;
  wastedCDR = 0;
  breathSpell: Spell;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.WINGLEADER_TALENT);

    this.breathSpell =
      this.owner.selectedCombatant.specId === SPECS.DEVASTATION_EVOKER.id
        ? SPELLS.DEEP_BREATH_SCALECOMMANDER
        : SPELLS.BREATH_OF_EONS_SCALECOMMANDER;

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.DISINTEGRATE, TALENTS.ERUPTION_TALENT]),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    if (!isMassEvent(event)) {
      return;
    }
    const targetCount = getMassEventTargetCount(event);
    const effectiveCDR = this.deps.spellUsable.reduceCooldown(
      this.breathSpell.id,
      this.wingleaderCDR * targetCount,
    );
    const wastedCDR = this.wingleaderCDR * targetCount - effectiveCDR;

    this.effectiveCDR += effectiveCDR / 1000;
    this.wastedCDR += wastedCDR / 1000;
  }

  statistic() {
    const donutItems = [
      {
        color: 'rgb(123,188,93)',
        label: 'Effective CDR',
        valueTooltip: this.effectiveCDR.toFixed(2) + 's effective CDR',
        value: this.effectiveCDR,
      },
      {
        color: 'rgb(216,59,59)',
        label: 'Wasted CDR',
        valueTooltip:
          this.wastedCDR.toFixed(2) + `s CDR wasted whilst ${this.breathSpell.name} was ready`,
        value: this.wastedCDR,
      },
    ];

    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(60)}
        category={STATISTIC_CATEGORY.HERO_TALENTS}
        size="flexible"
      >
        <div className="pad">
          <label>
            <SpellLink spell={TALENTS.WINGLEADER_TALENT} /> usage
          </label>
          <strong>CDR efficiency:</strong>
          <DonutChart items={donutItems} />
        </div>
      </Statistic>
    );
  }
}

export default Wingleader;
