import React from 'react';
import PropTypes from 'prop-types';

import TooltipProvider from 'common/TooltipProvider';

import RESOURCE_TYPES from './RESOURCE_TYPES';
import ResourceIcon from './ResourceIcon';

class ResourceLink extends React.PureComponent {
  static propTypes = {
    id: PropTypes.number.isRequired,
    children: PropTypes.node,
    category: PropTypes.string,
    icon: PropTypes.bool,
  };
  static defaultProps = {
    icon: true,
  };

  elem = null;

  componentDidMount() {
    this.componentDidUpdate();
  }
  componentDidUpdate() {
    TooltipProvider.refresh(this.elem);
  }

  render() {
    const { id, children, category = undefined, icon, ...other } = this.props;

    if (process.env.NODE_ENV === 'development' && !children && !RESOURCE_TYPES[id]) {
      throw new Error(`Unknown spell: ${id}`);
    }

    return (
      <a
        href={TooltipProvider.resource(id)}
        target="_blank"
        rel="noopener noreferrer"
        className={category}
        ref={elem => {
          this.elem = elem;
        }}
        {...other}
      >
        {icon && <ResourceIcon id={id} noLink />}{' '}
        {children || RESOURCE_TYPES[id].name}
      </a>
    );
  }
}

export default ResourceLink;
