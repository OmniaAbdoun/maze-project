const fs = require("fs");

function loadMaze(path) {
    const contents = fs.readFileSync(path, "utf8");
    const lines = contents.split("\n").filter(line => line.length > 0);

    let start = null;
    let end = null;
    const grid = [];

    for (let row = 0; row < lines.length; row++) {
        const chars = lines[row].trimEnd().split("");

        for (let col = 0; col < chars.length; col++) {
            if (chars[col] === "S") {
                if (start !== null) {
                    throw new Error("Maze contains more than one start");
                }

                start = { row, col };
            } else if (chars[col] === "E") {
                if (end !== null) {
                    throw new Error("Maze contains more than one end");
                }

                end = { row, col };
            } else if (chars[col] !== "#" && chars[col] !== ".") {
                throw new Error(`Unknown character: ${chars[col]}`);
            }
        }

        grid.push(chars);
    }

    if (grid.length === 0) {
        throw new Error("Maze is empty");
    }

    const width = grid[0].length;

    for (let row = 0; row < grid.length; row++) {
        if (grid[row].length !== width) {
            throw new Error("Maze rows must have the same length");
        }
    }

    if (start === null) {
        throw new Error("Maze must contain a start (S)");
    }

    if (end === null) {
        throw new Error("Maze must contain an end (E)");
    }

    return {
        grid,
        start,
        end
    };
}

module.exports = { loadMaze };
