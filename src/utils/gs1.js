// Minimal GS1 DataMatrix / GS1-128 parser supporting common AIs used here.
// Handles inputs like:
//   - "]d20100376128155756..." (with symbology identifier)
//   - "(01)00376128155756(21)1000...(10)6M376A(17)230101"
//   - "0100376128155756\x1D211000...\x1D106M376A\x1D17230101"

const GROUP_SEPARATOR = String.fromCharCode(29);

function stripSymbologyIdentifier(value) {
  if (!value) return value;
  // Common GS1 identifiers: ]d2 (DataMatrix), ]C1 (GS1-128), ]Q3 (QR)
  if (value.startsWith(']d2') || value.startsWith(']D2') || value.startsWith(']C1') || value.startsWith(']Q3')) {
    return value.slice(3);
  }
  return value;
}

function formatExpiryYYMMDD(yyMMdd) {
  if (!yyMMdd || yyMMdd.length < 6) return '';
  const yy = parseInt(yyMMdd.slice(0, 2), 10);
  const mm = yyMMdd.slice(2, 4);
  const dd = yyMMdd.slice(4, 6);
  const year = 2000 + yy; // reasonable assumption for medication dates
  return `${year}-${mm}-${dd}`;
}

export function parseGs1(raw) {
  if (!raw) return { gtin: '', sn: '', lot: '', exp: '' };
  let input = raw.trim();
  input = stripSymbologyIdentifier(input);

  // Normalize group separators to a visible delimiter to ease parsing.
  input = input.replaceAll(GROUP_SEPARATOR, '|');

  // If parentheses format exists, use regex extraction first (most readable)
  const hasParens = input.includes('(');
  const result = { gtin: '', sn: '', lot: '', exp: '' };

  if (hasParens) {
    const m01 = input.match(/\(01\)\s*([0-9]{14})/);
    const m21 = input.match(/\(21\)\s*([^()|]+)/);
    const m10 = input.match(/\(10\)\s*([^()|]+)/);
    const m17 = input.match(/\(17\)\s*([0-9]{6})/);
    if (m01) result.gtin = m01[1];
    if (m21) result.sn = m21[1];
    if (m10) result.lot = m10[1];
    if (m17) result.exp = formatExpiryYYMMDD(m17[1]);
    return result;
  }

  // Otherwise parse concatenated AIs. Replace separators with explicit marker
  const s = input;
  let i = 0;
  const next = () => s[i++];
  const peek2 = () => s.slice(i, i + 2);
  const readFixed = (len) => {
    const out = s.slice(i, i + len);
    i += len;
    return out;
  };
  const readVariable = () => {
    const start = i;
    while (i < s.length) {
      if (s[i] === '|') break;
      const ahead = s.slice(i, i + 2);
      // Detect boundaries to next known fixed-length AIs so FNC1 can be omitted
      if (ahead === '01' && /\d{14}/.test(s.slice(i + 2, i + 16))) break;
      if (ahead === '17' && /\d{6}/.test(s.slice(i + 2, i + 8))) break;
      i++;
    }
    const out = s.slice(start, i);
    if (s[i] === '|') i++; // consume separator
    return out;
  };

  while (i < s.length) {
    // Skip any residual separators
    if (s[i] === '|') { i++; continue; }
    const ai = peek2();
    switch (ai) {
      case '01': {
        i += 2;
        result.gtin = readFixed(14);
        break;
      }
      case '17': {
        i += 2;
        result.exp = formatExpiryYYMMDD(readFixed(6));
        break;
      }
      case '10': {
        i += 2;
        result.lot = readVariable();
        break;
      }
      case '21': {
        i += 2;
        result.sn = readVariable();
        break;
      }
      default: {
        // Unknown AI or stray characters; advance by one to avoid infinite loop
        next();
      }
    }
  }

  return result;
}


