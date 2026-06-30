#!/usr/bin/env nodejs

const fs = require("fs");
const path = require("path");

const inputFile = "satdb2015.tsv";

const outDir = "json";
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

const raw = fs.readFileSync(inputFile, "utf8");

const lines = raw.split(/\r?\n/);

// ignore empty lines, and "#"-comment line
const dataLines = lines.filter(line => line.trim() !== "" && !line.startsWith("#"));

// get column names
const header = dataLines.shift().split("\t");

let currentChunk = {};
let currentPrefix = null;  // "00", "01", "02" ...

function writeJSON(currentPrefix, currentChunk, outDir) {
  const outFile = path.join(outDir, `T${currentPrefix}xx.json`);
  fs.writeFileSync(outFile, JSON.stringify(currentChunk, null, 2), "utf8");
  console.log(`${outFile} created`);
}

for (const line of dataLines) {
  const cols = line.split("\t");
  const record = {};

  header.forEach((key, idx) => {
    record[key] = cols[idx];
  });

  const tnum = record["T_number"];  // e.g. "T0123A"
  const numPart = parseInt(tnum.slice(1), 10);  // 123 in "0123A"
  const prefix = String(Math.floor(numPart / 100)).padStart(2, "0"); // "01" from 123

  // if prefix is changed, dump current chunk to "T[0-9]{2}xx.json" file
  if (currentPrefix !== null && prefix !== currentPrefix) {
    writeJSON(currentPrefix, currentChunk, outDir);
    currentChunk = {};
  }

  currentPrefix = prefix;

  currentChunk[tnum] = record["title_sutra"];
}

if (currentPrefix !== null) {
  writeJSON(currentPrefix, currentChunk, outDir);
}

console.log("Done.");
