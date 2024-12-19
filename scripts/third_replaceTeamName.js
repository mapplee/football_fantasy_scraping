const fs = require('fs');
const path = require('path');

// Opponent ID to Team Name mapping
const opponentIdToTeamName = {
    "1": "Arsenal",
    "2": "Chelsea",
    "3": "Liverpool",
    "4": "Manchester City",
    "5": "Manchester United",
    "6": "Tottenham",
    "7": "Leicester City",
    "8": "Everton",
    "9": "Wolves",
    "10": "West Ham",
    "11": "Southampton",
    "12": "Crystal Palace",
    "13": "Brighton",
    "14": "Newcastle",
    "15": "Aston Villa",
    "16": "Leeds",
    "17": "Burnley",
    "18": "Sheffield United",
    "19": "Fulham",
    "20": "West Brom"
};

// Input and output folder paths
const inputFolder = './project/Data';
const outputFolder = './Processed';

// Ensure the output folder exists
if (!fs.existsSync(outputFolder)) {
    fs.mkdirSync(outputFolder);
}

// Function to transform opponent IDs to team names
const transformOpponentKeys = (data) => {
    const transformedData = {};
    for (const [key, value] of Object.entries(data)) {
        const teamName = opponentIdToTeamName[key] || key; // Fallback to original key if no mapping found
        transformedData[teamName] = value;
    }
    return transformedData;
};

// Function to process JSON data
const processJson = (data) => {
    const updatedData = {};

    for (const [player, stats] of Object.entries(data)) {
        updatedData[player] = {
            total_points_by_opponent: transformOpponentKeys(stats.total_points_by_opponent || {}),
            games_played_by_opponent: transformOpponentKeys(stats.games_played_by_opponent || {}),
            was_home_counts_by_opponent: transformOpponentKeys(stats.was_home_counts_by_opponent || {}),
            total_home_points_by_opponent: transformOpponentKeys(stats.total_home_points_by_opponent || {})
        };
    }

    return updatedData;
};

// Process all JSON files in the input folder
fs.readdir(inputFolder, (err, files) => {
    if (err) {
        console.error('Error reading input folder:', err);
        return;
    }

    files.forEach((file) => {
        const inputFilePath = path.join(inputFolder, file);

        // Only process .json files
        if (path.extname(file) === '.json') {
            fs.readFile(inputFilePath, 'utf-8', (err, data) => {
                if (err) {
                    console.error(`Error reading file ${file}:`, err);
                    return;
                }

                try {
                    const jsonData = JSON.parse(data);
                    const processedData = processJson(jsonData);

                    const outputFilePath = path.join(
                        outputFolder,
                        file.replace('.json', '_processed.json')
                    );

                    fs.writeFile(
                        outputFilePath,
                        JSON.stringify(processedData, null, 2),
                        (err) => {
                            if (err) {
                                console.error(`Error writing file ${outputFilePath}:`, err);
                            } else {
                                console.log(`Processed file saved: ${outputFilePath}`);
                            }
                        }
                    );
                } catch (parseError) {
                    console.error(`Error parsing JSON in file ${file}:`, parseError);
                }
            });
        }
    });
});
