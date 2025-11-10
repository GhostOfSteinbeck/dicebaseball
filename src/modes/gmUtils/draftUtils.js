// ============================================================================
// DRAFT UTILITIES
// ============================================================================

import { generateName } from '../../engine/constants';
import { evaluateProspect } from './playerUtils';

/**
 * Generate 20 prospects for the draft (14 position players, 6 pitchers)
 * @returns {Array} Array of prospect objects, sorted by overall value
 */
export const generateProspects = () => {
  const prospects = [];
  for (let i = 0; i < 20; i++) {
    const isPosition = i < 14;
    
    if (isPosition) {
      // Potential is the ceiling (30-95)
      const potential = 30 + Math.floor(Math.random() * 66);
      // Generate stats as 85-95% of potential (allowing for high potential players to start strong)
      const statPct = 0.85 + (Math.random() * 0.1); // 0.85 to 0.95
      
      prospects.push({
        id: `prospect-${Date.now()}-${i}`,
        name: generateName(),
        type: 'position',
        stats: {
          hitting: Math.min(95, Math.floor(potential * statPct) + Math.floor(Math.random() * 3) - 1),
          power: Math.min(95, Math.floor(potential * statPct) + Math.floor(Math.random() * 3) - 1),
          speed: Math.min(95, Math.floor(potential * statPct) + Math.floor(Math.random() * 3) - 1),
          defense: Math.min(95, Math.floor(potential * statPct) + Math.floor(Math.random() * 3) - 1)
        },
        potential: potential
      });
    } else {
      // Potential is the ceiling (30-95)
      const potential = 30 + Math.floor(Math.random() * 66);
      // Generate stats as 85-95% of potential
      const statPct = 0.85 + (Math.random() * 0.1); // 0.85 to 0.95
      
      prospects.push({
        id: `prospect-${Date.now()}-${i}`,
        name: generateName(),
        type: 'pitcher',
        stats: {
          pitching: Math.min(95, Math.floor(potential * statPct) + Math.floor(Math.random() * 3) - 1),
          defense: Math.min(95, Math.floor(potential * statPct) + Math.floor(Math.random() * 3) - 1)
        },
        potential: potential
      });
    }
  }
  // Sort prospects by potential (descending) so better ones appear first in draft
  return prospects.sort((a, b) => {
    if (a.type === 'position' && b.type === 'position') {
      const aOverall = (a.stats.hitting + a.stats.power + a.stats.speed + a.stats.defense) / 4 + (a.potential * 0.3);
      const bOverall = (b.stats.hitting + b.stats.power + b.stats.speed + b.stats.defense) / 4 + (b.potential * 0.3);
      return bOverall - aOverall;
    } else if (a.type === 'pitcher' && b.type === 'pitcher') {
      const aOverall = a.stats.pitching + (a.potential * 0.3);
      const bOverall = b.stats.pitching + (b.potential * 0.3);
      return bOverall - aOverall;
    }
    return 0;
  });
};

