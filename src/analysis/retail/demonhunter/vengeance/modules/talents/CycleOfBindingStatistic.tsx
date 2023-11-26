import TALENTS from 'common/TALENTS/demonhunter';
import Spell from 'common/SPELLS/Spell';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_CATEGORY from 'parser/ui/STATISTIC_CATEGORY';
import TalentSpellText from 'parser/ui/TalentSpellText';
import CooldownIcon from 'interface/icons/Cooldown';
import { formatDurationMillisMinSec } from 'common/format';
import { maybeGetTalentOrSpell } from 'common/maybeGetTalentOrSpell';
import { isTalent } from 'common/TALENTS/types';
import SpellLink from 'interface/SpellLink';
import Combatant from 'parser/core/Combatant';

type Props = {
  sigilCdr: Record<number, number>;
  selectedCombatant: Combatant;
};

type SigilSpellIdCdrEntry = [number, number];
type SigilCdrEntry = [Spell, number];

const isSigilCdrEntry = (entry: [Spell | undefined, number]): entry is SigilCdrEntry =>
  Boolean(entry[0]);
const toSigilSpellIdCdrEntry = ([spellId, cdr]: [string, number]): SigilSpellIdCdrEntry => [
  Number(spellId),
  cdr,
];
const toSigilCdrEntry = ([spellId, cdr]: SigilSpellIdCdrEntry): [Spell | undefined, number] => [
  maybeGetTalentOrSpell(spellId),
  cdr,
];

const CycleOfBindingStatistic = ({ selectedCombatant, sigilCdr }: Props) => {
  const totalCDR = Object.values(sigilCdr).reduce((acc, val) => acc + val, 0);
  const sigils = Object.entries(sigilCdr)
    .map(toSigilSpellIdCdrEntry)
    .map(toSigilCdrEntry)
    .filter(isSigilCdrEntry)
    .filter(([sigil]) => !isTalent(sigil) || selectedCombatant.hasTalent(sigil));

  return (
    <Statistic
      category={STATISTIC_CATEGORY.TALENTS}
      size="flexible"
      dropdown={
        <table className="table table-condensed">
          <thead>
            <tr>
              <th>Sigil</th>
              <th>CDR</th>
            </tr>
          </thead>
          <tbody>
            {sigils.map(([sigil, cdr]) => (
              <tr key={sigil.id}>
                <th>
                  <SpellLink spell={sigil} />
                </th>
                <td>{formatDurationMillisMinSec(cdr)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      }
    >
      <TalentSpellText talent={TALENTS.CYCLE_OF_BINDING_TALENT}>
        <CooldownIcon /> {formatDurationMillisMinSec(totalCDR)} <small>of Sigil cooldown CDR</small>
      </TalentSpellText>
    </Statistic>
  );
};

export default CycleOfBindingStatistic;
