const { loadMaze } = require("./maze");
const { solve } = require("./solver");

const filePath = process.argv[2];

if (!filePath) {
    console.error("Please provide a maze file.");
    process.exit(1);
}

try {
    const { grid, start, end } = loadMaze(filePath);

    const visited = grid.map(row => row.map(() => false));

    const path = solve(grid, visited, start, end);

    if (path === null) {
        console.log("No path exists.");
        process.exit(0);
    }

    for (const { row, col } of path) {
        if (grid[row][col] !== "S" && grid[row][col] !== "E") {
            grid[row][col] = "*";
        }
    }

    for (const row of grid) {
        console.log(row.join(""));
    }
} catch (error) {
    console.error(error.message);
    process.exit(1);
}
