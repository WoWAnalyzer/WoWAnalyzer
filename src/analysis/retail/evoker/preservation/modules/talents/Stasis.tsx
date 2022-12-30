import SPELLS from 'common/SPELLS';
import { TALENTS_EVOKER } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent, RemoveBuffEvent, RemoveBuffStackEvent } from 'parser/core/Events';
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
    const spell = getStasisSpell(event);
    if (spell) {
      this.curInfo!.spells.push(spell);
    }
  }

  onBuffRemoval(event: RemoveBuffEvent) {
    this.curInfo!.consumeTime = event.timestamp;
    this.stasisInfos.push(this.curInfo!);
    this.curInfo = null;
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
                <td>
                  {info.spells.map((spellid, idx2) => (
                    <>
                      <SpellLink key={idx2} id={spellid} /> <br />
                    </>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Statistic>
    );
  }
}

export default Stasis;
