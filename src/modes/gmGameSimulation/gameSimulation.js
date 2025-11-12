// ============================================================================
// GAME SIMULATION LOGIC
// ============================================================================

import { calculateTeamStrength } from './teamStrength';

/**
 * Run a single game simulation between two teams
 * @param {Object} team1 - First team
 * @param {Object} team2 - Second team
 * @param {number|null} team1PitcherIndex - Starting pitcher index for team1
 * @param {number|null} team2PitcherIndex - Starting pitcher index for team2
 * @param {Object} lineup - Lineup object (for team1 if it's player's team)
 * @param {Object} myTeam - Player's team object (for lineup comparison)
 * @returns {Object} Game result with team1Score and team2Score
 */
export const runSingleSimulation = (team1, team2, team1PitcherIndex = null, team2PitcherIndex = null, lineup = null, myTeam = null) => {
  const team1Offense = calculateTeamStrength(team1, true, null, lineup, myTeam);
  const team1Defense = calculateTeamStrength(team1, false, team1PitcherIndex, lineup, myTeam);
  const team2Offense = calculateTeamStrength(team2, true, null, null, null);
  const team2Defense = calculateTeamStrength(team2, false, team2PitcherIndex, null, null);
  
  // Realistic baseball scoring: base 3 runs + team difference + small randomness
  let team1Score = Math.max(0, Math.floor(
    3 + (team1Offense - team2Defense) / 35 + (Math.random() * 4 - 2)
  ));
  let team2Score = Math.max(0, Math.floor(
    3 + (team2Offense - team1Defense) / 35 + (Math.random() * 4 - 2)
  ));
  
  // Tie-breaker: Use pitching stats to determine winner
  if (team1Score === team2Score) {
    const team1Pitching = team1.roster
      .filter(p => p.type === 'pitcher')
      .reduce((sum, p) => sum + p.stats.pitching, 0);
    const team2Pitching = team2.roster
      .filter(p => p.type === 'pitcher')
      .reduce((sum, p) => sum + p.stats.pitching, 0);
    
    if (team1Pitching > team2Pitching) {
      team1Score++;
    } else if (team2Pitching > team1Pitching) {
      team2Score++;
    } else {
      // Ultra-rare: random winner if pitching also tied
      Math.random() > 0.5 ? team1Score++ : team2Score++;
    }
  }
  
  return { team1Score, team2Score };
};

/**
 * Generate player performance string for display
 * @param {Object} player - Player object
 * @returns {string} Performance description string
 */
export const generatePlayerPerformance = (player) => {
  if (player.type === 'position') {
    const hits = Math.floor(Math.random() * 4) + 1; // 1-4 hits
    const atBats = Math.floor(Math.random() * 2) + 3; // 3-4 at bats
    const rbi = Math.floor(Math.random() * 4); // 0-3 RBI
    const homeRuns = Math.random() > 0.7 ? 1 : 0; // 30% chance of HR
    return `${hits}-for-${atBats}, ${rbi} RBI${homeRuns ? ', 1 HR' : ''}`;
  } else {
    const innings = Math.floor(Math.random() * 3) + 6; // 6-8 innings
    const strikeouts = Math.floor(Math.random() * 6) + 3; // 3-8 K
    const earnedRuns = Math.floor(Math.random() * 4); // 0-3 ER
    return `${innings} IP, ${strikeouts} K, ${earnedRuns} ER`;
  }
};

/**
 * Simulate all scheduled games for a round and return player's matchup
 * @param {number} currentRound - Current round index
 * @param {Object} season - Season state object
 * @param {Object} universe - Universe state object
 * @param {Object} myTeam - Player's team object
 * @returns {Object|null} Player's matchup object or null if not found
 */
export const simulateScheduledGames = (currentRound, season, universe, myTeam) => {
  // Get all 4 matchups for this round from the schedule
  const roundMatchups = season.schedule[currentRound];
  
  if (!roundMatchups) {
    console.error('No matchups found for round', currentRound);
    return null;
  }
  
  // Find which matchup includes the player's team
  const myTeamIndex = universe.league.findIndex(t => t.name === myTeam.name);
  let playerMatchup = null;
  
  // Simulate all 4 games in this round
  roundMatchups.forEach(([team1Idx, team2Idx]) => {
    const team1 = universe.league[team1Idx];
    const team2 = universe.league[team2Idx];
    
    // Skip player's matchup for now, we'll return it
    if (team1Idx === myTeamIndex || team2Idx === myTeamIndex) {
      playerMatchup = { team1, team2, team1Idx, team2Idx };
      return;
    }
    
    // CPU vs CPU game: each team rotates their pitchers
    // Calculate rotation index for each CPU team based on game number
    const team1PitcherIndex = currentRound % 5; // 0-4 rotation
    const team2PitcherIndex = currentRound % 5;
    
    // Simulate CPU vs CPU game with pitcher rotation
    const result = runSingleSimulation(team1, team2, team1PitcherIndex, team2PitcherIndex);
    
    if (result.team1Score > result.team2Score) {
      universe.recordGame(team1.name, team2.name);
    } else {
      universe.recordGame(team2.name, team1.name);
    }
  });
  
  return playerMatchup;
};

/**
 * Simulate a fully automated playoff game (CPU vs CPU)
 * @param {Object} team1 - First team
 * @param {Object} team2 - Second team
 * @returns {Object} Game result with team1Score and team2Score
 */
export const simulatePlayoffGame = (team1, team2) => {
  // Use random pitcher indices for both teams (0-4)
  const team1PitcherIndex = Math.floor(Math.random() * 5);
  const team2PitcherIndex = Math.floor(Math.random() * 5);
  
  // Fully automated - no lineup, no myTeam reference
  return runSingleSimulation(team1, team2, team1PitcherIndex, team2PitcherIndex, null, null);
};

