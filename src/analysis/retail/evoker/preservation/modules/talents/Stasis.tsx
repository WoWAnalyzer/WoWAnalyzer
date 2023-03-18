import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, {
  CastEvent,
  EventType,
  RemoveBuffEvent,
  RemoveBuffStackEvent,
} from 'parser/core/Events';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import { getStasisSpell } from '../../normalizers/CastLinkNormalizer';

interface StasisInfo {
  castTime: number; // when stasis is originally cast
  consumeTime: number; // when stasis is consumed
  spells: number[]; // spells that player cast with stasis
}

class Stasis extends Analyzer {
  stasisInfos: StasisInfo[] = [];
  curInfo: StasisInfo | null = null;
  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_EVOKER.STASIS_TALENT);
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.STASIS_BUFF),
      this.onBuffRemoval,
    );
    this.addEventListener(
      Events.removebuffstack.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.STASIS_TALENT),
      this.onStackRemoval,
    );
    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.STASIS_TALENT),
      this.onStackRemoval,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_EVOKER.STASIS_TALENT),
      this.onCast,
    );
  }

  onCast(event: CastEvent) {
    this.curInfo = { castTime: event.timestamp, consumeTime: 0, spells: [] };
  }

  onStackRemoval(event: RemoveBuffStackEvent | RemoveBuffEvent) {
    if (!this.curInfo) {
      // stasis was cast pre-pull
      const numStacks =
        event.type === EventType.RemoveBuffStack ? (event as RemoveBuffStackEvent).stack : 0;
      // first removal puts you at 2 stacks, so if we go from 2->1 then numStacks is 1, which means we're missing 1 spell
      this.curInfo = {
        castTime: this.owner.fight.start_time,
        consumeTime: 0,
        spells: Array(2 - numStacks).fill(0),
      };
    }
    const spell = getStasisSpell(event);
    if (spell) {
      this.curInfo!.spells.push(spell);
    }
  }

  onBuffRemoval(event: RemoveBuffEvent) {
    if (this.curInfo) {
      this.curInfo!.consumeTime = event.timestamp;
      this.stasisInfos.push(this.curInfo!);
      this.curInfo = null;
    }
  }

  getSpellLink(key: number, spellid: number) {
    if (spellid === 0) {
      return (
        <>
          Unknown spell cast before pull <br />
        </>
      );
    }
    return (
      <>
        <SpellLink key={key} id={spellid} />
        <br />
      </>
    );
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        wide
      >
        <SpellLink id={TALENTS_EVOKER.STASIS_TALENT.id} /> <small>spell breakdown</small>
        <br />
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Cast #</th>
              <th>Cast Time</th>
              <th>Consume Time</th>
              <th>Spells</th>
            </tr>
          </thead>
          <tbody>
            {this.stasisInfos.map((info, index) => (
              <tr key={index}>
                <th scope="row">{index + 1}</th>
                <td>{this.owner.formatTimestamp(info.castTime)}</td>
                <td>{this.owner.formatTimestamp(info.consumeTime)}</td>
                <td>{info.spells.map((spellid, idx2) => this.getSpellLink(idx2, spellid))}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Statistic>
    );
  }
}

export default Stasis;
