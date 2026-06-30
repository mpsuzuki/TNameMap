#!/usr/bin/env node

const JSON5 = require("json5");

async function readStdin() {
  return new Promise(resolve => {
    let data = "";
    process.stdin.setEncoding("utf8");
    process.stdin.on("data", chunk => data += chunk);
    process.stdin.on("end", () => resolve(data));
  });
}

function extractTitle(html) {
  const m = html.match(/<span\s*class="treetit"[^>]*>([^<]*?)<\/span?>/);
  return m ? m[1] : null;
}

function extractNumber(html) {
  const m = html.match(/<\/span>:([A-Z0-9]+)/);
  if (!m) return null;
  const num = m[1];
  return /^[0-9]/.test(num) ? ("T" + num) : num;
}

function extractCredits(html) {
    const credits = [];
    let m;

    const re0 = /<\/span>:[0-9]+[A-Za-z]?\s*\(([^()<>]+)\)/g;
    if ((m = re0.exec(html)) !== null) {
       credits.push({marker: m[1]});
       return credits;
    }

    const re  = /<span class="trttu"[^>]*>(.*?)<\/span>([\u4E00-\u9FFF]+)?/g;
    const roleMap = {
      "譯": "translator",
      "撰": "author",
      "著": "author",
      "造": "author",
      "編": "editor",
      "校": "editor"
    };
    while ((m = re.exec(html)) !== null) {
        const name = m[1];
        const marker = m[2] || null;
        const role = marker ? ( roleMap[marker] || "credit" ) : "author";
        credits.push({
            name: m[1],
            role: role,
            marker: marker
        });
    }
    return credits;
}

function credit2str(c) {
    // console.log(c);
    if (c.name && c.marker) {
        return `${c.name}(${c.marker})`;
    } else if (c.marker) {
        return `(${c.marker})`;
    } else {
        return c.name;
    }
}

async function main() {
  const jsText = await readStdin();
  const obj = JSON5.parse(jsText);
  const folders = obj.children;

  console.log([
    "group", "volume", "title_volume",
    "title_sutra", "T_number", "credits"
  ].join("\t"))
  for (const group of obj.children) {
    const title_group = group.title;
    for (const volume of group.children) {
      const title_volume = volume.title;
      for (const sutra of volume.children) {
         const title_sutra = extractTitle(sutra.title);
         const numb_sutra  = extractNumber(sutra.title);
         const credits_sutra = extractCredits(sutra.title);
         const volume_sutra = sutra.ids.slice(-2);
       
         console.log([
           title_group, volume_sutra, title_volume,
           title_sutra,
           numb_sutra,
           credits_sutra.map(c => credit2str(c)).join(";")
         ].join("\t"));
      }
    }
  }
}

main();
