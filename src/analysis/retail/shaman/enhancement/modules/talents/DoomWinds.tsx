import Analyzer from 'parser/core/Analyzer';
import SpellUsable from '../core/SpellUsable';

class DoomWinds extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {}

export default DoomWinds;
