import React, { Component } from 'react';
import { Link } from 'react-router';
import ReactTooltip from 'react-tooltip';

class PlayerSelecter extends Component {
  static propTypes = {
    report: React.PropTypes.shape({
      code: React.PropTypes.string.isRequired,
      title: React.PropTypes.string.isRequired,
      friendlies: React.PropTypes.arrayOf(React.PropTypes.shape({
        id: React.PropTypes.number.isRequired,
        type: React.PropTypes.string.isRequired,
        name: React.PropTypes.string.isRequired,
      })),
    }),
  };
  static contextTypes = {
    config: React.PropTypes.object.isRequired,
  };

  componentWillUnmount() {
    ReactTooltip.hide();
  }

  render() {
    const { report } = this.props;

    const config = this.context.config;
    const wclClassName = config.spec.className.replace(' ', '');

    return (
      <div>
        <h1>
          <div className="back-button">
            <Link to="/" data-tip="Change report">
              <span className="glyphicon glyphicon-chevron-left" aria-hidden="true" />
            </Link>
          </div>
          {config.spec.className} selection
        </h1>

        <div className="panel">
          <div className="panel-heading">
            <h2>Select the {config.spec.className} you wish to analyze</h2>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <ul className="list selection">
              {
                report.friendlies
                  .filter(friendly => friendly.type === wclClassName)
                  .sort((a, b) => a.name > b.name)
                  .map(friendly => (
                    <li key={`${friendly.id}`}>
                      <Link to={`/report/${report.code}/${friendly.name}`}>
                        {friendly.name}
                      </Link>
                    </li>
                  ))
              }
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

export default PlayerSelecter;
