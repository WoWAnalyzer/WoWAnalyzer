import CoreAlwaysBeCasting from 'parser/shared/modules/AlwaysBeCasting';

class AlwaysBeCasting extends CoreAlwaysBeCasting {
    get downtimeSuggestionThresholds() {
        return {
            actual: this.downtimePercentage,
            isGreaterThan: {
                minor: 0.05,
                average: 0.15,
                major: 0.25,
            },
            style: 'percentage',
        };
    }
}

export default AlwaysBeCasting;
