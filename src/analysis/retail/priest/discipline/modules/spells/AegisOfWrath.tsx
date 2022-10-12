import SPELLS from 'common/SPELLS';
import { TALENTS_PRIEST } from 'common/TALENTS';
import { SpellLink } from 'interface';
import Analyzer, { Options, SELECTED_PLAYER } from 'parser/core/Analyzer';
import Events, { ApplyBuffEvent, RemoveBuffEvent } from 'parser/core/Events';
import BoringSpellValueText from 'parser/ui/BoringSpellValueText';
import ItemHealingDone from 'parser/ui/ItemHealingDone';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const POWER_WORD_SHIELD_DURATION_MS = 15000;

type ShieldInfo = ApplyBuffEvent[];

class AegisOfWrath extends Analyzer {
  bonusShielding = 0;
  decayedShields = 0;
  shieldApplications: ShieldInfo = [];

  constructor(options: Options) {
    super(options);

    this.active = this.selectedCombatant.hasTalent(TALENTS_PRIEST.AEGIS_OF_WRATH_TALENT);

    if (!this.active) {
      return;
    }

    this.addEventListener(
      Events.applybuff.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_SHIELD),
      this.onShieldApplication,
    );

    this.addEventListener(
      Events.removebuff.by(SELECTED_PLAYER).spell(SPELLS.POWER_WORD_SHIELD),
      this.onShieldExpiry,
    );
  }

  onShieldApplication(event: ApplyBuffEvent) {
    this.shieldApplications.push(event);
  }

  onShieldExpiry(event: RemoveBuffEvent) {
    this.shieldApplications.forEach((shield) => {
      if (
        event.targetID === shield.targetID &&
        event.timestamp > shield.timestamp &&
        shield.timestamp + POWER_WORD_SHIELD_DURATION_MS > event.timestamp
      ) {
        const shieldAmount = shield.absorb || 0;
        const extraShield = shieldAmount - shieldAmount / 1.5;
        this.bonusShielding += extraShield - (event.absorb || 0);
      }
    });
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.OPTIONAL(13)}
        size="flexible"
        category={STATISTIC_CATEGORY.ITEMS}
        tooltip={
          <>
            This value is calculated from the healing contributed from the last 3 seconds of the
            applied <SpellLink id={SPELLS.ATONEMENT_BUFF.id} />.
          </>
        }
      >
        <>
          <BoringSpellValueText spellId={TALENTS_PRIEST.AEGIS_OF_WRATH_TALENT.id}>
            <ItemHealingDone amount={this.bonusShielding} /> <br />
          </BoringSpellValueText>
        </>
      </Statistic>
    );
  }
}

export default AegisOfWrath;
