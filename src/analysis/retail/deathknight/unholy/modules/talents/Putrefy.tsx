import { formatPercentage } from 'common/format';
import DK_SPELLS from 'common/SPELLS/deathknight';
import TALENTS from 'common/TALENTS/deathknight';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  SummonEvent,
  UpdateSpellUsableEvent,
  UpdateSpellUsableType,
} from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import SpellUsable from '../core/SpellUsable';

class Putrefy extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  private chargesSpentDuringDarkTransformation = 0;
  private chargesSpentOutsideDarkTransformation = 0;

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS.PUTREFY_TALENT);
    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.UpdateSpellUsable.by(SELECTED_PLAYER).spell(TALENTS.PUTREFY_TALENT),
      this.onPutrefyCooldownUpdate,
    );

    if (this.selectedCombatant.hasTalent(TALENTS.HARBINGER_OF_DOOM_TALENT)) {
      this.addEventListener(
        Events.summon.by(SELECTED_PLAYER).spell(DK_SPELLS.LESSER_GHOUL),
        this.onHarbingerOfDoomLesserGhoulSummon,
      );
    }
  }

  private onPutrefyCooldownUpdate(event: UpdateSpellUsableEvent) {
    if (
      event.updateType !== UpdateSpellUsableType.BeginCooldown &&
      event.updateType !== UpdateSpellUsableType.UseCharge
    ) {
      return;
    }

    if (this.selectedCombatant.hasBuff(DK_SPELLS.DARK_TRANSFORMATION_BUFF)) {
      this.chargesSpentDuringDarkTransformation += 1;
      return;
    }

    this.chargesSpentOutsideDarkTransformation += 1;
  }

  private onHarbingerOfDoomLesserGhoulSummon(_event: SummonEvent) {
    this.deps.spellUsable.reduceCooldown(TALENTS.PUTREFY_TALENT.id, 2500);
  }

  get totalChargesSpent(): number {
    return this.chargesSpentDuringDarkTransformation + this.chargesSpentOutsideDarkTransformation;
  }

  statistic() {
    const efficiency =
      this.totalChargesSpent > 0
        ? 1 - this.chargesSpentOutsideDarkTransformation / this.totalChargesSpent
        : 1;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
      >
        <BoringSpellValueText spell={TALENTS.PUTREFY_TALENT}>
          <div>
            {formatPercentage(efficiency, 0)}% <small>efficiency</small>
          </div>
        </BoringSpellValueText>
        <div style={{ padding: '8px' }}>
          <DonutChart
            items={[
              {
                color: '#22c55e',
                label: 'During Dark Transformation',
                value: this.chargesSpentDuringDarkTransformation,
                valuePercent: false,
                valueTooltip: `${this.chargesSpentDuringDarkTransformation} Putrefy charges spent during Dark Transformation`,
              },
              {
                color: '#ef4444',
                label: 'Outside Dark Transformation',
                value: this.chargesSpentOutsideDarkTransformation,
                valuePercent: false,
                valueTooltip: `${this.chargesSpentOutsideDarkTransformation} Putrefy charges spent outside Dark Transformation`,
              },
            ]}
          />
        </div>
      </Statistic>
    );
  }
}

export default Putrefy;
