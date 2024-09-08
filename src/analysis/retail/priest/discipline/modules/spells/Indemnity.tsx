import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { CastEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

import { POWER_WORD_SHIELD_ATONEMENT_DUR } from '../../constants';

import AtonementAnalyzer, { AtonementAnalyzerEvent } from '../core/AtonementAnalyzer';

const INDEMNITY_EXTENSION_DURATION = 3000;
const EVANG_EXTENSION_DURATION = 6000;

type ShieldInfo = {
  cast: CastEvent;
  extendedByEvang?: boolean;
};

class Indemnity extends Analyzer {
  private atonementHealing: number = 0;
  shields: ShieldInfo[] = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.INDEMNITY_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(AtonementAnalyzer.atonementEventFilter, this.handleAtone);
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell([SPELLS.POWER_WORD_SHIELD, SPELLS.RAPTURE]),
      this.onShieldCast,
    );
    this.addEventListener(
      Events.cast.by(SELECTED_PLAYER).spell(TALENTS_PRIEST.EVANGELISM_TALENT),
      this.checkEvang,
    );
  }

  private onShieldCast(event: CastEvent) {
    this.shields.push({
      cast: event,
    });
  }

  checkEvang(event: CastEvent) {
    this.shields.forEach((shield, index: number) => {
      if (
        event.timestamp > shield.cast.timestamp &&
        event.timestamp < shield.cast.timestamp + POWER_WORD_SHIELD_ATONEMENT_DUR
      ) {
        this.shields[index].extendedByEvang = true;
      }
    });
  }

  private handleAtone(event: AtonementAnalyzerEvent) {
    this.shields.forEach((rapture) => {
      const end =
        rapture.cast.timestamp +
        (rapture.extendedByEvang ? EVANG_EXTENSION_DURATION : 0) +
        POWER_WORD_SHIELD_ATONEMENT_DUR +
        INDEMNITY_EXTENSION_DURATION;
      const start =
        rapture.cast.timestamp +
        (rapture.extendedByEvang ? EVANG_EXTENSION_DURATION : 0) +
        POWER_WORD_SHIELD_ATONEMENT_DUR;

      if (
        event.targetID === rapture.cast.targetID &&
        event.timestamp > start &&
        event.timestamp < end
      ) {
        this.atonementHealing += event.healEvent.amount;
      }
    });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.TALENTS}
        tooltip={
          <>
            This value is calculated from the healing contributed from the last 2 seconds of the
            applied <SpellLink spell={SPELLS.ATONEMENT_BUFF} />.
          </>
        }
      >
        <>
          <BoringSpellValueText spell={TALENTS_PRIEST.INDEMNITY_TALENT}>
            <ItemHealingDone amount={this.atonementHealing} /> <br />
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default Indemnity;
