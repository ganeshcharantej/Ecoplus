const calculateFootprint = (km: number, kwh: number, diet: string): number => {
    const transport = km * 0.0002;
    const energy = kwh * 12 * 0.0008;
    const dietMetrics: Record<string, number> = { omnivore: 2.5, vegetarian: 1.7, vegan: 1.2 };
    const dietCO2 = dietMetrics[diet] || 2.5;
    return transport + energy + dietCO2;
};

describe('EcoPlus Carbon Math Formulas', () => {
    it('correctly calculates the total footprint for a standard diet profile', () => {
        const total = calculateFootprint(5000, 150, 'omnivore');
        // Math breakdown: (5000 * 0.0002) + (150 * 12 * 0.0008) + 2.5 = 1.0 + 1.44 + 2.5 = 4.94
        expect(total).toBeCloseTo(4.94);
    });

    it('correctly calculates a clean-energy vegan profile', () => {
        const total = calculateFootprint(0, 0, 'vegan');
        expect(total).toBeCloseTo(1.2);
    });
});