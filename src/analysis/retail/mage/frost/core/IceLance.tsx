import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/mage';
import { highlightInefficientCast } from 'interface/report/Results/Timeline/Casts';
import { addEnhancedCastReason } from 'parser/core/EventMetaLib';
import Analyzer, { SELECTED_PLAYER, Options } from 'parser/core/Analyzer';
import Events, { CastEvent, DamageEvent, GetRelatedEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { SpellLink } from 'interface';
import type { JSX } from 'react';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import DonutChart, { Item as DonutItem } from 'parser/ui/DonutChart';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_CORE_EXPLANATION_PERCENT } from 'analysis/retail/mage/frost/Guide';
import {
  SPENT_FINGERS_OF_FROST,
  SPENT_THERMAL_VOID,
} from 'analysis/retail/mage/frost/normalizers/CastLinkNormalizer';

interface IceLanceCast {
  cast: CastEvent;
  damageHits: number;
  highestShatteredStacks: number; // In the case of a cleaved IL, how many freezing stacks did the "better" target shatter?
  totalShatteredStacks: number;
  hadFingers: boolean;
  hadThermalVoid: boolean;
}

interface Results {
  donutData: Array<DonutItem>;
  totalCasts: number;
  totalHits: number;
  totalFreezingStacks: number;
}

const ICE_LANCE = <SpellLink spell={TALENTS.ICE_LANCE_TALENT} />;
const FREEZING = <SpellLink spell={SPELLS.FREEZING} />;
const FINGERS = <SpellLink spell={SPELLS.FINGERS_OF_FROST_BUFF} />;
const SHATTER = <SpellLink spell={SPELLS.SHATTER_DAMAGE} />;

class IceLance extends Analyzer {
  static dependencies = {
    enemies: Enemies,
  };
  protected enemies!: Enemies;

  castsByTimestamp = new Map<number, IceLanceCast>();

  private readonly targetFreezingCount: number = 0;
  private readonly talentWarning: boolean = false;
  private readonly shatteredPerLance: number = 4;
  private results: Results | undefined = undefined;

  constructor(options: Options) {
    super(options);
    if (this.selectedCombatant.hasTalent(TALENTS.HEART_OF_ICE_TALENT)) {
      this.shatteredPerLance += 1;
    } else {
      // Can really throw off the APL if not selected
      this.talentWarning = true;
    }
    if (this.selectedCombatant.hasTalent(TALENTS.POLISHED_FOCUS_TALENT)) {
      this.shatteredPerLance += 1;
    }

    const isFrostfire = this.selectedCombatant.hasTalent(TALENTS.FROSTFIRE_BOLT_TALENT);
    const isSpellslinger = this.selectedCombatant.hasTalent(TALENTS.SPLINTERING_SORCERY_TALENT);

    if (isFrostfire) {
      this.targetFreezingCount = 10;
    } else if (isSpellslinger) {
      this.targetFreezingCount = 6;
    } else {
      // Not frostfire or spellslinger?
      this.talentWarning = true;
    }

    this.addEventListener(Events.fightend, this.onFightEnd);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.ICE_LANCE_DAMAGE),
      this.onIceLanceDamage,
    );
  }

  onFightEnd() {
    this.results = this.analyzeIceLanceCasts();
  }

  onIceLanceDamage(event: DamageEvent) {
    const enemy = this.enemies.getEntity(event);
    const linkedCast: CastEvent | undefined = GetRelatedEvent(event, 'SpellCast');
    if (!linkedCast || !enemy) return;

    const freezingStacks = enemy?.getOwnBuffStacks(SPELLS.FREEZING.id, 10) ?? 0;
    const hadThermalVoid = !!GetRelatedEvent(linkedCast, SPENT_THERMAL_VOID);
    const hadFingers = !!GetRelatedEvent(linkedCast, SPENT_FINGERS_OF_FROST);

    let shattered = this.shatteredPerLance;
    if (hadThermalVoid) {
      shattered *= 2;
    }
    if (!hadFingers) {
      shattered = Math.min(shattered, freezingStacks);
    }

    let castRecord = this.castsByTimestamp.get(linkedCast.timestamp);
    if (!castRecord) {
      // First instance of damage for the linked cast, populate initial values...
      castRecord = {
        cast: linkedCast,
        damageHits: 1,
        highestShatteredStacks: shattered,
        totalShatteredStacks: shattered,
        hadThermalVoid,
        hadFingers,
      };
      this.castsByTimestamp.set(linkedCast.timestamp, castRecord);
    } else {
      castRecord.damageHits += 1;
      castRecord.totalShatteredStacks += shattered;
      castRecord.highestShatteredStacks = Math.max(castRecord.highestShatteredStacks, shattered);
    }
  }

  analyzeIceLanceCasts(): Results {
    const donutData: Array<DonutItem> = [];

    let totalCasts = 0;
    let totalHits = 0;
    let totalFreezingStacks = 0;
    let withFingers = 0;
    let enoughFreezing = 0;
    let almostEnoughFreezing = 0;
    let lowFreezing = 0;

    this.castsByTimestamp.forEach((icelance) => {
      totalCasts += 1;
      totalHits += icelance.damageHits;
      totalFreezingStacks += icelance.totalShatteredStacks;

      if (icelance.hadFingers) {
        withFingers += 1;

        if (icelance.hadThermalVoid) {
          addEnhancedCastReason(
            icelance.cast,
            <>
              This cast utilized <SpellLink spell={TALENTS.THERMAL_VOID_TALENT} /> and {FINGERS}
            </>,
          );
        }
      } else if (icelance.highestShatteredStacks >= this.targetFreezingCount) {
        // Not sure if highestShatteredStacks is the right way to do this. This is going to check that at least one
        // target of ice lance had an appropriate number of Freezing stacks (e.g. 6+). I haven't found
        // a good source about any distinctions made when considering cleave, so this is the simplest
        // solution for now. The alternative would be to validate total freezing stacks, and count something like
        // 3 stacks on each target as "OK" because it totals to 6. I don't think that's correct as of the current APL,
        // but it will be easy to change if needed.
        enoughFreezing += 1;
      } else if (icelance.highestShatteredStacks > 3) {
        almostEnoughFreezing += 1;
      } else {
        lowFreezing += 1;
        // 4 is an arbitrary cut-off, but this will only highlight REALLY inefficient casts on the timeline.
        highlightInefficientCast(
          icelance.cast,
          <>
            This cast shattered <strong>{icelance.highestShatteredStacks}</strong> {FREEZING} stack
            {icelance.highestShatteredStacks === 1 ? '' : 's'}
          </>,
        );
      }
    });

    donutData.push({
      label: <>with {FINGERS}</>,
      color: '#3a91c2',
      value: withFingers,
    });
    donutData.push({
      label: (
        <>
          &gt;= {this.targetFreezingCount} {FREEZING}
        </>
      ),
      color: '#5fc047',
      value: enoughFreezing,
    });
    donutData.push({
      label: (
        <>
          4-{this.targetFreezingCount - 1} {FREEZING}
        </>
      ),
      color: '#e6c200',
      value: almostEnoughFreezing,
    });
    donutData.push({
      label: <>&lt; 4 {FREEZING}</>,
      color: '#a51c37',
      value: lowFreezing,
    });

    return { donutData, totalHits, totalCasts, totalFreezingStacks };
  }

  get guideSubsection(): JSX.Element {
    // We could maybe use a SpellUsage section here, but there are so many icelance casts in a fight it might be too busy.
    // Keeping the donut for now.

    const explanation = (
      <>
        <p>
          {ICE_LANCE} doesn't do much damage on its own, but it is one of the core spells that can
          {SHATTER} the {FREEZING} debuff. To be efficient, you only want to cast it when your
          target has enough {FREEZING} stacks, or when you have {FINGERS}.
        </p>
        <p>
          Based on your talent setup, you should cast {ICE_LANCE} when your target has{' '}
          <strong>{this.targetFreezingCount}</strong> or more {FREEZING} stacks.
        </p>
        {this.talentWarning && (
          <p>
            <small>
              Note that this suggested {FREEZING} count assumes you are using one of the accepted
              standard talent builds, which this report has deviated from.
            </small>
          </p>
        )}
      </>
    );

    const data = (
      <>
        <RoundedPanel>
          <b>{ICE_LANCE} cast efficiency</b>
          <DonutChart items={this.results?.donutData ?? []} />
        </RoundedPanel>
      </>
    );

    return explanationAndDataSubsection(
      explanation,
      data,
      GUIDE_CORE_EXPLANATION_PERCENT,
      'Ice Lance',
    );
  }

  statistic() {
    if (!this.results) return undefined;
    const tooltip = (
      <>
        The total and average number of {FREEZING} stacks shattered by {ICE_LANCE}, including those
        on secondary cleave targets.
      </>
    );

    const averageFreezing = this.results.totalFreezingStacks / this.results.totalCasts;
    return (
      <Statistic position={STATISTIC_ORDER.CORE(30)} size="flexible" tooltip={tooltip}>
        <BoringSpellValueText spell={TALENTS.ICE_LANCE_TALENT}>
          <span>
            <p>
              {formatNumber(this.results.totalFreezingStacks)}{' '}
              <small>Total {FREEZING} stacks</small>
            </p>
            <p>
              {formatNumber(averageFreezing)} <small>Average {FREEZING} stacks</small>
            </p>
          </span>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default IceLance;
