const fs = require('fs');
const path = require('path');

// Function to read and parse JSON file
function readJsonFile(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

// Function to merge data across seasons
function mergeData(files) {
  const mergedData = {};

  // Loop through each file (season)
  files.forEach((file) => {
    const seasonData = readJsonFile(file);

    // Iterate through each player in the season
    for (const player in seasonData) {
      if (!mergedData[player]) {
        mergedData[player] = {
          total_points_season_by_opponent_in_3season: {},
          games_played_by_opponent_in_3season: {},
          was_home_counts_by_opponent_in_3season: {},
          total_home_point_by_opponent_in_3season: {} // New field
        };
      }

      // Merge total_points_by_opponent
      for (const opponent in seasonData[player].total_points_by_opponent) {
        mergedData[player].total_points_season_by_opponent_in_3season[opponent] = 
          (mergedData[player].total_points_season_by_opponent_in_3season[opponent] || 0) +
          seasonData[player].total_points_by_opponent[opponent];
      }

      // Merge games_played_by_opponent
      for (const opponent in seasonData[player].games_played_by_opponent) {
        mergedData[player].games_played_by_opponent_in_3season[opponent] = 
          (mergedData[player].games_played_by_opponent_in_3season[opponent] || 0) +
          seasonData[player].games_played_by_opponent[opponent];
      }

      // Merge was_home_counts_by_opponent
      for (const opponent in seasonData[player].was_home_counts_by_opponent) {
        if (!mergedData[player].was_home_counts_by_opponent_in_3season[opponent]) {
          mergedData[player].was_home_counts_by_opponent_in_3season[opponent] = {
            true: 0,
            false: 0
          };
        }
        mergedData[player].was_home_counts_by_opponent_in_3season[opponent].true += 
          seasonData[player].was_home_counts_by_opponent[opponent].true || 0;
        mergedData[player].was_home_counts_by_opponent_in_3season[opponent].false += 
          seasonData[player].was_home_counts_by_opponent[opponent].false || 0;
      }

      // Merge total_home_points_by_opponent
      for (const opponent in seasonData[player].total_home_points_by_opponent) {
        mergedData[player].total_home_point_by_opponent_in_3season[opponent] = 
          (mergedData[player].total_home_point_by_opponent_in_3season[opponent] || 0) +
          seasonData[player].total_home_points_by_opponent[opponent];
      }
    }
  });

  return mergedData;
}

// Define the relative path to the previous folder
const previousFolderPath = '/home/telcobright/Desktop/Upwork/Processed';
// List of input files in the previous folder
const inputFiles = [
  path.join(previousFolderPath, '2022-23_processed.json'),
  path.join(previousFolderPath, '2023-24_processed.json'),
  path.join(previousFolderPath, '2024-25_processed.json')
];

// Perform the merge operation
const mergedData = mergeData(inputFiles);

// Output the merged data to a new file in the current folder
fs.writeFileSync(path.join(__dirname, 'merged_seasons_data.json'), JSON.stringify(mergedData, null, 2), 'utf8');

console.log('Data merged successfully into "merged_seasons_data.json"');
