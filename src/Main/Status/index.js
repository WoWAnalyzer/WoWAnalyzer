import React from 'react';

import makeApiUrl from 'common/makeApiUrl';
import WclApiRequests from './WclApiRequests';
import WclApiResponseTime from './WclApiResponseTime';

const TIME_SPAN = {
  DAY: 24 * 60,
  WEEK: 7 * 24 * 60,
};
const TIME_SPAN_LABELS = {
  [TIME_SPAN.DAY]: '24 hours',
  [TIME_SPAN.WEEK]: '7 days',
};

class Status extends React.Component {
  constructor() {
    super();
    this.state = {
      status: null,
      timeSpanMinutes: TIME_SPAN.DAY,
    };
  }

  componentWillMount() {
    this.load();
  }
  load() {
    return fetch(makeApiUrl('status'))
      .then(response => response.json())
      .then(json => {
        console.log('Received status', json);
        this.setState({
          status: json,
        });
      });
  }

  render() {
    const timeSpanMinutes = this.state.timeSpanMinutes;

    return (
      <div>
        <div className="btn-group pull-right">
          {Object.keys(TIME_SPAN)
            .map(key => TIME_SPAN[key])
            .map(timeSpan => (
              <button
                key={timeSpan}
                className={`btn btn-default btn-sm${timeSpanMinutes === timeSpan ? ' active' : ''}`}
                onClick={() => this.setState({ timeSpanMinutes: timeSpan })}
              >
                {TIME_SPAN_LABELS[timeSpan]}
              </button>
            ))}
        </div>

        <h1 style={{ display: 'inline-block' }}>WCL API requests per minute</h1><br />
        This does not (yet) include refreshing (cache busting) in the fight selection.

        <WclApiRequests
          history={this.state.status}
          timeSpanMinutes={timeSpanMinutes}
        />
        <h1>WCL API response time</h1>
        <WclApiResponseTime
          history={this.state.status}
          timeSpanMinutes={timeSpanMinutes}
        />
      </div>
    );
  }
}

export default Status;
