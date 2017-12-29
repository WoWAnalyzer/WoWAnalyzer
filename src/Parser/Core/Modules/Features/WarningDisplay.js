import React from 'react';

import Analyzer from 'Parser/Core/Analyzer';
import WarningIcon from 'Icons/Warning';

class WarningDisplay extends Analyzer {

  render() {
    const boss = this.owner.boss;
    if (boss && boss.fight.displayWarning) {
      return (
        <div>
          <div style={{ padding: 0 }}>
            <div className="flex-sub content-middle" style={{ margin: '0px 30px 0px 0px', color: '#FFA100', opacity: 0.8 }}>
                <div style={{ fontSize: '5.5em', lineHeight: 1, marginRight: 10, marginLeft: 10 }}>
                  <WarningIcon />
                </div>
                <div>
                  {boss.fight.displayWarning}
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
