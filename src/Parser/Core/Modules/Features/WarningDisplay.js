import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';

class WarningDisplay extends Analyzer {

  render() {
    const boss = this.owner.boss;
    if (boss && boss.fight.displayAccuracyWarning) {
      return (
        <div className="panel">
          <div className="panel-heading">
            <h2>
                Warning
            </h2>
          </div>
          <div className="panel-body" style={{ padding: 0 }}>
            <div className="flex wrapable text-left" style={{ margin: '10px 30px 10px 30px' }}>
                <h5>
                  Because of the way this encounter was designed, some statistics and suggestions may be inaccurate. Therefore it is recommended that you do not use this encounter as a guide for improving your overall play, and that you instead use these statistics and suggestions to compare yourself against other members of your raid and for improving your play for this encounter specifically.
                </h5>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.2)', height: 1 }} />
          </div>
        </div>
      );
    }
  }
}

export default WarningDisplay;
