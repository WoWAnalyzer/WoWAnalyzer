import PropTypes from 'prop-types';

import CoreAbility from 'parser/core/modules/Ability';

class Ability extends CoreAbility {
  static propTypes = {
    ...CoreAbility.propTypes, // eslint-disable-line react/forbid-foreign-prop-types
    antiFillerSpam: PropTypes.shape({
      isFiller: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.number,
      ]),
      isHighPriority: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.number,
      ]),
    }),
  };

  antiFillerSpam = null;
}

export default Ability;
