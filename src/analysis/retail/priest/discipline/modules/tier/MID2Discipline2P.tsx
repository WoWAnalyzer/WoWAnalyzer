import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import { TIERS } from 'game/TIERS';
import SPELLS from 'common/SPELLS';
import Events, { CastEvent } from 'parser/core/Events';
import { TALENTS_PRIEST } from 'common/TALENTS';
import SpellLink from 'interface/SpellLink';
import { PRIEST_MID2_ID } from 'common/ITEMS';
import SpellUsable from 'parser/shared/modules/SpellUsable';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import ItemSetLink from 'interface/ItemSetLink';
import ItemCooldownReduction from 'parser/ui/ItemCooldownReduction';
import BoringItemSetValueText from 'parser/ui/BoringItemSetValueText';

/** (2) Set Discipline: Penance damage and healing increased by 20%.
 * Casting Penance reduces the cooldown of Mind Blast by 2.0 sec.
 */

class MID2Discipline2P extends Analyzer.withDependencies({
  spellUsable: SpellUsable,
}) {
  twoPieceCdr = 2000;
  mindBlastId = TALENTS_PRIEST.MIND_BLAST_TALENT.id;
  effectiveCdr = 0;
  wastedCdr = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.has2PieceByTier(TIERS.MID2);
    if (!this.active) {
      return;
    }

    this.addEventListener(Events.cast.by(SELECTED_PLAYER).spell(SPELLS.PENANCE_CAST), this.onCast);
  }

  onCast(event: CastEvent) {
    const effectiveCdr = this.deps.spellUsable.reduceCooldown(this.mindBlastId, this.twoPieceCdr);
    const wastedCdr = this.twoPieceCdr - effectiveCdr;

    this.effectiveCdr += effectiveCdr;
    this.wastedCdr += wastedCdr;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(2)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            The amount of cooldown reduction applied to{' '}
            <SpellLink spell={TALENTS_PRIEST.MIND_BLAST_TALENT} /> from casting{' '}
            <SpellLink spell={SPELLS.PENANCE_CAST} /> with the{' '}
            <ItemSetLink id={PRIEST_MID2_ID}>Season 2 Tier Set 2-piece</ItemSetLink> equipped.
          </>
        }
      >
        <BoringItemSetValueText setId={PRIEST_MID2_ID} title={'Season 2 Tier Set 2-piece'}>
          <ItemCooldownReduction effective={this.effectiveCdr} waste={this.wastedCdr} />
        </BoringItemSetValueText>
      </Statistic>
    );
  }
}

export default MID2Discipline2P;
