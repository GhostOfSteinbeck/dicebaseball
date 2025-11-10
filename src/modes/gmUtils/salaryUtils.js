// ============================================================================
// SALARY UTILITIES
// ============================================================================

/**
 * Calculate player salary based on stats
 * @param {Object} player - Player object with stats
 * @returns {string} Salary tier: $, $$, $$$, or $$$$
 */
export const calculateSalary = (player) => {
  if (player.type === 'pitcher') {
    const rating = player.stats.pitching;
    if (rating >= 75) return '$$$$';
    if (rating >= 65) return '$$$';
    if (rating >= 55) return '$$';
    return '$';
  } else {
    const overall = (player.stats.hitting + player.stats.power + player.stats.speed + player.stats.defense) / 4;
    if (overall >= 75) return '$$$$';
    if (overall >= 65) return '$$$';
    if (overall >= 55) return '$$';
    return '$';
  }
};

/**
 * Convert salary string to numeric value (in millions)
 * @param {string} salary - Salary tier string
 * @returns {number} Numeric value (1-4)
 */
export const salaryToValue = (salary) => {
  if (salary === '$$$$') return 4;
  if (salary === '$$$') return 3;
  if (salary === '$$') return 2;
  return 1; // $
};

/**
 * Calculate total roster cost for a team
 * @param {Object} team - Team object with roster
 * @returns {number} Total cost in millions
 */
export const calculateRosterCost = (team) => {
  return team.roster.reduce((total, player) => {
    const salary = player.salary || calculateSalary(player);
    return total + salaryToValue(salary);
  }, 0);
};

/**
 * Enforce salary cap - drop highest salaried players until under cap
 * @param {Object} team - Team object
 * @returns {Array} Array of dropped players
 */
export const enforceSalaryCap = (team) => {
  const droppedPlayers = [];
  let rosterCost = calculateRosterCost(team);
  
  while (rosterCost > team.salaryCap && team.roster.length > 0) {
    // Sort roster by salary (highest first) and drop the highest paid player
    const sortedRoster = [...team.roster].sort((a, b) => {
      const aSalary = a.salary || calculateSalary(a);
      const bSalary = b.salary || calculateSalary(b);
      return salaryToValue(bSalary) - salaryToValue(aSalary);
    });
    
    const playerToDrop = sortedRoster[0];
    team.roster = team.roster.filter(p => p.id !== playerToDrop.id);
    droppedPlayers.push(playerToDrop);
    rosterCost = calculateRosterCost(team);
  }
  
  return droppedPlayers;
};

