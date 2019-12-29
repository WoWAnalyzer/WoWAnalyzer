import React from 'react';
import PropTypes from 'prop-types';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';

import { TooltipElement } from 'common/Tooltip';

import Changelog from '../Changelog';

class ResultsChangelogTab extends React.PureComponent {
  static propTypes = {
    changelog: PropTypes.oneOfType([PropTypes.array, PropTypes.string]).isRequired,
    limit: PropTypes.number,
    includeCore: PropTypes.bool,
  };
  static defaultProps = {
    includeCore: true,
  };
  state = {
    includeCore: true,
  };

  render() {
    const { includeCore, ...others } = this.props;

    return (
      <div className="panel">
        <div className="panel-heading">
          {includeCore && (
            <div className="pull-right toggle-control text-muted">
              <Toggle
                defaultChecked={this.state.includeCore}
                icons={false}
                onChange={event => this.setState({ includeCore: event.target.checked })}
                id="core-entries-toggle"
              />{' '}
              <label htmlFor="core-entries-toggle">
                <TooltipElement content="Turn this off to only see changes to this spec's implementation.">Shared changes</TooltipElement>
              </label>
            </div>
          )}
          <h1>Changelog</h1>
        </div>
        <div className="panel-body">
          <Changelog includeCore={this.state.includeCore} {...others} />
        </div>
      </div>
    );
  }
}

export default ResultsChangelogTab;
