import Spell from 'common/SPELLS/Spell';
import { ComponentProps } from 'react';

import SpellLink from './SpellLink';
import { useCombatLogParser } from 'interface/report/CombatLogParserContext';

type Props = ComponentProps<typeof SpellLink>;

/**
 * Special SpellLink that uses context to get the correct itemlevel and link to it.
 *
 * Must have parser context.
 */
const ConduitLink = ({ id, ...rest }: Props) => {
  const {
    combatLogParser: { selectedCombatant },
  } = useCombatLogParser();

  if (typeof id === 'object') {
    id = (id as Spell).id;
  }
  const rank = selectedCombatant.conduitRankBySpellID(id);

  return <SpellLink id={id} rank={rank} {...rest} />;
};

export default ConduitLink;
