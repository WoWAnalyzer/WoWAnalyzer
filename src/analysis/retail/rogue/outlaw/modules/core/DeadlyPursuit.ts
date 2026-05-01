import SPELLS from 'common/SPELLS';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import RESTLESS_BLADES from 'analysis/retail/rogue/outlaw/modules/core/RestlessBlades';
import { getRemovedDeadlyPursuit } from '../../normalizers/CastLinkNormalizer';

class DeadlyPursuit extends Analyzer {
  static dependencies = {
    spellUsable: SpellUsable,
    restlessBlade: RESTLESS_BLADES,
  };

  protected spellUsable!: SpellUsable;
  protected restlessBlade!: RESTLESS_BLADES;

  constructor(options: Options) {
    super(options);
    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.DEADLY_PURSUIT),
      this.onDeadlyPursuitApply,
    );
  }

  onDeadlyPursuitApply(event: ApplyBuffEvent) {
    const removeBuff = getRemovedDeadlyPursuit(event);

    let duration = removeBuff * 3;

    this.restlessBlade.reduceRestlessBladesCDR(duration);

    this.addDebugAnnotation(event, {
      color: '#3700ff',
      summary: `Reducing Restless Blades cooldown by ${duration} ms due to Deadly Pursuit being active for ${removeBuff} ms`,
    });
  }
}

export default DeadlyPursuit;
