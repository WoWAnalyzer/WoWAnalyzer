import PropTypes from 'prop-types';

import CoreAbility from 'Parser/Core/Modules/Ability';

class Ability extends CoreAbility {
  static propTypes = {
    ...CoreAbility.propTypes,
    antiFillerSpam: PropTypes.shape({
      isFiller: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.number,
      ]),
      condition: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.number,
      ]),
    }),
  };

  antiFillerSpam = null;

  /**
   * When extending this class you MUST copy-paste this function into the new class. Otherwise your new props will not be set properly.
   * @param owner
   * @param options
   */
  constructor(owner, options) {
    super(owner, options);
    this._owner = owner;
    this._setProps(options);
  }
}

export default Ability;
