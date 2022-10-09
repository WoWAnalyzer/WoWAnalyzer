import { TALENTS_DEMON_HUNTER } from 'common/TALENTS/demonhunter';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import { Options } from 'parser/core/EventSubscriber';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import SPECS from 'game/SPECS';
import CooldownIcon from 'interface/icons/Cooldown';
import { DEMONIC_DURATION } from '../../constants';

const META_BUFF_DURATION_EYEBEAM = DEMONIC_DURATION;

export default class Demonic extends Analyzer {
  demonicDuration = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS_DEMON_HUNTER.DEMONIC_TALENT.id);
    if (!this.active) {
      return;
    }
    const spell =
      this.selectedCombatant.specId === SPECS.HAVOC_DEMON_HUNTER.id
        ? TALENTS_DEMON_HUNTER.EYE_BEAM_TALENT
        : TALENTS_DEMON_HUNTER.FEL_DEVASTATION_TALENT;
    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(spell), this.onDemonicProc);
  }

  onDemonicProc(_: CastEvent) {
    this.demonicDuration += META_BUFF_DURATION_EYEBEAM;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spellId={TALENTS_DEMON_HUNTER.DEMONIC_TALENT.id}>
          <>
            <CooldownIcon /> {this.demonicDuration / 1000}s of Metamorphosis added
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
