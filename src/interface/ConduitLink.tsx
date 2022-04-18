import CombatLogParser from 'parser/core/CombatLogParser';
import PropTypes from 'prop-types';

import SpellLink from './SpellLink';

interface Props {
  id: number;
}

interface Context {
  parser: CombatLogParser;
}

/**
 * Special SpellLink that uses context to get the correct itemlevel and link to it.
 *
 * Must have parser context.
 */
const ConduitLink = ({ id }: Props, { parser: { selectedCombatant } }: Context) => {
  const ilvl = selectedCombatant.conduitIlvlBySpellID(id);

  return <SpellLink id={id} ilvl={ilvl} />;
};
ConduitLink.contextTypes = {
  parser: PropTypes.object.isRequired,
};

export default ConduitLink;
