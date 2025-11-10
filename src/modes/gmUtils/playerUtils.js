// ============================================================================
// PLAYER UTILITIES
// ============================================================================

/**
 * Calculate projected season stats for a player
 * @param {Object} player - Player object with stats
 * @returns {Object} Projected stats object
 */
export const calculateSeasonStats = (player) => {
  const atBats = 80; // 4 AB × 20 games
  const avgPct = (player.stats.hitting / 100);
  const hits = Math.floor(atBats * avgPct);
  const hrRate = (player.stats.power / 100) * 0.15;
  const homeRuns = Math.floor(atBats * hrRate);
  const stolenBases = Math.floor((player.stats.speed / 100) * 20);
  
  return { atBats, hits, homeRuns, stolenBases, avg: (hits / atBats).toFixed(3) };
};

/**
 * Format stat change display (shows current value and change from previous)
 * @param {number} current - Current stat value
 * @param {number} previous - Previous stat value (optional)
 * @returns {string} Formatted string like "75 (+5)" or "70 (-3)"
 */
export const formatStatChange = (current, previous) => {
  if (!previous) return current.toString();
  const change = current - previous;
  if (change > 0) return `${current} (+${change})`;
  if (change < 0) return `${current} (${change})`;
  return `${current} (=)`;
};

/**
 * Evaluate prospect value for sorting/comparison
 * @param {Object} player - Player/prospect object
 * @returns {number} Evaluation score
 */
export const evaluateProspect = (player) => {
  if (player.type === 'position') {
    return (player.stats.hitting + player.stats.power + player.stats.speed + player.stats.defense) / 4 + (player.potential * 0.3);
  } else {
    return player.stats.pitching + (player.potential * 0.3);
  }
};

/**
 * Adjust player stats for new season (aging system)
 * @param {Object} universe - Universe state object
 */
export const adjustPlayerStatsForNewSeason = (universe) => {
  universe.league.forEach(team => {
    team.roster.forEach(player => {
      // Save previous year's stats before modifying
      if (player.type === 'position') {
        player.previousYearStats = {
          hitting: player.stats.hitting,
          power: player.stats.power,
          speed: player.stats.speed,
          defense: player.stats.defense
        };
      } else {
        player.previousYearStats = {
          pitching: player.stats.pitching,
          defense: player.stats.defense
        };
      }
      
      // Also save previous stats for minor league prospects
      (team.minorLeague || []).forEach(prospect => {
        if (prospect.type === 'position') {
          prospect.previousYearStats = {
            hitting: prospect.stats.hitting,
            power: prospect.stats.power,
            speed: prospect.stats.speed,
            defense: prospect.stats.defense
          };
        } else {
          prospect.previousYearStats = {
            pitching: prospect.stats.pitching,
            defense: prospect.stats.defense
          };
        }
      });
      
      // Age player by 1 year
      player.age = (player.age || 22) + 1;
      
      // Determine adjustment percentage based on age
      let adjustmentPct = (Math.random() * 6 - 3) / 100; // -3% to +3% base
      
      // If over 32, much higher chance of negative adjustment
      if (player.age > 32) {
        // 70% chance of negative, 30% chance of positive (but smaller)
        if (Math.random() < 0.7) {
          adjustmentPct = -(Math.random() * 3 + 1) / 100; // -1% to -4%
        } else {
          adjustmentPct = (Math.random() * 2) / 100; // 0% to +2% (smaller gains)
        }
      } else if (player.age <= 28 && player.potential) {
        // Younger players with potential have higher chance of growth
        // If stats are below potential, more likely to grow
        const currentOverall = player.type === 'position'
          ? (player.stats.hitting + player.stats.power + player.stats.speed + player.stats.defense) / 4
          : player.stats.pitching;
        
        if (currentOverall < player.potential) {
          // Higher chance of positive growth when below potential
          adjustmentPct = (Math.random() * 4) / 100; // 0% to +4%
        }
      }
      
      // Apply adjustments to all stats
      if (player.type === 'position') {
        player.stats.hitting = Math.max(30, Math.min(95, Math.round(player.stats.hitting * (1 + adjustmentPct))));
        player.stats.power = Math.max(30, Math.min(95, Math.round(player.stats.power * (1 + adjustmentPct))));
        player.stats.speed = Math.max(30, Math.min(95, Math.round(player.stats.speed * (1 + adjustmentPct))));
        player.stats.defense = Math.max(30, Math.min(95, Math.round(player.stats.defense * (1 + adjustmentPct))));
      } else {
        player.stats.pitching = Math.max(30, Math.min(95, Math.round(player.stats.pitching * (1 + adjustmentPct))));
        player.stats.defense = Math.max(30, Math.min(95, Math.round(player.stats.defense * (1 + adjustmentPct))));
      }
    });
  });
};

