import Analyzer from 'parser/core/Analyzer';
import SpellUsable from '../core/SpellUsable';
import ThorimsInvocation from '../talents/ThorimsInvocation';

class AscendanceAnalyzer extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    thorimsInvocation: ThorimsInvocation,
  };

  spellUsable!: SpellUsable;
  thorimsInvocation!: ThorimsInvocation;

  get guideSubsection(): JSX.Element {
    return <></>;
  }
}

export default AscendanceAnalyzer;
