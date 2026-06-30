// mini_entities.js

function decodeEntities(str) {
  return str
    .replace(/&nbsp;/g, "\u00A0")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    // &#xNNNN; → Unicode
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex) =>
      String.fromCodePoint(parseInt(hex, 16))
    )
    // &#NNNN; → Unicode
    .replace(/&#([0-9]+);/g, (_, num) =>
      String.fromCodePoint(parseInt(num, 10))
    );
}

module.exports = { decodeEntities };
