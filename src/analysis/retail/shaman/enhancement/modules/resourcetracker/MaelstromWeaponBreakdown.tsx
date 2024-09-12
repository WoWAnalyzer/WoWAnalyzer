import ResourceBreakdown from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import TALENTS from 'common/TALENTS/shaman';

class MaelstromWeaponBreakdown extends ResourceBreakdown {
  prepareGenerated(tracker: ResourceTracker, scaleFactor = 1) {
    return Object.keys(tracker.buildersObj)
      .map((abilityId) => {
        const spellId = Number(abilityId);
        const extraDetail =
          spellId === TALENTS.STATIC_ACCUMULATION_TALENT.id
            ? ' (refund)'
            : spellId === TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id
              ? ' (passive)'
              : undefined;

        return {
          abilityId:
            spellId === TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id
              ? TALENTS.STATIC_ACCUMULATION_TALENT.id
              : spellId,
          generated: tracker.buildersObj[Number(abilityId)].generated * scaleFactor,
          wasted: tracker.buildersObj[Number(abilityId)].wasted * scaleFactor,
          extraDetail: extraDetail,
        };
      })
      .sort((a, b) => b.generated - a.generated)
      .filter((ability) => ability.generated > 0 || ability.wasted);
  }
}

export default MaelstromWeaponBreakdown;
