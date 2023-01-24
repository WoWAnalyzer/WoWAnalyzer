import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { Talent } from 'common/TALENTS/types';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, HealEvent } from 'parser/core/Events';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { SPELL_COLORS } from '../../constants';
import UpliftedSpirits from './UpliftedSpirits';

const BUFFER = 500;

class Revival extends Analyzer {
  static dependencies = {
    upliftedSpirits: UpliftedSpirits,
  };

  protected upliftedSpirits!: UpliftedSpirits;

  activeTalent!: Talent;
  revivalDirectHealing: number = 0;
  revivalDirectOverHealing: number = 0;

  gustsHealing: number = 0;
  gustOverHealing: number = 0;

  lastRevival: number = Number.MIN_SAFE_INTEGER;

  constructor(options: Options) {
    super(options);
    this.active =
      this.selectedCombatant.hasTalent(TALENTS_MONK.RESTORAL_TALENT) ||
      this.selectedCombatant.hasTalent(TALENTS_MONK.REVIVAL_TALENT);

    if (!this.active) {
      return;
    }

    this.activeTalent = this.getRevivalTalent();

    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.REVIVAL_TALENT),
      this.revivalCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_MONK.RESTORAL_TALENT),
      this.revivalCast,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS_MONK.REVIVAL_TALENT),
      this.handleRevivalDirect,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(TALENTS_MONK.RESTORAL_TALENT),
      this.handleRevivalDirect,
    );

    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.GUSTS_OF_MISTS),
      this.handleGustsOfMists,
    );
  }

  getRevivalTalent() {
    return this.selectedCombatant.hasTalent(TALENTS_MONK.RESTORAL_TALENT)
      ? TALENTS_MONK.RESTORAL_TALENT
      : TALENTS_MONK.REVIVAL_TALENT;
  }

  revivalCast(event: CastEvent) {
    this.lastRevival = event.timestamp + BUFFER;
  }

  handleRevivalDirect(event: HealEvent) {
    if (this.lastRevival > event.timestamp) {
      this.revivalDirectHealing += event.amount + (event.absorbed || 0);
      this.revivalDirectOverHealing += event.overheal || 0;
    }
  }

  handleGustsOfMists(event: HealEvent) {
    if (this.lastRevival > event.timestamp) {
      this.gustsHealing += event.amount + (event.absorbed || 0);
      this.gustOverHealing += event.overheal || 0;
    }
  }

  renderRevivalChart() {
    const items = [
      {
        color: SPELL_COLORS.REVIVAL,
        label: this.activeTalent.name,
        spellId: this.activeTalent.id,
        value: this.revivalDirectHealing,
        valueTooltip: formatThousands(this.revivalDirectHealing),
      },
      {
        color: SPELL_COLORS.GUSTS_OF_MISTS,
        label: 'Gust Of Mist',
        spellId: SPELLS.GUSTS_OF_MISTS.id,
        value: this.gustsHealing,
        valueTooltip: formatThousands(this.gustsHealing),
      },
    ];

    if (this.selectedCombatant.hasTalent(TALENTS_MONK.UPLIFTED_SPIRITS_TALENT)) {
      items.push({
        color: SPELL_COLORS.UPLIFTED_SPIRITS,
        label: 'Uplifted Spirits',
        spellId: TALENTS_MONK.UPLIFTED_SPIRITS_TALENT.id,
        value: this.upliftedSpirits.usHealing,
        valueTooltip: formatThousands(this.upliftedSpirits.usHealing),
      });
    }

    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(3)} size="flexible">
        <div className="pad">
          <label>
            <SpellLink id={this.activeTalent.id}>{this.activeTalent.name}</SpellLink> breakdown
          </label>
          {this.renderRevivalChart()}
        </div>
      </Statistic>
    );
  }
}

export default Revival;
