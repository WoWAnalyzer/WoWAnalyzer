import { formatDuration, formatNumber } from 'common/format';
import TALENTS from 'common/TALENTS/shaman';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Icefury from './Icefury';
import { Expandable, SpellLink } from 'interface';
import { getLowestPerf } from 'parser/ui/QualitativePerformance';
import { SectionHeader } from 'interface/guide';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import { GUIDE_EXPLANATION_PERCENT_WIDTH } from '../../constants';
import Events, { DamageEvent } from 'parser/core/Events';
import Enemies from 'parser/shared/modules/Enemies';
import SPELLS from 'common/SPELLS';
import styled from '@emotion/styled';
import DonutChart from 'parser/ui/DonutChart';
import { PanelHeader, RoundedPanel } from 'interface/guide/components/GuideDivs';
import { ChecklistUsageInfo, SpellUse, spellUseToBoxRowEntry } from 'parser/core/SpellUsage/core';
import { PerformanceBoxRow } from 'interface/guide/components/PerformanceBoxRow';
import {
  GTEThreshold,
  LTEThreshold,
  determinePerformance,
} from '../features/shared/ThresholdPerformancePercentage';
import { calculateEffectiveDamage } from 'parser/core/EventCalculateLib';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import TalentSpellText from 'parser/ui/TalentSpellText';

const IF_COOLDOWN_THRESHOLD: LTEThreshold = {
  type: 'lte',
  perfect: 1000,
  good: 5000,
  ok: 9000,
};

const STACKS_USED_THRESHOLD: GTEThreshold = {
  type: 'gte',
  perfect: 4,
  good: 4,
  ok: 3,
};

const DONUT_WITH_ELSHOCKS = 'rgba(0, 145, 255, 1)';
const DONUT_WITHOUT_ELSHOCKS = 'rgba(255, 90, 160, 1)';

interface DamageDoneByCastEntry {
  hitsWithElshocks: number;
  hitsWithoutElshocks: number;
  damageGainedByElshocks: number;
}

const Table = styled.table`
  td {
    padding: 0 1em;
  }

  th {
    font-weight: bold;
  }

  margin-top: 1em;
`;

const ALL_NATURE_DAMAGE = [
  TALENTS.EARTH_SHOCK_TALENT,
  TALENTS.ELEMENTAL_BLAST_TALENT,
  SPELLS.ELEMENTAL_BLAST_OVERLOAD,
  SPELLS.LIGHTNING_BOLT,
  SPELLS.LIGHTNING_BOLT_OVERLOAD_HIT,
  TALENTS.CHAIN_LIGHTNING_TALENT,
  SPELLS.CHAIN_LIGHTNING_OVERLOAD,
  SPELLS.EARTHQUAKE_DAMAGE,
  SPELLS.EARTHQUAKE_OVERLOAD_DAMAGE,
  SPELLS.FLAME_SHOCK,
];

const GUIDE_RELEVANT_NATURE_DAMAGE = [
  TALENTS.EARTH_SHOCK_TALENT,
  TALENTS.ELEMENTAL_BLAST_TALENT,
  SPELLS.ELEMENTAL_BLAST_OVERLOAD,
  SPELLS.LIGHTNING_BOLT,
  SPELLS.LIGHTNING_BOLT_OVERLOAD_HIT,
  TALENTS.CHAIN_LIGHTNING_TALENT,
  SPELLS.CHAIN_LIGHTNING_OVERLOAD,
];

export default class ElectrifiedShocks extends Analyzer {
  static dependencies = {
    icefury: Icefury,
    enemies: Enemies,
  };

  protected icefury!: Icefury;
  protected enemies!: Enemies;

  damageDoneByCast: { [key: number]: DamageDoneByCastEntry } = {};

  constructor(options: Options) {
    super(options);

    ALL_NATURE_DAMAGE.forEach((spell) => {
      this.damageDoneByCast[spell.id] = {
        hitsWithElshocks: 0,
        hitsWithoutElshocks: 0,
        damageGainedByElshocks: 0,
      };
    });

    // Don't need to check if Icefury is chosen here, as it is impoosible to take
    // electrified shocks without it.
    this.active = this.selectedCombatant.hasTalent(TALENTS.ELECTRIFIED_SHOCKS_TALENT);

    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(ALL_NATURE_DAMAGE),
      this.onDamage,
    );
  }
  onDamage(event: DamageEvent) {
    if (this.enemies.getEntity(event)?.hasBuff(SPELLS.ELECTRIFIED_SHOCKS_DEBUFF.id)) {
      this.damageDoneByCast[event.ability.guid].hitsWithElshocks += 1;
      this.damageDoneByCast[event.ability.guid].damageGainedByElshocks += calculateEffectiveDamage(
        event,
        0.15,
      );
    } else {
      this.damageDoneByCast[event.ability.guid].hitsWithoutElshocks += 1;
    }
  }

  get guideSubsection() {
    const description = (
      <>
        <p>
          When casting <SpellLink spell={TALENTS.ICEFURY_TALENT} />, your next 4
          <SpellLink spell={TALENTS.FROST_SHOCK_TALENT} /> casts apply{' '}
          <SpellLink spell={TALENTS.ELECTRIFIED_SHOCKS_TALENT} /> to affected target(s). Electrified
          shocks is a substantial damage multiplier to your other nature spells. You should
          therefore aim to keep this buff up on your target whenever you otherwise are dealing
          damage to the target.
        </p>
      </>
    );

    const casts: SpellUse[] = this.icefury.icefuryWindows.map((ifw) => {
      const fsCastPerf = determinePerformance(ifw.empoweredCasts, STACKS_USED_THRESHOLD);
      const fsCastChecklistItem: ChecklistUsageInfo = {
        summary: (
          <span>
            {ifw.empoweredCasts} / 4 <SpellLink spell={TALENTS.ICEFURY_TALENT} /> stacks were
            consumed using <SpellLink spell={TALENTS.FROST_SHOCK_TALENT} />
          </span>
        ),
        details: (
          <span>
            {ifw.empoweredCasts} / 4 <SpellLink spell={TALENTS.ICEFURY_TALENT} /> stacks were
            consumed using <SpellLink spell={TALENTS.FROST_SHOCK_TALENT} />
          </span>
        ),
        performance: fsCastPerf,
        timestamp: ifw.event.timestamp,
        check: 'fscast',
      };

      const fsStaggerPerf = determinePerformance(ifw.icefuryCooldownLeft, IF_COOLDOWN_THRESHOLD);
      const fsSpreadChecklistItem: ChecklistUsageInfo = {
        summary: (
          <span>
            <SpellLink spell={TALENTS.ICEFURY_TALENT} /> had{' '}
            {formatDuration(ifw.icefuryCooldownLeft)} left on cooldown
          </span>
        ),
        details: (
          <span>
            <SpellLink spell={TALENTS.ICEFURY_TALENT} /> had{' '}
            {formatDuration(ifw.icefuryCooldownLeft)} left on cooldown
          </span>
        ),
        performance: fsStaggerPerf,
        check: 'fsStagger',
        timestamp: ifw.event.timestamp,
      };

      return {
        _key: 'icefury-' + ifw.start,
        event: ifw.event,
        performance: getLowestPerf([fsCastPerf, fsStaggerPerf]),
        checklistItems: [fsCastChecklistItem, fsSpreadChecklistItem],
      };
    });

    const totalDamageDone = {
      hitsWithElshocks: 0,
      hitsWithoutElshocks: 0,
      damageGainedByElshocks: 0,
    };

    Object.entries(this.damageDoneByCast).forEach(([spellId, damageDone]) => {
      if (!GUIDE_RELEVANT_NATURE_DAMAGE.some((spell) => spell.id === parseInt(spellId))) {
        return;
      }

      totalDamageDone.hitsWithElshocks += damageDone.hitsWithElshocks;
      totalDamageDone.hitsWithoutElshocks += damageDone.hitsWithoutElshocks;
      totalDamageDone.damageGainedByElshocks += damageDone.damageGainedByElshocks;
    });

    const performances = casts.map((cast) =>
      spellUseToBoxRowEntry(cast, this.owner.fight.start_time),
    );

    const data = (
      <div>
        <div>
          <PanelHeader>
            <strong>Damage breakdown</strong> -{' '}
            <small>
              The uptime of <SpellLink spell={TALENTS.ELECTRIFIED_SHOCKS_TALENT} /> you should aim
              for generally decrease with the number of enemies in the encounter. Compare your
              results with other logs for most accurate analysis.
            </small>
          </PanelHeader>
          <RoundedPanel>
            <DonutChart
              items={[
                {
                  color: DONUT_WITH_ELSHOCKS,
                  label: (
                    <>
                      # hits with <SpellLink spell={TALENTS.ELECTRIFIED_SHOCKS_TALENT} />
                    </>
                  ),
                  value: totalDamageDone.hitsWithElshocks,
                },
                {
                  color: DONUT_WITHOUT_ELSHOCKS,
                  label: (
                    <>
                      # hits without <SpellLink spell={TALENTS.ELECTRIFIED_SHOCKS_TALENT} />
                    </>
                  ),
                  value: totalDamageDone.hitsWithoutElshocks,
                },
              ]}
            />
            <Expandable
              header={
                <SectionHeader>
                  <small>Breakdown by spell</small>
                </SectionHeader>
              }
              element="section"
            >
              <Table>
                <thead>
                  <tr>
                    <th>Spell</th>
                    <th>
                      # hits with <SpellLink spell={TALENTS.ELECTRIFIED_SHOCKS_TALENT} />
                    </th>
                    <th>
                      # hits without <SpellLink spell={TALENTS.ELECTRIFIED_SHOCKS_TALENT} />
                    </th>
                    <th>%</th>
                  </tr>
                </thead>
                <tbody>
                  {GUIDE_RELEVANT_NATURE_DAMAGE.map((spell) => {
                    const damageWithElshocks = this.damageDoneByCast[spell.id].hitsWithElshocks;
                    const damageWithoutElshocks =
                      this.damageDoneByCast[spell.id].hitsWithoutElshocks;
                    const damageWithElsocksPercentage =
                      (damageWithElshocks / (damageWithElshocks + damageWithoutElshocks)) * 100;

                    if (damageWithElshocks + damageWithoutElshocks === 0) {
                      return <></>;
                    }

                    return (
                      <tr key={spell.id}>
                        <td><SpellLink spell={spell} /></td>
                        <td>{formatNumber(damageWithElshocks)}</td>
                        <td>{formatNumber(damageWithoutElshocks)}</td>
                        <td>{damageWithElsocksPercentage.toFixed(2)}%</td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Expandable>
          </RoundedPanel>
        </div>
        <div style={{ marginTop: '5px' }}>
          <PanelHeader>
            <strong>Icefury cast breakdown</strong> -{' '}
            <small>
              Properly executing icefury windows is crucial to achieving high uptime of{' '}
              <SpellLink spell={TALENTS.ELECTRIFIED_SHOCKS_TALENT} />
            </small>
          </PanelHeader>
          <PerformanceBoxRow values={performances} />
        </div>
      </div>
    );

    return explanationAndDataSubsection(
      description,
      data,
      GUIDE_EXPLANATION_PERCENT_WIDTH,
      'Electrified Shocks',
    );
  }

  statistic() {
    return (
      <Statistic
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip="Damage gained by the target having Electrified Shocks when taking nature damage."
      >
        <TalentSpellText talent={TALENTS.ELECTRIFIED_SHOCKS_TALENT}>
          <ItemDamageDone
            amount={Object.values(this.damageDoneByCast).reduce(
              (a, b) => a + b.damageGainedByElshocks,
              0,
            )}
          />
        </TalentSpellText>
      </Statistic>
    );
  }
}
