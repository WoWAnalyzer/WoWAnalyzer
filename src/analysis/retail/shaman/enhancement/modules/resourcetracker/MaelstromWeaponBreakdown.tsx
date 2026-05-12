import ResourceBreakdown, {
  GeneratedResourceRow,
} from 'parser/shared/modules/resources/resourcetracker/ResourceBreakdown';
import ResourceTracker from 'parser/shared/modules/resources/resourcetracker/ResourceTracker';
import TALENTS from 'common/TALENTS/shaman';

interface Props {
  tracker: ResourceTracker;
  showSpenders: boolean;
  showMaxSpenders?: boolean;
}

const prepareGenerated = (tracker: ResourceTracker, scaleFactor = 1): GeneratedResourceRow[] =>
  Object.keys(tracker.buildersObj)
    .map((abilityId) => {
      const spellId = Number(abilityId);
      return {
        abilityId:
          spellId === TALENTS.ASCENDANCE_ENHANCEMENT_TALENT.id
            ? TALENTS.STATIC_ACCUMULATION_TALENT.id
            : spellId,
        generated: tracker.buildersObj[Number(abilityId)].generated * scaleFactor,
        wasted: tracker.buildersObj[Number(abilityId)].wasted * scaleFactor,
      };
    })
    .sort((a, b) => b.generated - a.generated)
    .filter((ability) => ability.generated > 0 || ability.wasted);

const MaelstromWeaponBreakdown = (props: Props) => (
  <ResourceBreakdown {...props} prepareGenerated={prepareGenerated} />
);

export default MaelstromWeaponBreakdown;
