// compare.js
//
// Runs both solve() and solveBFS() on the same maze and reports how
// many cells each one had to visit, plus the path length each found.
//
// Usage: node compare.js maze.txt
//
// "Steps" here means cells actually explored, not the length of the
// final path — a maze can have a short path but still cost a search
// a lot of visited cells if it has to check other branches first.

const { loadMaze } = require("./maze");
const { solve, solveBFS, resetCounts, getDFSCount, getBFSCount } = require("./solver");

const filePath = process.argv[2];

if (!filePath) {
    console.error("Usage: node compare.js maze.txt");
    process.exit(1);
}

try {
    const { grid, start, end } = loadMaze(filePath);

    resetCounts();

    const visited = grid.map(row => row.map(() => false));
    const dfsPath = solve(grid, visited, start, end);
    const dfsSteps = getDFSCount();

    const bfsPath = solveBFS(grid, start, end);
    const bfsSteps = getBFSCount();

    console.log(`DFS (recursive backtracking): ${dfsPath ? `path length ${dfsPath.length}` : "no path"}, ${dfsSteps} cells visited`);
    console.log(`BFS (queue):                  ${bfsPath ? `path length ${bfsPath.length}` : "no path"}, ${bfsSteps} cells visited`);

    if (dfsPath && bfsPath) {
        console.log(`\nBFS is guaranteed to find the shortest path; DFS just finds a path.`);
        if (dfsPath.length > bfsPath.length) {
            console.log(`Here, DFS's path was ${dfsPath.length - bfsPath.length} cell(s) longer than BFS's.`);
        } else {
            console.log(`Here, they happened to find equally short paths.`);
        }
    }
} catch (err) {
    console.error(err.message);
    process.exit(1);
}
