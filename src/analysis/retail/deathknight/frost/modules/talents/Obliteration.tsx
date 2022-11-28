import {
  CooldownExpandable,
  CooldownExpandableItem,
} from 'analysis/retail/druid/restoration/Guide';
import spells from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import RESOURCE_TYPES, { getResource } from 'game/RESOURCE_TYPES';
import { PassFailCheckmark, PerformanceMark } from 'interface/guide';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { BoxRowEntry } from 'interface/guide/components/PerformanceBoxRow';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import GlobalCooldown from 'parser/shared/modules/GlobalCooldown';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import { QualitativePerformance } from 'parser/ui/QualitativePerformance';
import Statistic from 'parser/ui/Statistic';
import { STATISTIC_ORDER } from 'parser/ui/StatisticBox';
import SpellUsable from '../features/SpellUsable';

class Obliteration extends Analyzer {
  static dependencies = {
    globalCooldown: GlobalCooldown,
    spellUsable: SpellUsable,
  };

  globalCooldown!: GlobalCooldown;
  spellUsable!: SpellUsable;

  oblitPrecastInfo: ObliterationPrecastConditions[] = [];
  pillarWindows: BoxRowEntry[][] = [];

  goodGcds = 0;
  badGcds = 0;
  runesOnLastCast = -1;

  currentPillarTimestamp = 0;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.OBLITERATION_TALENT.id);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER), this.onCast);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(talents.PILLAR_OF_FROST_TALENT),
      this.onPillarStart,
    );
  }

  onCast(event: CastEvent) {
    if (
      this.selectedCombatant.hasBuff(talents.PILLAR_OF_FROST_TALENT.id, event.timestamp) &&
      this.globalCooldown.isOnGlobalCooldown(event.ability.guid)
    ) {
      let value = QualitativePerformance.Fail;
      if (this.selectedCombatant.hasBuff(spells.KILLING_MACHINE.id, event.timestamp, 0, 100)) {
        if (event.ability.guid === talents.OBLITERATE_TALENT.id) {
          this.goodGcds += 1;
          value = QualitativePerformance.Perfect;
        } else {
          this.badGcds += 1;
        }
      }
      else if (event.ability.guid === talents.FROST_STRIKE_TALENT.id && 
        !this.selectedCombatant.hasBuff(talents.RIME_TALENT.id, event.timestamp)){
        value = QualitativePerformance.Good;
      }
      else if (event.ability.guid === talents.HOWLING_BLAST_TALENT.id && 
        (this.selectedCombatant.hasBuff(talents.RIME_TALENT.id, event.timestamp))) {
          value = QualitativePerformance.Good;
        }

      this.pillarWindows[this.pillarWindows.length - 1].push({
        value,
        tooltip
      })
    }
  }

  onPillarStart(event: CastEvent) {
    this.currentPillarTimestamp = event.timestamp;
    const rwRefreshed =
      this.spellUsable.cooldownRemaining(talents.REMORSELESS_WINTER_TALENT.id) > 12000;
    const runeOneCharges = this.spellUsable.chargesAvailable(-101);
    const runeTwoCharges = this.spellUsable.chargesAvailable(-102);
    const runeThreeCharges = this.spellUsable.chargesAvailable(-103);
    const runesAvailable = runeOneCharges + runeTwoCharges + runeThreeCharges;

    this.oblitPrecastInfo.push({
      timestamp: event.timestamp,
      runesAtStart: runesAvailable,
      remorselessWinterRefreshed: rwRefreshed,
    })

    this.pillarWindows.push([]);
  }

  get badGcdPercentage() {
    return ((this.badGcds / (this.badGcds + this.goodGcds)) * 100).toFixed(1);
  }

  statistic() {
    return (
      <Statistic
        tooltip={`You had ${this.badGcds} bad GCDs inside the Pillar of Frost buff and ${this.goodGcds} good GCDs`}
        position={STATISTIC_ORDER.CORE(65)}
        size="flexible"
      >
        <BoringSpellValueText spellId={talents.OBLITERATION_TALENT.id}>
          <>
            {this.badGcdPercentage}% <small>bad GCDs inside Pillar of Frost</small>
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }

  get guideSubsection(): JSX.Element {
    const explanation = (
      <p>
        <b>
          <SpellLink id={talents.OBLITERATION_TALENT.id} />
        </b>{' '}
        turns <SpellLink id={talents.PILLAR_OF_FROST_TALENT.id}/> into your main damage cooldown that requires you play in a specific way to optimize the number of guaranteed
        <SpellLink id={talents.KILLING_MACHINE_TALENT.id}/>s that you get.
      </p>
    )

    const data = (
      <div>
        <strong>GCDs in Pillar of Frost</strong>
      </div>
    )
  }

  get guideCastBreakdown() {
    const explanation = (
      <p>
        <strong><SpellLink id={talents.OBLITERATION_TALENT.id}/></strong>
        turns <SpellLink id={talents.PILLAR_OF_FROST_TALENT.id}/> into your main damage cooldown that requires you play in a specific way to optimize the number of guaranteed
        <SpellLink id={talents.KILLING_MACHINE_TALENT.id}/>s that you get.  To ensure no GCDs are wasted while Pillar of Frost is active, you should aim to have Runes pooled 
        and to put <SpellLink id={talents.REMORSELESS_WINTER_TALENT.id}/> on cooldown before casting Pillar of Frost.
      </p>
    );

    const data = (
      <div>
        <strong>Per-Cast Breakdown</strong>
        <small> - click to expand</small>
        {this.oblitPrecastInfo.map((cast, i) => {
          const header = (
            <>
              @ {this.owner.formatTimestamp(cast.timestamp)} &mdash;{' '}
              <SpellLink id={talents.OBLITERATION_TALENT.id} />
            </>
          );

          let runesPooled = QualitativePerformance.Good;
          if (cast.runesAtStart < 4) {
            runesPooled = QualitativePerformance.Ok;
          } else if (cast.runesAtStart <= 2) {
            runesPooled = QualitativePerformance.Fail;
          }

          const overallPerf =
            cast.remorselessWinterRefreshed && cast.runesAtStart > 3
              ? QualitativePerformance.Good
              : QualitativePerformance.Fail;

          const checklistItems: CooldownExpandableItem[] = [];
          checklistItems.push({
            label: (
              <>
                <SpellLink id={talents.REMORSELESS_WINTER_TALENT.id} /> refreshed
              </>
            ),
            result: <PassFailCheckmark pass={cast.remorselessWinterRefreshed} />,
          });

          checklistItems.push({
            label: 'Sufficient Runes pooled',
            result: <PerformanceMark perf={runesPooled} />,
            details: <>({cast.runesAtStart}) Runes pooled</>,
          });

          return (
            <CooldownExpandable
              header={header}
              checklistItems={checklistItems}
              perf={overallPerf}
              key={i}
            />
          );
        })}
      </div>
    );

    return explanationAndDataSubsection(explanation, data);
  }
}

interface ObliterationPrecastConditions {
  timestamp: number;
  runesAtStart: number;
  remorselessWinterRefreshed: boolean;
}

export default Obliteration;
