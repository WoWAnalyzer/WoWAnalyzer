import SharedBindingShot from 'parser/hunter/shared/modules/talents/BindingShot';
import STATISTIC_CATEGORY from 'interface/others/STATISTIC_CATEGORY';

/**
 * This exists baseline for Marksmanship now.
 *
 * Fires a magical projectile, tethering the enemy and any other enemies within
 * 5 yards for 10 sec, rooting them in place for 5 sec if they move more than 5
 * yards from the arrow. Example log:
 * https://www.warcraftlogs.com/reports/qZRdFv9Apg74wmMV#fight=3&type=damage-done
 */

class BindingShot extends SharedBindingShot {

  constructor(options: any) {
    super(options);
    this.active = true;
    this.category = STATISTIC_CATEGORY.GENERAL;
  }
}

export default BindingShot;
