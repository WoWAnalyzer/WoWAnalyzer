
import { formatDuration } from 'common/format';
import getFightName from 'common/getFightName';
import getWipeCount from 'common/getWipeCount';
import { findByBossId } from 'game/raids';
import CancelIcon from 'interface/icons/Cancel';
import InformationIcon from 'interface/icons/Information';
import SkullIcon from 'interface/icons/Skull';
import makeAnalyzerUrl from 'interface/makeAnalyzerUrl';
import ProgressBar from 'interface/report/ProgressBar';
import { WCLFight } from 'parser/core/Fight';
import Report from 'parser/core/Report';
import { PureComponent } from 'react';
import { Link } from 'react-router-dom';

interface Props {
  report: Report;
  fights: WCLFight[];
  killsOnly: boolean;
  playerId?: number;
  resultTab?: string;
}

const groupByFight = (fights: WCLFight[]) => {
  let last: WCLFight[] = [];
  return fights.reduce((arr, fight) => {
    const isDifferent =
      last.length === 0 || last[0].boss !== fight.boss || last[0].difficulty !== fight.difficulty;
    if (isDifferent) {
      last = [];
      arr.push(last);
    }
    last.push(fight);
    return arr;
  }, [] as WCLFight[][]);
};

class FightSelectionPanelList extends PureComponent<Props> {
  render() {
    const { fights, report, killsOnly, playerId, resultTab } = this.props;

    const filteredFights = fights.filter((fight) => {
      if (fight.boss === 0) {
        // Hide trashfights
        return false;
      }
      if (killsOnly && fight.kill === false) {
        return false;
      }
      return true;
    });

    return (
      <ul className="list">
        {groupByFight(filteredFights).map((pulls) => {
          const firstPull = pulls[0];
          const boss = findByBossId(firstPull.boss);

          return (
            <li key={firstPull.id} className="item">
              <div className="flex">
                <div className="flex-sub content">
                  {boss && boss.headshot && <img src={boss.headshot} className="headshot" alt="" />}
                </div>
                <div className="flex-main">
                  <h2 style={{ marginTop: 0 }}>{getFightName(report, firstPull)}</h2>
                  <div className="pulls">
                    {pulls.map((pull) => {
                      const duration = Math.round(pull.end_time - pull.start_time);
                      const Icon = pull.kill ? SkullIcon : CancelIcon;

                      return (
                        <Link
                          key={pull.id}
                          to={makeAnalyzerUrl(report, pull.id, playerId, resultTab)}
                          className={`pull ${pull.kill ? 'kill' : 'wipe'}`}
                        >
                          <div className="flex">
                            <div className="flex-main">
                              <Icon />{' '}
                              {pull.kill ? (
                                <>
                                  Kill
                                </>
                              ) : (
                                <>
                                  Wipe {getWipeCount(fights, pull)}
                                </>
                              )}
                            </div>
                            <div className="flex-sub">
                              <small>{formatDuration(duration)}</small>{' '}
                              <ProgressBar
                                percentage={pull.kill ? 100 : (10000 - pull.fightPercentage!) / 100}
                                width={100}
                                height={8}
                              />
                            </div>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
        <li className="item clearfix text-muted" style={{ paddingTop: 10, paddingBottom: 10 }}>
          <InformationIcon />{' '}
          <>
            You will usually get the most helpful results using raid fights where you're being
            challenged, such as progress raids.
          </>
        </li>
      </ul>
    );
  }
}

export default FightSelectionPanelList;
