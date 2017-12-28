import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import WarningIcon from 'Icons/Warning';

class WarningDisplay extends Analyzer {

  render() {
    const boss = this.owner.boss;
    if (boss && boss.fight.displayAccuracyWarning) {
      return (
        <div>
          <div style={{ padding: 0 }}>
            <div className="flex-sub content-middle" style={{ margin: '10px 30px 10px 30px', color: '#FC9F06', opacity: 0.8 }}>
                <div style={{ fontSize: '4em', lineHeight: 1, marginRight: 20 }}>
                  <WarningIcon />
                </div>
                <div>
                  <h5>
                    Because of the way this encounter was designed, some statistics and suggestions may be inaccurate. Therefore it is recommended that you do not use this encounter as a guide for improving your overall play, and that you instead use these statistics and suggestions to compare yourself against other members of your raid and for improving your play for this encounter specifically.
                  </h5>
                </div>
            </div>
            <div style={{ background: 'rgba(255, 255, 255, 0.2)', height: 1 }} />
          </div>
        </div>
      );
    }
  }
}

export default WarningDisplay;
