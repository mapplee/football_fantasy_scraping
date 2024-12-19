const fs = require('fs');
const path = require('path');

/**
 * Reformats a JSON object by keeping only the required fields.
 */
function reformatJson(data) {
    return data.map(item => {
        return {
            GW: item.GW || null, // Add GW if available, else null
            name: item.name || null,
            team: item.team || null,
            total_points: item.total_points || null,
            opponent_team: item.opponent_team || null,
            was_home: item.was_home || null
        };
    });
}

/**
 * Recursively processes all folders and reformats JSON files in `gws_output`.
 */
function processFolders(baseFolder) {
    fs.readdir(baseFolder, { withFileTypes: true }, (err, entries) => {
        if (err) {
            console.error(`Error reading folder ${baseFolder}:`, err);
            return;
        }

        entries.forEach(entry => {
            const fullPath = path.join(baseFolder, entry.name);

            if (entry.isDirectory()) {
                if (entry.name === 'gws_output') {
                    reformatJsonFiles(fullPath);
                } else {
                    processFolders(fullPath); // Recursively process subfolders
                }
            }
        });
    });
}

/**
 * Reformats all JSON files in the `gws_output` folder.
 */
function reformatJsonFiles(outputFolderPath) {
    fs.readdir(outputFolderPath, (err, files) => {
        if (err) {
            console.error(`Error reading folder ${outputFolderPath}:`, err);
            return;
        }

        files.forEach(file => {
            const filePath = path.join(outputFolderPath, file);

            if (path.extname(file).toLowerCase() === '.json') {
                fs.readFile(filePath, 'utf-8', (err, data) => {
                    if (err) {
                        console.error(`Error reading file ${filePath}:`, err);
                        return;
                    }

                    try {
                        const jsonData = JSON.parse(data);
                        const reformattedData = reformatJson(jsonData);

                        // Overwrite the file with the reformatted JSON
                        fs.writeFile(filePath, JSON.stringify(reformattedData, null, 4), err => {
                            if (err) {
                                console.error(`Error writing file ${filePath}:`, err);
                            } else {
                                console.log(`Reformatted JSON file: ${filePath}`);
                            }
                        });
                    } catch (parseErr) {
                        console.error(`Error parsing JSON file ${filePath}:`, parseErr);
                    }
                });
            }
        });
    });
}

// Entry point: Process the entire `project` folder
const baseFolder = path.join(__dirname, 'project'); // Adjust if needed
processFolders(baseFolder);
