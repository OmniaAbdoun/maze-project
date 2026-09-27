const DIRECTIONS = [
    { dr: -1, dc: 0 }, // up
    { dr: 1, dc: 0 },  // down
    { dr: 0, dc: -1 }, // left
    { dr: 0, dc: 1 },  // right
];

// Two separate counters, one per algorithm, so running both in the
// same script (which is the whole point of comparing them) doesn't
// let one bleed into the other. resetCounts() lets you zero them
// between runs on different mazes too.
let dfsCount = 0;
let bfsCount = 0;

function resetCounts() {
    dfsCount = 0;
    bfsCount = 0;
}

// =========================
// DFS - Recursive Solver
// =========================
function solve(grid, visited, current, end) {
    // 1. Out of bounds
    if (
        current.row < 0 ||
        current.row >= grid.length ||
        current.col < 0 ||
        current.col >= grid[0].length
    ) {
        return null;
    }

    // 2. Wall
    if (grid[current.row][current.col] === "#") {
        return null;
    }

    // 3. Already visited
    if (visited[current.row][current.col]) {
        return null;
    }

    // Only count it once it's passed all three checks above — this
    // is a cell actually being explored, not a call that bounced
    // straight back. That's what makes it comparable to BFS's count
    // below, which only ever sees cells that already cleared the
    // same checks.
    dfsCount++;

    // 4. Reached the end
    if (
        current.row === end.row &&
        current.col === end.col
    ) {
        return [current];
    }

    // Mark current cell as visited
    visited[current.row][current.col] = true;

    // Try each direction
    for (const { dr, dc } of DIRECTIONS) {
        const next = {
            row: current.row + dr,
            col: current.col + dc
        };

        const result = solve(grid, visited, next, end);

        if (result !== null) {
            return [current, ...result];
        }
    }

    // No direction worked
    return null;
}

// =========================
// BFS - Queue Solver
// =========================
function solveBFS(grid, start, end) {
    // Queue starts with S
    const queue = [start];

    // Keep track of visited cells
    const visited = grid.map(row => row.map(() => false));

    // Remember where each cell came from
    const parent = new Map();

    // Mark S as visited
    visited[start.row][start.col] = true;

    // Continue while there are cells in the queue
    while (queue.length > 0) {
        bfsCount++;

        // Take the FIRST cell from the queue
        const current = queue.shift();

        // Did we reach E?
        if (
            current.row === end.row &&
            current.col === end.col
        ) {
            const path = [];

            // Start from E
            let position = current;

            // Walk backwards: E -> ... -> S
            while (position !== null) {
                path.push(position);

                const key = `${position.row},${position.col}`;

                // Find where this cell came from
                position = parent.get(key) || null;
            }

            // We currently have E -> ... -> S; flip it around
            path.reverse();

            return path;
        }

        // Explore all four neighbors
        for (const { dr, dc } of DIRECTIONS) {
            const next = {
                row: current.row + dr,
                col: current.col + dc
            };

            // 1. Outside the maze
            if (
                next.row < 0 ||
                next.row >= grid.length ||
                next.col < 0 ||
                next.col >= grid[0].length
            ) {
                continue;
            }

            // 2. Wall
            if (grid[next.row][next.col] === "#") {
                continue;
            }

            // 3. Already visited
            if (visited[next.row][next.col]) {
                continue;
            }

            // 4. Mark as visited
            visited[next.row][next.col] = true;

            // 5. Remember parent
            const key = `${next.row},${next.col}`;
            parent.set(key, current);

            // 6. Add to back of queue
            queue.push(next);
        }
    }

    // Queue is empty and E was never found
    return null;
}

module.exports = {
    solve,
    solveBFS,
    resetCounts,
    getDFSCount: () => dfsCount,
    getBFSCount: () => bfsCount,
};
