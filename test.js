// test.js
//
// A handful of quick sanity checks for maze.js and solver.js.
// No framework, just node:assert — run it with:
//
//   node test.js

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { loadMaze } = require("./maze");
const { solve, solveBFS, resetCounts, getDFSCount, getBFSCount } = require("./solver");

let passed = 0;
let failed = 0;

function check(name, fn) {
    try {
        fn();
        console.log(`ok   - ${name}`);
        passed++;
    } catch (err) {
        console.log(`FAIL - ${name}`);
        console.log(`       ${err.message}`);
        failed++;
    }
}

function tempMazeFile(contents) {
    const file = path.join(os.tmpdir(), `maze-test-${Date.now()}-${Math.random()}.txt`);
    fs.writeFileSync(file, contents);
    return file;
}

function gridFrom(contents) {
    return contents.trim().split("\n").map(row => row.split(""));
}

// ---- loadMaze ----

check("loadMaze finds start and end at the right coordinates", () => {
    const file = tempMazeFile("#####\n#S.E#\n#####\n");
    const { start, end } = loadMaze(file);
    assert.deepStrictEqual(start, { row: 1, col: 1 });
    assert.deepStrictEqual(end, { row: 1, col: 3 });
});

check("loadMaze rejects a maze with two starts", () => {
    const file = tempMazeFile("#####\n#SS.#\n#..E#\n#####\n");
    assert.throws(() => loadMaze(file), /more than one start/);
});

check("loadMaze rejects a maze with two ends", () => {
    const file = tempMazeFile("#####\n#S.E#\n#..E#\n#####\n");
    assert.throws(() => loadMaze(file), /more than one end/);
});

check("loadMaze rejects ragged rows", () => {
    const file = tempMazeFile("#####\n#S.E#\n#.\n#####\n");
    assert.throws(() => loadMaze(file), /same length/);
});

check("loadMaze rejects unknown characters", () => {
    const file = tempMazeFile("#####\n#SXE#\n#####\n");
    assert.throws(() => loadMaze(file), /Unknown character/);
});

check("loadMaze ignores trailing whitespace on a line", () => {
    const file = tempMazeFile("#####   \n#S.E#\t\n#####\n");
    assert.doesNotThrow(() => loadMaze(file));
});

// ---- solve ----

check("solve finds a path when one exists", () => {
    const grid = gridFrom("#####\n#S.E#\n#####\n");
    const start = { row: 1, col: 1 };
    const end = { row: 1, col: 3 };
    const visited = grid.map(row => row.map(() => false));

    const result = solve(grid, visited, start, end);

    assert.notStrictEqual(result, null);
    assert.deepStrictEqual(result[0], start);
    assert.deepStrictEqual(result[result.length - 1], end);
});

check("solve returns null when S and E are walled off from each other", () => {
    const grid = gridFrom("#####\n#S#E#\n#####\n");
    const start = { row: 1, col: 1 };
    const end = { row: 1, col: 3 };
    const visited = grid.map(row => row.map(() => false));

    const result = solve(grid, visited, start, end);

    assert.strictEqual(result, null);
});

check("solve doesn't get stuck in a loop", () => {
    // a ring the solver could go around forever without the
    // "already visited" check
    const grid = gridFrom("#####\n#S..#\n#.#.#\n#..E#\n#####\n");
    const start = { row: 1, col: 1 };
    const end = { row: 3, col: 3 };
    const visited = grid.map(row => row.map(() => false));

    const result = solve(grid, visited, start, end);

    assert.notStrictEqual(result, null);
});

// ---- solveBFS and the step counters ----

check("solveBFS finds a path when one exists", () => {
    const grid = gridFrom("#####\n#S.E#\n#####\n");
    const result = solveBFS(grid, { row: 1, col: 1 }, { row: 1, col: 3 });
    assert.notStrictEqual(result, null);
    assert.strictEqual(result.length, 3);
});

check("resetCounts zeroes both counters, so runs don't bleed into each other", () => {
    const grid = gridFrom("#####\n#S.E#\n#####\n");
    const start = { row: 1, col: 1 };
    const end = { row: 1, col: 3 };

    resetCounts();
    solve(grid, grid.map(row => row.map(() => false)), start, end);
    solveBFS(grid, start, end);
    const firstRunTotal = getDFSCount() + getBFSCount();

    resetCounts();
    solve(grid, grid.map(row => row.map(() => false)), start, end);
    solveBFS(grid, start, end);
    const secondRunTotal = getDFSCount() + getBFSCount();

    assert.strictEqual(firstRunTotal, secondRunTotal);
});

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
