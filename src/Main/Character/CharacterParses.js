import React from 'react';
import PropTypes from 'prop-types';

import fetchWcl from 'common/fetchWcl';

class CharacterParses extends React.Component {

  static propTypes = {
    region: PropTypes.string.isRequired,
    realm: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  };

  constructor(props) {
    super(props);
    this.load = this.load.bind(this);
    this.load();
  }

  load() {
    console.info(this.props);

    return fetchWcl(`parses/character/${ this.props.name }/${ this.props.realm }/${ this.props.region }`, {
      
    }).then((parses) => {
      console.info(parses);
    });
  }

  render() {
    return (
      <div className="container">
        <div className="panel">
          Reeeeeeee
        </div>
      </div>
    );
  }
}

export default CharacterParses;
