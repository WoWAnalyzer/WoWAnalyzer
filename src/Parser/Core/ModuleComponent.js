import React from 'react';
import PropTypes from 'prop-types';

class ModuleComponent extends React.PureComponent {
  static propTypes = {
    owner: PropTypes.object.isRequired,
  };

  get owner() {
    return this.props.owner;
  }
  /** @var boolean Whether or not this module is active, usually depends on specific items or talents. */
  get active() {
    return this.state.active;
  }

  constructor(props) {
    super(props);
    props.owner.registerModule(this);
    this.state = {
      active: true,
    };
  }

  on_forceUpdate() {
    this.forceUpdate();
  }
}

export default ModuleComponent;
