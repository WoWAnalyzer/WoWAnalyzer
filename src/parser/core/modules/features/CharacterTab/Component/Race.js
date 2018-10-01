import React from 'react';
import PropTypes from 'prop-types';

class Race extends React.PureComponent {
  static propTypes = {
    race: PropTypes.any.isRequired,
  };
  render() {
    const race = this.props.race;

    return (
      <React.Fragment>
        <div className="row">
          <div className="col-md-12">
            <h2>
              Race
            </h2>
          </div>
        </div>
        <div className="row">
          <div className="col-md-12 hpadding-lg-30">{/* some bonus padding so it looks to be aligned with the icon for stats */}
            {race ? race.name : 'Unknown'}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default Race;
