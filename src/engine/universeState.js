import { TEAM_CONFIGS, POSITION_TRAITS, PITCHER_TRAITS } from './constants';

// ============================================================================
// UNIVERSE STATE - The shared world across all modes
// ============================================================================

const generateName = () => {
  const FIRST_NAMES = ['Jack', 'Mike', 'Carlos', 'David', 'Jose', 'Alex', 'Ryan', 'Kevin', 'Luis', 'Matt', 'Chris', 'John', 'Tyler', 'Brandon', 'Marcus', 'Victor', 'Derek', 'Josh', 'Nick', 'Dan', 'Tony', 'Jake', 'Sam', 'Eric', 'Ben'];
  const LAST_NAMES = ['Rodriguez', 'Martinez', 'Johnson', 'Williams', 'Garcia', 'Brown', 'Davis', 'Miller', 'Wilson', 'Moore', 'Taylor', 'Anderson', 'Thomas', 'Jackson', 'White', 'Harris', 'Martin', 'Thompson', 'Lee', 'Walker', 'Hall', 'Allen', 'Young', 'King', 'Wright', 'Lopez', 'Hill', 'Scott', 'Green', 'Adams'];
  
  const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
  const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
  return `${first} ${last}`;
};

export class UniverseState {
  constructor() {
    this.league = [];
    this.currentYear = 2025;
    this.generateLeague();
  }

  generateLeague() {
    this.league = TEAM_CONFIGS.map(config => {
      const targetStats = {
        hitting: 55 + Math.floor(Math.random() * 20),
        power: 55 + Math.floor(Math.random() * 20),
        speed: 55 + Math.floor(Math.random() * 20),
        defense: 55 + Math.floor(Math.random() * 20),
        pitching: 55 + Math.floor(Math.random() * 20)
      };

      const roster = [];

      // 9 position players
      for (let i = 0; i < 9; i++) {
        const variance = () => Math.floor(Math.random() * 20) - 10;
        roster.push({
          name: generateName(),
          type: 'position',
          stats: {
            hitting: Math.max(30, Math.min(95, targetStats.hitting + variance())),
            power: Math.max(30, Math.min(95, targetStats.power + variance())),
            speed: Math.max(30, Math.min(95, targetStats.speed + variance())),
            defense: Math.max(30, Math.min(95, targetStats.defense + variance()))
          },
          trait: Math.random() > 0.7 ? POSITION_TRAITS[Math.floor(Math.random() * POSITION_TRAITS.length)] : null,
          age: 22 + Math.floor(Math.random() * 15),
          careerStats: { games: 0, atBats: 0, hits: 0, homeRuns: 0 }
        });
      }

      // 5 pitchers
      for (let i = 0; i < 5; i++) {
        const variance = () => Math.floor(Math.random() * 20) - 10;
        roster.push({
          name: generateName(),
          type: 'pitcher',
          stats: {
            pitching: Math.max(30, Math.min(95, targetStats.pitching + variance())),
            defense: Math.max(30, Math.min(95, targetStats.defense + variance()))
          },
          trait: Math.random() > 0.7 ? PITCHER_TRAITS[Math.floor(Math.random() * PITCHER_TRAITS.length)] : null,
          age: 22 + Math.floor(Math.random() * 15),
          careerStats: { games: 0, atBats: 0, hits: 0, homeRuns: 0 }
        });
      }

      return {
        ...config,
        roster,
        record: { wins: 0, losses: 0 }
      };
    });
  }

  getTeam(name) {
    return this.league.find(t => t.name === name);
  }

  getStandings() {
    return [...this.league].sort((a, b) => {
      const aTotal = a.record.wins + a.record.losses;
      const bTotal = b.record.wins + b.record.losses;
      const aPct = aTotal === 0 ? 0 : a.record.wins / aTotal;
      const bPct = bTotal === 0 ? 0 : b.record.wins / bTotal;
      return bPct - aPct;
    });
  }

  recordGame(winnerName, loserName) {
    const winner = this.getTeam(winnerName);
    const loser = this.getTeam(loserName);
    if (winner && loser) {
      winner.record.wins++;
      loser.record.losses++;
    }
  }

  regenerate() {
    this.generateLeague();
  }
}