import { formatPercentage } from 'common/format';
import SPELLS from 'common/SPELLS/rogue';
import { SpellIcon, SpellLink } from 'interface';
import UptimeIcon from 'interface/icons/Uptime';
import Analyzer from 'parser/core/Analyzer';
import { NumberThreshold, ThresholdStyle } from 'parser/core/ParseResults';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import StatisticBox from 'parser/ui/StatisticBox';

import { ROLL_THE_BONES_BUFFS } from '../../constants';
import { RoundedPanel } from 'interface/guide/components/GuideDivs';
import { explanationAndDataSubsection } from 'interface/guide/components/ExplanationRow';
import uptimeBarSubStatistic, { UptimeBarSpec } from 'parser/ui/UptimeBarSubStatistic';

class RollTheBonesBuffs extends Analyzer {
  /**
   * Percentage of the fight that Roll the Bones was active
   * In other words, at least one of the buffs was active
   */
  get totalPercentUptime(): number {
    return this.percentUptime(SPELLS.ROLL_THE_BONES.id);
  }

  get suggestionThresholds(): NumberThreshold {
    return {
      actual: this.totalPercentUptime,
      isLessThan: {
        minor: 0.95,
        average: 0.9,
        major: 0.8,
      },
      style: ThresholdStyle.PERCENTAGE,
    };
  }

  percentUptime(spellid: number) {
    return this.selectedCombatant.getBuffUptime(spellid) / this.owner.fightDuration;
  }

  get guideSubsection() {
    const explanation = (
      <>
        <p>
          <b>
            <SpellLink spell={SPELLS.ROLL_THE_BONES} />{' '}
          </b>
          is an ability that when cast gives you a 79% chance of 1 buff, a 20% chance of 2 buffs,
          and a 1% chance at 5 buffs. These buffs do the following:
        </p>
        <ul>
          <li>
            <b>
              <SpellLink spell={SPELLS.BROADSIDE} />
            </b>{' '}
            - Combo Point generators grant 1 additional combo point and deal bonus damage.
          </li>
          <li>
            <b>
              <SpellLink spell={SPELLS.BURIED_TREASURE} />
            </b>{' '}
            - Increased energy regen.
          </li>
          <li>
            <b>
              <SpellLink spell={SPELLS.GRAND_MELEE} />
            </b>{' '}
            - 5% increased damage, and 10% increased <SpellLink spell={SPELLS.BLADE_FLURRY} />{' '}
            damage.
          </li>
          <li>
            <b>
              <SpellLink spell={SPELLS.RUTHLESS_PRECISION} />
            </b>{' '}
            - 15% increased crit for all abilities, 60% increased crit for{' '}
            <SpellLink spell={SPELLS.BETWEEN_THE_EYES} />.
          </li>
          <li>
            <b>
              <SpellLink spell={SPELLS.SKULL_AND_CROSSBONES} />
            </b>{' '}
            - Chance to proc <SpellLink spell={SPELLS.OPPORTUNITY} /> increased.
          </li>
          <li>
            <b>
              <SpellLink spell={SPELLS.TRUE_BEARING} />
            </b>{' '}
            - <SpellLink spell={SPELLS.RESTLESS_BLADES_TALENT} /> increased to 1.5 seconds per combo
            point spent.
          </li>
        </ul>
      </>
    );
    //const colors = ['#6a9ecb', '6600CC', '#f19206', '#5a4752', '#ffbf02', '#701110'];

    const rollTheBonesBarSpec: UptimeBarSpec = {
      spells: [SPELLS.ROLL_THE_BONES],
      uptimes: this.selectedCombatant.getBuffHistory(SPELLS.ROLL_THE_BONES).map((buff) => ({
        start: buff.start,
        end: buff.end ?? this.owner.currentTimestamp,
      })),
    };

    const subBuffsBarSpecs: UptimeBarSpec[] = ROLL_THE_BONES_BUFFS.map((buff, idx) => ({
      spells: [buff],
      uptimes: this.selectedCombatant.getBuffHistory(buff.id).map((buff) => ({
        start: buff.start,
        end: buff.end ?? this.owner.currentTimestamp,
      })),
      //color: colors[idx],
    }));

    const data = (
      <RoundedPanel>
        {uptimeBarSubStatistic(this.owner.fight, rollTheBonesBarSpec, subBuffsBarSpecs)}
      </RoundedPanel>
    );

    return explanationAndDataSubsection(explanation, data);
  }

  statistic() {
    return (
      <StatisticBox
        position={STATISTIC_ORDER.CORE(2)}
        icon={<SpellIcon spell={SPELLS.ROLL_THE_BONES} />}
        value={
          <>
            <UptimeIcon /> {formatPercentage(this.totalPercentUptime)}% <small>uptime</small>
            <br />
          </>
        }
        label={<SpellLink spell={SPELLS.ROLL_THE_BONES} icon={false} />}
      >
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Buff</th>
              <th>Time (%)</th>
            </tr>
          </thead>
          <tbody>
            {ROLL_THE_BONES_BUFFS.map((e) => (
              <tr key={e.id}>
                <th>
                  <SpellLink spell={e} />
                </th>
                <td>{`${formatPercentage(this.percentUptime(e.id))} %`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </StatisticBox>
    );
  }
}

export default RollTheBonesBuffs;
