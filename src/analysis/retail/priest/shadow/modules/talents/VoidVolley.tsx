import { formatNumber } from 'common/format';
import SPELLS from 'common/SPELLS';
import TALENTS from 'common/TALENTS/priest';
import ItemInsanityGained from 'analysis/retail/priest/shadow/interface/ItemInsanityGained';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { DamageEvent, ResourceChangeEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemDamageDone from 'parser/ui/ItemDamageDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';

class VoidVolley extends Analyzer {
  damageVoidVolley = 0;
  insanityGainedVoidVolley = 0;
  castVoidVolley = 0;
  castVoidTorrent = 0;

  constructor(options: Options) {
    super(options);
    this.active = this.selectedCombatant.hasTalent(TALENTS.VOID_VOLLEY_TALENT);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS.VOID_TORRENT_TALENT),
      this.onCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(SPELLS.VOID_VOLLEY_CAST),
      this.onVVCast,
    );
    this.addEventListener(
      Events.resourcechange.by(SELECTED_PLAYER).spell(SPELLS.VOID_VOLLEY_CAST),
      this.onVVInsanity,
    );
    this.addEventListener(
      Events.damage.by(SELECTED_PLAYER).spell(SPELLS.VOID_VOLLEY_DAMAGE),
      this.onVVDamage,
    );
  }

  onCast() {
    this.castVoidTorrent += 1;
  }

  onVVCast() {
    this.castVoidVolley += 1;
  }

  onVVDamage(event: DamageEvent) {
    this.damageVoidVolley += event.amount + (event.absorbed || 0);
  }

  onVVInsanity(event: ResourceChangeEvent) {
    this.insanityGainedVoidVolley += event.resourceChange;
  }

  statistic() {
    return (
      <Statistic category={STATISTIC_CATEGORY.TALENTS} size="flexible">
        <BoringSpellValueText spell={TALENTS.VOID_VOLLEY_TALENT}>
          <>
            <div>
              {formatNumber(this.castVoidVolley)}/{formatNumber(this.castVoidTorrent)}{' '}
              <small>casts of Void Volley</small>{' '}
            </div>
            <ItemDamageDone amount={this.damageVoidVolley} /> <br />
            <ItemInsanityGained amount={this.insanityGainedVoidVolley} />
          </>
        </BoringSpellValueText>
      </Statistic>
    );
  }
}

export default VoidVolley;
