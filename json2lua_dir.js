#!/usr/bin/env node

function luaKey(key) {
  return /^[A-Za-z_][A-Za-z0-9_]*$/.test(key)
    ? key
    : `["${key}"]`
}

function luaValue(val) {
  return val
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
}

function constructLuaText(obj) {
  const mapLines =
    Object.entries(obj)
          .map(kv => luaKey(kv[0]) + "={t=\"" + luaValue(kv[1]) + "\"}")
          .join(",\n")
  return "return {\n" + mapLines + "\n}"
}

const fs = require("fs");
const path = require("path");

function main() {
  const [dirJson, dirLua] = process.argv.slice(2);

  if (!dirJson || !dirLua) {
    console.error("Usage: json2lua_dir.js <dir_json> <dir_lua>");
    process.exit(1);
  }

  // dig <dirLua> if missing
  if (!fs.existsSync(dirLua)) {
    fs.mkdirSync(dirLua, { recursive: true });
  }

  // collect *.json files
  const files = fs.readdirSync(dirJson)
    .filter(f => f.endsWith(".json"));

  for (const file of files) {
    const jsonPath = path.join(dirJson, file);
    const luaPath  = path.join(dirLua, file.replace(/\.json$/, ".lua"));

    const jsonText = fs.readFileSync(jsonPath, "utf8");
    const obj = JSON.parse(jsonText);

    const luaText = constructLuaText(obj);

    fs.writeFileSync(luaPath, luaText, "utf8");
    console.log(`Converted: ${file} → ${path.basename(luaPath)}`);
  }
}

main();
