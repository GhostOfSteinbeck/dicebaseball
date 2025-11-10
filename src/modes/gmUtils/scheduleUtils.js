// ============================================================================
// SCHEDULE UTILITIES
// ============================================================================

/**
 * Generate full league schedule using round-robin method
 * Each team plays exactly 20 games (20 rounds × 4 matchups per round)
 * @returns {Array} Array of rounds, each round contains 4 matchup pairs [team1Idx, team2Idx]
 */
export const generateFullLeagueSchedule = () => {
  // Round-robin scheduling for 8 teams
  // Each round has 4 matchups (all 8 teams play)
  // 20 rounds total = 20 games per team
  const schedule = [];
  const teams = [0, 1, 2, 3, 4, 5, 6, 7];
  
  // Use circle method for round-robin
  // Fix one team (team 0), rotate others
  for (let round = 0; round < 20; round++) {
    const roundMatches = [];
    const rotated = [...teams];
    
    // Rotate teams (keep index 0 fixed, rotate 1-7)
    if (round > 0) {
      const toRotate = rotated.slice(1);
      for (let i = 0; i < round % 7; i++) {
        toRotate.unshift(toRotate.pop());
      }
      rotated.splice(1, 7, ...toRotate);
    }
    
    // Create 4 matchups for this round
    // Pair teams: 0-7, 1-6, 2-5, 3-4
    for (let i = 0; i < 4; i++) {
      roundMatches.push([rotated[i], rotated[7 - i]]);
    }
    
    schedule.push(roundMatches);
  }
  
  return schedule;
};

