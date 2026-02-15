import { formatThousands } from 'common/format';
import SPELLS from 'common/SPELLS';
import { TALENTS_MONK } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer from 'parser/core/Analyzer';
import DonutChart from 'parser/ui/DonutChart';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticsListBox';
import { SPELL_COLORS } from '../../constants';
import EnvelopingMists from '../spells/EnvelopingMists';
import RenewingMist from '../spells/RenewingMist';
import SheilunsGift from '../spells/SheilunsGift';
import Vivify from '../spells/Vivify';
import CraneStyle from '../spells/CraneStyle';

class MasteryStats extends Analyzer {
  static dependencies = {
    envelopingMists: EnvelopingMists,
    renewingMist: RenewingMist,
    vivify: Vivify,
    sheilunsGift: SheilunsGift,
    craneStyle: CraneStyle,
  };

  protected envelopingMists!: EnvelopingMists;
  protected renewingMist!: RenewingMist;
  protected vivify!: Vivify;
  protected sheilunsGift!: SheilunsGift;
  protected craneStyle!: CraneStyle;

  get totalMasteryHealing() {
    return (
      (this.vivify.gomHealing || 0) +
      (this.renewingMist.gustsHealing || 0) +
      (this.envelopingMists.gustsHealing || 0) +
      (this.sheilunsGift.gomHealing || 0) +
      (this.craneStyle.gomHealing || 0)
    );
  }

  renderMasterySourceChart() {
    const items = [
      {
        color: SPELL_COLORS.RENEWING_MIST,
        label: 'Renewing Mist',
        spellId: SPELLS.RENEWING_MIST_CAST.id,
        value: this.renewingMist.gustsHealing,
        valueTooltip: formatThousands(this.renewingMist.gustsHealing),
      },
      {
        color: SPELL_COLORS.ENVELOPING_MIST,
        label: 'Enveloping Mist',
        spellId: TALENTS_MONK.ENVELOPING_MIST_TALENT.id,
        value: this.envelopingMists.gustsHealing,
        valueTooltip: formatThousands(this.envelopingMists.gustsHealing),
      },
    ];
    if (this.selectedCombatant.hasTalent(TALENTS_MONK.MIST_CALLER_TALENT)) {
      if (this.selectedCombatant.hasTalent(TALENTS_MONK.SHEILUNS_GIFT_TALENT)) {
        items.push({
          color: SPELL_COLORS.ALTERNATE_GUST_OF_MIST,
          label: 'Sheiluns Gift',
          spellId: TALENTS_MONK.SHEILUNS_GIFT_TALENT.id,
          value: this.sheilunsGift.gomHealing,
          valueTooltip: formatThousands(this.sheilunsGift.gomHealing),
        });
      } else {
        items.push({
          color: SPELL_COLORS.VIVIFY,
          label: 'Vivify',
          spellId: SPELLS.VIVIFY.id,
          value: this.vivify.gomHealing,
          valueTooltip: formatThousands(this.vivify.gomHealing),
        });
      }
    }

    if (this.selectedCombatant.hasTalent(TALENTS_MONK.CRANE_STYLE_TALENT)) {
      items.push({
        color: SPELL_COLORS.BLACKOUT_KICK,
        label: 'Crane Style',
        spellId: TALENTS_MONK.CRANE_STYLE_TALENT.id,
        value: this.craneStyle.gomHealing,
        valueTooltip: formatThousands(this.craneStyle.gomHealing),
      });
    }

    return <DonutChart items={items} />;
  }

  statistic() {
    return (
      <Statistic position={STATISTIC_ORDER.CORE(2)} size="flexible">
        <div className="pad">
          <label>
            <SpellLink spell={SPELLS.GUSTS_OF_MISTS}>Gusts of Mists</SpellLink> breakdown
          </label>
          {this.renderMasterySourceChart()}
        </div>
      </Statistic>
    );
  }
}

export default MasteryStats;
