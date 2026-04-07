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
          <p>
            This is one of the most important spells for efficient gameplay. When pressed it has a
            chance of giving a buff that goes from stage 1 to stage 4. Most of the power is baked
            into the first 2 stages whom are the most accessible to maintain.
          </p>
          <p>
            Depending on which stage you enter, you will also receive all the buffs of the previous
            stages.
          </p>
          <p>
            For example, if you gain Stage 3, you will not only gain the cooldown reduction increase
            from Restless Blades, but also gain the bonuses to Sinister Strike and Ambush from
            Stages 1 and 2.
          </p>
          <p>
            The current odds of receiving the buffs seem to be 55% chance to gain Stage 1, 30%
            chance to gain Stage 2, 10% chance to gain Stage 3, and a 5% chance to gain Stage 4.
          </p>
          <p>
            (Source:{' '}
            <a href="https://www.icy-veins.com/wow/outlaw-rogue-pve-dps-rotation-cooldowns-abilities">
              Icy veins
            </a>
            )
          </p>
        </p>
        <ul>
          <li>
            <b>
              <SpellLink spell={SPELLS.ONE_OF_A_KIND} />
            </b>{' '}
            - <SpellLink spell={SPELLS.SINISTER_STRIKE} /> has a 20% increased chance to strike
            twice and grant <SpellLink spell={SPELLS.OPPORTUNITY} />
          </li>
          <li>
            <b>
              <SpellLink spell={SPELLS.DOUBLE_TROUBLE} />
            </b>{' '}
            - <SpellLink spell={SPELLS.SINISTER_STRIKE} /> and <SpellLink spell={SPELLS.AMBUSH} />{' '}
            generate 1 additional combo point and deal 15% increased damage
          </li>
          <li>
            <b>
              <SpellLink spell={SPELLS.TRIPLE_THREAT} />
            </b>{' '}
            - <SpellLink spell={SPELLS.RESTLESS_BLADES_TALENT} /> cooldown reduction increased by
            30%.
          </li>
          <li>
            <b>
              <SpellLink spell={SPELLS.JACKPOT} />
            </b>{' '}
            - Critical strike chance increased by 10%.
          </li>
        </ul>
      </>
    );
    const colors = ['#6a9ecb', '#c06c52', '#f19206', '#ffbf02', '#760200'];

    const subBuffsBarSpecs: UptimeBarSpec[] = ROLL_THE_BONES_BUFFS.map((buff, idx) => ({
      spells: [buff],
      uptimes: this.selectedCombatant.getBuffHistory(buff.id).map((buff) => ({
        start: buff.start,
        end: buff.end ?? this.owner.currentTimestamp,
      })),
      color: colors[idx],
    }));

    const rollTheBonesBarSpec: UptimeBarSpec = {
      spells: [SPELLS.ROLL_THE_BONES],
      uptimes: ROLL_THE_BONES_BUFFS.flatMap((buff, idx) =>
        this.selectedCombatant.getBuffHistory(buff.id),
      ).map((buff) => ({
        start: buff.start,
        end: buff.end ?? this.owner.currentTimestamp,
      })),
    };

    const data = (
      <div>
        <RoundedPanel>
          <strong>
            <SpellLink spell={SPELLS.ROLL_THE_BONES} /> uptime
          </strong>
          {uptimeBarSubStatistic(this.owner.fight, rollTheBonesBarSpec, subBuffsBarSpecs)}
        </RoundedPanel>
      </div>
    );

    return explanationAndDataSubsection(explanation, data, 40);
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
