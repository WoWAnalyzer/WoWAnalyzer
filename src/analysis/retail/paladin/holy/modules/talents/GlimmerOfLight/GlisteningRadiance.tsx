import TALENTS from 'common/TALENTS/paladin';
import Analyzer, { Options } from 'parser/core/Analyzer';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import GlimmerOfLight from './GlimmerOfLight';
import { formatNumber } from 'common/format';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

class GlisteningRadiance extends Analyzer {
  static dependencies = {
    glimmerOfLight: GlimmerOfLight,
  };

  protected glimmerOfLight!: GlimmerOfLight;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.GLISTENING_RADIANCE_TALENT);
    if (!this.active) {
      return;
    }
  }

  statistic() {
    const healing = this.glimmerOfLight.healingGlisteningRadiance;
    const beacon = this.glimmerOfLight.healingTransferedGlisteningRadiance;
    const damage = this.glimmerOfLight.damageGlisteningRadiance;
    const procs = this.glimmerOfLight.glisteningRadianceProcs;
    const hits = this.glimmerOfLight.glimmerHitsGlisteningRadiance;

    const totalHealing = healing + beacon;

    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL()}
        category={STATISTIC_CATEGORY.TALENTS}
        size="flexible"
        tooltip={
          <>
            Total healing done: <b>{formatNumber(healing)}</b>
            <br />
            Beacon healing transfered: <b>{formatNumber(beacon)}</b>
            <br />
            Glimmer damage: <b>{formatNumber(damage)}</b>
            <br />
          </>
        }
      >
        <BoringSpellValueText spell={TALENTS.GLISTENING_RADIANCE_TALENT}>
          <ItemHealingDone amount={totalHealing} /> <br />
          <ItemDamageDone amount={damage} /> <br />
          {(hits / procs).toFixed(1)} Triggers/Procs
        </BoringSpellValueText>
      </Statistic>
    );
  }
}
export default GlisteningRadiance;
