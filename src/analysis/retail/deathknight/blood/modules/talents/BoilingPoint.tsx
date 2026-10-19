import { formatDuration } from 'common/format';
import SPELLS from 'common/SPELLS';
import talents from 'common/TALENTS/deathknight';
import SpellLink from 'interface/SpellLink';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RefreshBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { BoilingPointEcho } from './BoilingPointNormalizer';

type IssueType = 'overlap' | 'early' | 'expired';

interface IssueRecord {
  timestamp: number;
  type: IssueType;
}

const ISSUE_LABELS: Record<IssueType, string> = {
  overlap: 'Gained before previous was used',
  early: 'Used before echo exploded',
  expired: 'Expired unused',
};

/**
 * Tracks three ways of losing value from {@link talents.BOILING_POINT_TALENT Boiling Point}.
 *
 * The talent gives a buff that Blood Boil uses up. Using it up starts a short echo buff, and the
 * end of the echo is the explosion. The buff doesn't stack, so a refresh is always a new buff
 * landing on one that wasn't used, and every use starts or refreshes an echo.
 *
 * - Overlap: the buff is gained again before the previous one was used.
 * - Early use: the buff is used while the echo from an earlier use is still counting down, so it
 * hasn't exploded yet.
 * - Expired: the buff falls off without being used.
 */
export default class BoilingPoint extends Analyzer {
  private echoActive = false;

  private gains = 0;
  private uses = 0;
  private records: IssueRecord[] = [];

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(talents.BOILING_POINT_TALENT);

    const buff = SPELLS.BOILING_POINT_BUFF;
    const echo = SPELLS.BOILING_POINT_ECHO_BUFF;
    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(buff), this.onBuffApply);
    this.addEventListener(Events.refreshbuff.to(SELECTED_PLAYER).spell(buff), this.onBuffRefresh);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(buff), this.onBuffRemove);

    this.addEventListener(Events.applybuff.to(SELECTED_PLAYER).spell(echo), this.onEchoApply);
    this.addEventListener(Events.refreshbuff.to(SELECTED_PLAYER).spell(echo), this.onEchoRefresh);
    this.addEventListener(Events.removebuff.to(SELECTED_PLAYER).spell(echo), this.onEchoRemove);
  }

  private onBuffApply() {
    this.gains += 1;
  }

  private onBuffRefresh(event: RefreshBuffEvent) {
    this.gains += 1;
    this.records.push({ timestamp: event.timestamp, type: 'overlap' });
  }

  private onBuffRemove(event: RemoveBuffEvent) {
    if (!BoilingPointEcho.first(event)) {
      this.records.push({ timestamp: event.timestamp, type: 'expired' });
    }
  }

  /**
   * Every use starts an echo, so an echo starting while another is still up means the buff was used
   * before the earlier echo exploded. Checking this on the echo rather than on the buff removal
   * avoids depending on which of the two is logged first.
   */
  private onEchoApply(event: ApplyBuffEvent) {
    this.uses += 1;
    if (this.echoActive) {
      this.records.push({ timestamp: event.timestamp, type: 'early' });
    }
    this.echoActive = true;
  }

  private onEchoRefresh(event: RefreshBuffEvent) {
    this.uses += 1;
    this.records.push({ timestamp: event.timestamp, type: 'early' });
  }

  private onEchoRemove() {
    this.echoActive = false;
  }

  private count(type: IssueType) {
    return this.records.filter((record) => record.type === type).length;
  }

  get overlaps() {
    return this.count('overlap');
  }

  get earlyUses() {
    return this.count('early');
  }

  get expirations() {
    return this.count('expired');
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(6)}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            <div>
              {this.overlaps} of {this.gains} <SpellLink spell={SPELLS.BOILING_POINT_BUFF} /> gains
              came before the previous one was used.
            </div>
            <div>
              {this.earlyUses} of {this.uses} uses happened before the echo from an earlier use had
              exploded.
            </div>
            <div>{this.expirations} expired without being used.</div>
          </>
        }
        dropdown={
          this.records.length > 0 && (
            <table className="table table-condensed">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Issue</th>
                </tr>
              </thead>
              <tbody>
                {this.records.map((record, index) => (
                  <tr key={index}>
                    <th>{formatDuration(record.timestamp - this.owner.fight.start_time)}</th>
                    <td>{ISSUE_LABELS[record.type]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )
        }
      >
        <BoringSpellValueText spell={talents.BOILING_POINT_TALENT}>
          <div>
            {this.overlaps} <small>overlaps</small>
          </div>
          <div>
            {this.earlyUses} <small>early uses</small>
          </div>
          <div>
            {this.expirations} <small>expired</small>
          </div>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
