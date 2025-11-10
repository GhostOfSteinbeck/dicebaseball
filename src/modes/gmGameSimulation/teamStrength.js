// ============================================================================
// TEAM STRENGTH CALCULATION
// ============================================================================

/**
 * Get position defense bonus for a given position
 * @param {string} position - Position abbreviation (C, 1B, 2B, etc.)
 * @returns {number} Defense bonus value
 */
export const getPositionDefenseBonus = (position) => {
  const bonuses = {
    'C': 3, 'SS': 3, 'CF': 3,  // Premium defense positions
    '2B': 2, '3B': 2, 'RF': 2,  // Medium defense
    '1B': 1, 'LF': 1, 'DH': 0   // Low defense
  };
  return bonuses[position] || 0;
};

/**
 * Calculate team strength for offense or defense
 * @param {Object} team - Team object
 * @param {boolean} isOffense - True for offense calculation, false for defense
 * @param {number|null} startingPitcherIndex - Index of starting pitcher (0-4)
 * @param {Object} lineup - Lineup object mapping positions to players
 * @param {Object} myTeam - Player's team object (for lineup comparison)
 * @returns {number} Team strength score
 */
export const calculateTeamStrength = (team, isOffense, startingPitcherIndex = null, lineup = null, myTeam = null) => {
  const positionPlayers = team.roster.filter(p => p.type === 'position');
  const pitchers = team.roster.filter(p => p.type === 'pitcher');
  
  if (isOffense) {
    // Offense: hitting + power + speed
    const offenseStats = positionPlayers.reduce((sum, p) => 
      sum + p.stats.hitting + p.stats.power + (p.stats.speed * 0.5), 0
    );
    return offenseStats / positionPlayers.length;
  } else {
    // Defense: team defense + pitcher + position bonuses
    const fieldingDefense = positionPlayers.reduce((sum, p) => sum + p.stats.defense, 0) / positionPlayers.length;
    
    // Use starting pitcher for this game (rotate through 5 pitchers)
    let pitchingDefense;
    if (startingPitcherIndex !== null && myTeam && team.name === myTeam.name && pitchers[startingPitcherIndex]) {
      // Player's team: use rotation
      pitchingDefense = pitchers[startingPitcherIndex].stats.pitching;
    } else if (myTeam && team.name !== myTeam.name && startingPitcherIndex !== null && pitchers[startingPitcherIndex]) {
      // CPU team: also rotate (use same index)
      pitchingDefense = pitchers[startingPitcherIndex].stats.pitching;
    } else {
      // Fallback: average if rotation not set
      pitchingDefense = pitchers.reduce((sum, p) => sum + p.stats.pitching, 0) / pitchers.length;
    }
    
    // Position bonuses (if lineup is set, use those positions)
    let positionBonus = 0;
    if (lineup && myTeam && team.name === myTeam.name) {
      Object.entries(lineup).forEach(([pos, player]) => {
        if (player) positionBonus += getPositionDefenseBonus(pos);
      });
    } else {
      positionBonus = 10; // Average for CPU teams
    }
    
    return (fieldingDefense * 0.3) + (pitchingDefense * 0.6) + positionBonus;
  }
};

