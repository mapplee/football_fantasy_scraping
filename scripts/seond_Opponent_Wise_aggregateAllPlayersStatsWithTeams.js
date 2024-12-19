const fs = require('fs');
const path = require('path');

/**
 * Aggregates player stats, ensuring uniqueness by combining name and team.
 */
function aggregateAllPlayerStats(data) {
    const playerSummaries = {};

    data.forEach(item => {
        const playerKey = `${item.name} (${item.team})`; // Unique key: name + team

        // Initialize player data if not already present
        if (!playerSummaries[playerKey]) {
            playerSummaries[playerKey] = {
                total_points_by_opponent: {},
                games_played_by_opponent: {},
                was_home_counts_by_opponent: {},  // Tracking by opponent_team
                total_home_points_by_opponent: {} // Total home points by opponent
            };
        }

        const summary = playerSummaries[playerKey];
        const opponentTeam = item.opponent_team;
        const points = parseInt(item.total_points) || 0;
        const wasHome = item.was_home === "True";

        // Total points by opponent
        if (!summary.total_points_by_opponent[opponentTeam]) {
            summary.total_points_by_opponent[opponentTeam] = 0;
        }
        summary.total_points_by_opponent[opponentTeam] += points;

        // Games played by opponent
        if (!summary.games_played_by_opponent[opponentTeam]) {
            summary.games_played_by_opponent[opponentTeam] = 0;
        }
        summary.games_played_by_opponent[opponentTeam] += 1;

        // Count was_home by opponent_team
        if (!summary.was_home_counts_by_opponent[opponentTeam]) {
            summary.was_home_counts_by_opponent[opponentTeam] = {
                true: 0,
                false: 0
            };
        }
        summary.was_home_counts_by_opponent[opponentTeam][wasHome ? 'true' : 'false'] += 1;

        // Total home points by opponent
        if (wasHome) {
            if (!summary.total_home_points_by_opponent[opponentTeam]) {
                summary.total_home_points_by_opponent[opponentTeam] = 0;
            }
            summary.total_home_points_by_opponent[opponentTeam] += points;
        }
    });

    return playerSummaries;
}

/**
 * Reads JSON file, aggregates stats, and saves output JSON.
 */
function processJsonFile(inputFilePath, outputFilePath) {
    fs.readFile(inputFilePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Error reading file ${inputFilePath}:`, err);
            return;
        }

        try {
            const jsonData = JSON.parse(data);
            console.log(`JSON file successfully read: ${inputFilePath}`);

            // Aggregate data
            const aggregatedData = aggregateAllPlayerStats(jsonData);

            // Save aggregated data to JSON
            fs.writeFile(outputFilePath, JSON.stringify(aggregatedData, null, 4), (err) => {
                if (err) {
                    console.error(`Error writing output file ${outputFilePath}:`, err);
                } else {
                    console.log(`Aggregated stats saved to ${outputFilePath}`);
                }
            });
        } catch (parseError) {
            console.error(`Error parsing JSON file ${inputFilePath}:`, parseError);
        }
    });
}

/**
 * Processes all merged_gw.json files in the project folder structure.
 */
function processAllJsonFiles(basePath) {
    const years = ['2022-23', '2023-24','2024-25']; // Year folders

    years.forEach(year => {
        const gwsPath = path.join(basePath, year, 'gws', 'gws_output');
        const inputFilePath = path.join(gwsPath, 'merged_gw.json');
        const outputFilePath = path.join(gwsPath, 'allPlayersStats.json');

        // Check if the merged_gw.json exists in the folder before processing
        if (fs.existsSync(inputFilePath)) {
            processJsonFile(inputFilePath, outputFilePath);
        } else {
            console.log(`File not found: ${inputFilePath}`);
        }
    });
}

// Entry point
const projectBasePath = path.join(__dirname, 'project'); // Base project directory
processAllJsonFiles(projectBasePath);
