import Spell from 'common/SPELLS/Spell';
import CombatLogParser from 'parser/core/CombatLogParser';
import PropTypes from 'prop-types';
import { ComponentProps } from 'react';

import SpellLink from './SpellLink';

type Props = ComponentProps<typeof SpellLink>;

interface Context {
  parser: CombatLogParser;
}

/**
 * Special SpellLink that uses context to get the correct itemlevel and link to it.
 *
 * Must have parser context.
 */
const ConduitLink = ({ id, ...rest }: Props, { parser: { selectedCombatant } }: Context) => {
  if (typeof id === 'object') {
    id = (id as Spell).id;
  }
  const rank = selectedCombatant.conduitRankBySpellID(id);

  return <SpellLink id={id} rank={rank} {...rest} />;
};
ConduitLink.contextTypes = {
  parser: PropTypes.object.isRequired,
};

export default ConduitLink;
