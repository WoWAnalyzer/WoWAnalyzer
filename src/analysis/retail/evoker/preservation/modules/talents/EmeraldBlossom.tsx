import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { HealEvent } from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { ThresholdStyle, When } from 'parser/core/ParseResults';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import { getHealEvents } from '../../normalizers/CastLinkNormalizer';
import { SpellLink } from 'interface';
import { formatNumber } from 'common/format';
import { t } from '@lingui/macro';

const BOUNTIFUL_ADDITIONAL_TARGETS = 2;
const BASE_TARGETS = 3;

class EmeraldBlossom extends Analyzer {
  bountifulBloomHealing: number = 0;
  bountifulBloomOverhealing: number = 0;
  extraBountifulHits: number = 0;
  numBlossoms: number = 0;
  totalHits: number = 0;
  totalHealing: number = 0;
  totalOverhealing: number = 0;
  countedTimestamps: Set<number> = new Set<number>();

  hasBountiful: boolean = false;

  constructor(options: Options) {
    super(options);
    this.hasBountiful = this.selectedCombatant.hasTalent(TALENTS_EVOKER.BOUNTIFUL_BLOOM_TALENT);
    this.addEventListener(
      Events.heal.by(SELECTED_PLAYER).spell(SPELLS.EMERALD_BLOSSOM),
      this.onHealBatch,
    );
  }

  get averageNumTargets() {
    return this.totalHits / this.numBlossoms;
  }

  get averageExtraTargets() {
    return this.extraBountifulHits / this.numBlossoms;
  }

  // batch process all healevents for single cast to easily decide which to attribute to bountiful
  onHealBatch(event: HealEvent) {
    if (this.countedTimestamps.has(event.timestamp)) {
      return;
    }

    const allHealingEvents = getHealEvents(event);
    this.totalHits += allHealingEvents.length;
    this.numBlossoms += 1;
    for (let i = 0; i < allHealingEvents.length; i += 1) {
      const ev = allHealingEvents[i];
      this.totalHealing += (ev.amount || 0) + (ev.absorbed || 0);
      this.totalOverhealing += ev.overheal || 0;
      if (i >= BASE_TARGETS) {
        // bountiful blossom target
        this.bountifulBloomHealing += (ev.amount || 0) + (ev.absorbed || 0);
        this.bountifulBloomOverhealing += ev.overheal || 0;
        this.extraBountifulHits += 1;
      }
    }
    this.countedTimestamps.add(event.timestamp);
  }

  get suggestionThresholds() {
    return {
      actual: this.averageNumTargets,
      isLessThan: {
        minor: 2.5 + Number(this.hasBountiful) * BOUNTIFUL_ADDITIONAL_TARGETS,
        average: 2 + Number(this.hasBountiful) * BOUNTIFUL_ADDITIONAL_TARGETS,
      },
      style: ThresholdStyle.NUMBER,
    };
  }

  suggestions(when: When) {
    when(this.suggestionThresholds).addSuggestion((suggest, actual, recommended) =>
      suggest(
        <>
          Try to maximize the amount of targets hit by{' '}
          <SpellLink id={SPELLS.EMERALD_BLOSSOM_CAST.id} />
        </>,
      )
        .icon(SPELLS.EMERALD_BLOSSOM.icon)
        .actual(
          `${this.averageNumTargets.toFixed(1)} ${t({
            id: 'evoker.preservation.suggestions.emeraldBlossom.avgTargetsHit',
            message: ` average targets hit`,
          })}`,
        )
        .recommended(`at least ${recommended} targets hit recommended`),
    );
  }

  statistic() {
    return this.hasBountiful && this.averageExtraTargets > 0 ? (
      <Statistic
        size="flexible"
        position={STATISTIC_ORDER.CORE(1)}
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <ul>
            <li>
              Total Healing from <SpellLink id={TALENTS_EVOKER.BOUNTIFUL_BLOOM_TALENT.id} />:{' '}
              {formatNumber(this.bountifulBloomHealing)}
            </li>
            <li>
              Total Overhealing from <SpellLink id={TALENTS_EVOKER.BOUNTIFUL_BLOOM_TALENT.id} />:{' '}
              {formatNumber(this.bountifulBloomOverhealing)}
            </li>
            <li>
              Average extra hits from <SpellLink id={TALENTS_EVOKER.BOUNTIFUL_BLOOM_TALENT.id} />:{' '}
              {this.averageExtraTargets.toFixed(2)}
            </li>
          </ul>
        }
      >
        <TalentSpellText talent={TALENTS_EVOKER.BOUNTIFUL_BLOOM_TALENT}>
          <ItemHealingDone amount={this.bountifulBloomHealing} />
        </TalentSpellText>
      </Statistic>
    ) : null;
  }
}

export default EmeraldBlossom;
