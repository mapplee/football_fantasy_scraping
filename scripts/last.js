const fs = require('fs');
const path = require('path');

// Load the data from the JSON file
const dataPath = path.join(__dirname, 'merged_seasons_data.json');
const rawData = fs.readFileSync(dataPath, 'utf8');
const playerData = JSON.parse(rawData);

const result = [];

for (const [playerInfo, details] of Object.entries(playerData)) {
  // Extract player name and team name
  const [playerName, teamNameWithBracket] = playerInfo.split(' (');
  const teamName = teamNameWithBracket.replace(')', '');

  // Iterate over opponents
  for (const opponent in details.total_points_season_by_opponent_in_3season) {
    const totalPoints = details.total_points_season_by_opponent_in_3season[opponent] || 0;

    const homeCounts = details.was_home_counts_by_opponent_in_3season[opponent] || {};
    const totalHomePlayed = homeCounts['true'] || 0;
    const totalAwayPlayed = homeCounts['false'] || 0;

    const totalHomePoints = details.total_home_point_by_opponent_in_3season[opponent] || 0;
    const totalAwayPoints = totalPoints - totalHomePoints;

    // Add the processed row to the result
    result.push({
      player_name: playerName,
      team_name: teamName,
      opponent_team_name: opponent,
      total_points: totalPoints,
      total_home_played: totalHomePlayed,
      total_away_played: totalAwayPlayed,
      total_home_points: totalHomePoints,
      total_away_points: totalAwayPoints,
    });
  }
}

// Write the result to a JSON file
const jsonOutputPath = path.join(__dirname, 'processed_player_data.json');
fs.writeFileSync(jsonOutputPath, JSON.stringify(result, null, 2));
console.log(`Processed data written to JSON: ${jsonOutputPath}`);

// Write the result to a CSV file
const csvHeaders = [
  'player_name',
  'team_name',
  'opponent_team_name',
  'total_points',
  'total_home_played',
  'total_away_played',
  'total_home_points',
  'total_away_points',
];
const csvRows = [
  csvHeaders.join(','), // Header row
  ...result.map(row =>
    csvHeaders.map(header => row[header]).join(',')
  ),
];
const csvOutputPath = path.join(__dirname, 'processed_player_data.csv');
fs.writeFileSync(csvOutputPath, csvRows.join('\n'));
console.log(`Processed data written to CSV: ${csvOutputPath}`);

