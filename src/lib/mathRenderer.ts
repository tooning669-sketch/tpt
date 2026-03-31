/**
 * Math Renderer — converts LaTeX-like notation to Unicode for Fabric.js Textbox display.
 * Handles fractions, exponents, square roots, and common math operators.
 */

const UNICODE_FRACTIONS: Record<string, string> = {
  '1/2': '½', '1/3': '⅓', '2/3': '⅔',
  '1/4': '¼', '3/4': '¾', '1/5': '⅕',
  '2/5': '⅖', '3/5': '⅗', '4/5': '⅘',
  '1/6': '⅙', '5/6': '⅚', '1/7': '⅐',
  '1/8': '⅛', '3/8': '⅜', '5/8': '⅝',
  '7/8': '⅞', '1/9': '⅑', '1/10': '⅒',
};

const SUPERSCRIPTS: Record<string, string> = {
  '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
  '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
  '+': '⁺', '-': '⁻', '=': '⁼', '(': '⁽', ')': '⁾',
  'n': 'ⁿ', 'x': 'ˣ', 'y': 'ʸ', 'a': 'ᵃ', 'b': 'ᵇ',
  'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'f': 'ᶠ', 'i': 'ⁱ',
  'k': 'ᵏ', 'm': 'ᵐ', 'o': 'ᵒ', 'p': 'ᵖ', 't': 'ᵗ',
};

const SUBSCRIPTS: Record<string, string> = {
  '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
  '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
  '+': '₊', '-': '₋', '=': '₌', '(': '₍', ')': '₎',
  'a': 'ₐ', 'e': 'ₑ', 'o': 'ₒ', 'x': 'ₓ',
};

function toSuperscript(text: string): string {
  return text.split('').map(c => SUPERSCRIPTS[c] || c).join('');
}

function toSubscript(text: string): string {
  return text.split('').map(c => SUBSCRIPTS[c] || c).join('');
}

/**
 * Check if text contains LaTeX-like math notation
 */
export function hasMathNotation(text: string): boolean {
  return /\\(frac|sqrt|times|div|cdot|pm|leq|geq|neq|infty|pi|approx|alpha|beta|theta)|\^\{|\^\d|\$/.test(text);
}

/**
 * Convert LaTeX-like math notation to Unicode for clean display.
 * Handles: fractions, exponents, square roots, operators.
 */
export function convertMathToUnicode(text: string): string {
  let result = text;

  // Remove $ delimiters
  result = result.replace(/\$/g, '');

  // Convert \frac{a}{b} → Unicode fraction or superscript/subscript notation
  result = result.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, (_, num, den) => {
    const key = `${num}/${den}`;
    if (UNICODE_FRACTIONS[key]) return UNICODE_FRACTIONS[key];
    return `${toSuperscript(num)}⁄${toSubscript(den)}`;
  });

  // Convert ^{exp} to superscript
  result = result.replace(/\^\{([^}]+)\}/g, (_, exp) => toSuperscript(exp));
  // Convert ^n (single char) to superscript
  result = result.replace(/\^(\d)/g, (_, exp) => toSuperscript(exp));

  // Convert _{sub} to subscript
  result = result.replace(/_\{([^}]+)\}/g, (_, sub) => toSubscript(sub));

  // Convert \sqrt{x} → √x
  result = result.replace(/\\sqrt\{([^}]+)\}/g, '√($1)');

  // Convert LaTeX operators to Unicode
  result = result.replace(/\\times/g, '×');
  result = result.replace(/\\div/g, '÷');
  result = result.replace(/\\pm/g, '±');
  result = result.replace(/\\mp/g, '∓');
  result = result.replace(/\\leq/g, '≤');
  result = result.replace(/\\geq/g, '≥');
  result = result.replace(/\\neq/g, '≠');
  result = result.replace(/\\approx/g, '≈');
  result = result.replace(/\\infty/g, '∞');
  result = result.replace(/\\pi/g, 'π');
  result = result.replace(/\\theta/g, 'θ');
  result = result.replace(/\\alpha/g, 'α');
  result = result.replace(/\\beta/g, 'β');
  result = result.replace(/\\gamma/g, 'γ');
  result = result.replace(/\\delta/g, 'δ');
  result = result.replace(/\\sigma/g, 'σ');
  result = result.replace(/\\omega/g, 'ω');
  result = result.replace(/\\cdot/g, '·');
  result = result.replace(/\\ldots/g, '…');
  result = result.replace(/\\degree/g, '°');
  result = result.replace(/\\angle/g, '∠');
  result = result.replace(/\\triangle/g, '△');
  result = result.replace(/\\parallel/g, '∥');
  result = result.replace(/\\perp/g, '⊥');

  // Clean leftover backslashes from unknown commands
  result = result.replace(/\\([a-zA-Z]+)/g, '$1');

  return result.trim();
}

/**
 * Process a question text — auto-detect and convert math notation
 */
export function processQuestionText(text: string): string {
  if (hasMathNotation(text)) {
    return convertMathToUnicode(text);
  }
  return text;
}
