#!/usr/bin/env nodejs
const JSON5 = require("json5");
const { decodeEntities } = require("./mini_entities.js");
function decodeAndTrim(s) {
  return decodeEntities(s).replace(/^[\s\u00A0\u3000]+|[\s\u00A0\u3000]+$/g, "");
}

async function readStdin() {
  return new Promise(resolve => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", chunk => data += chunk);
    process.stdin.on("end", () => resolve(data));
  });
}

async function main() {
  const jsText = await readStdin();
  const obj = JSON5.parse(jsText);

  console.log([
    "group", "volume", "title_volume",
    "title_sutra", "T_number", "credits"
  ].join("\t"))
  for (group of obj.source) {
    const title_group = decodeAndTrim(group.title);
    for (volume of group.children) { 
      const title_volume = decodeAndTrim(volume.title);
      for (sutra of volume.children) {
        let title_sutra = sutra.title;
        const numb_sutra = "T" + sutra.ids.slice(0,5).replace("_", "");      
        const volume_sutra = sutra.ids.slice(5);      

        const m_sutra = title_sutra.match(/>([^<]+)<\/span>/);
        if (!m_sutra) continue;

        const title_toks = m_sutra[1].split(/\s+/);
        if (!title_toks[0].startsWith("T") || title_toks.length != 2)
          continue;

        title_sutra = title_toks[1];

        console.log([
          title_group, volume_sutra, title_volume,
          title_sutra,
          numb_sutra
        ].join("\t"))
      }
    }

  }

}

main();
