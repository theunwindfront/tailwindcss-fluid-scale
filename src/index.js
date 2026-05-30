const plugin = require('tailwindcss/plugin');

/**
 * Parses length strings (e.g. '16px', '1.5rem', '2em') and converts them to px and rem representation.
 */
function parseLength(value, baseFontSize = 16) {
  if (typeof value === 'number') {
    return { value, unit: 'px', px: value, rem: value / baseFontSize };
  }
  if (typeof value !== 'string') return null;

  // Trim and match number and unit
  const match = value.trim().match(/^([\d.-]+)(px|rem|em|vh|vw|%)?$/);
  if (!match) return null;

  const num = parseFloat(match[1]);
  const unit = match[2] || 'px';

  let px = num;
  let rem = num;

  if (unit === 'px') {
    rem = num / baseFontSize;
  } else if (unit === 'rem' || unit === 'em') {
    px = num * baseFontSize;
  }

  return { value: num, unit, px, rem };
}

/**
 * Extracts min and max values from a combined key/arbitrary string, e.g. "sm-xl", "4-12", "16px-32px", "1rem_to_2.5rem"
 */
function getMinMaxValues(value) {
  if (!value) return null;
  const parts = value.split(/(?:-|to|_)+/);
  if (parts.length < 2) return null;
  return {
    min: parts[0].trim(),
    max: parts[1].trim()
  };
}

/**
 * Calculates CSS clamp() formula for fluid sizing scaling between minVal and maxVal
 * across viewport widths from minWidth to maxWidth.
 */
function calculateFluidValue(minValStr, maxValStr, minWidthStr, maxWidthStr, baseFontSize = 16) {
  const minVal = parseLength(minValStr, baseFontSize);
  const maxVal = parseLength(maxValStr, baseFontSize);
  const minWidth = parseLength(minWidthStr, baseFontSize);
  const maxWidth = parseLength(maxWidthStr, baseFontSize);

  if (!minVal || !maxVal || !minWidth || !maxWidth) {
    return null;
  }

  // Work in rem units to respect accessibility zoom settings
  const vMin = minVal.rem;
  const vMax = maxVal.rem;
  const wMin = minWidth.rem;
  const wMax = maxWidth.rem;

  // Prevent divide by zero if width range is invalid
  if (wMax === wMin) return minValStr;

  // Slope: rate of change of size per unit viewport width change
  const slope = (vMax - vMin) / (wMax - wMin);
  // Slope as a percentage of viewport width (vw)
  const slopeVw = slope * 100;
  // Y-intercept: size at zero viewport width in rem
  const yIntercept = vMin - slope * wMin;

  const formatNum = (n) => parseFloat(n.toFixed(4));

  // Build the calc expression for preferred width scaling
  const preferredValue = `calc(${formatNum(yIntercept)}rem + ${formatNum(slopeVw)}vw)`;
  
  // Return native clamp function
  return `clamp(${minValStr}, ${preferredValue}, ${maxValStr})`;
}

// Default standard design system scales
const defaultFontSizes = {
  'xs': '0.75rem',
  'sm': '0.875rem',
  'base': '1rem',
  'lg': '1.125rem',
  'xl': '1.25rem',
  '2xl': '1.5rem',
  '3xl': '1.875rem',
  '4xl': '2.25rem',
  '5xl': '3rem',
  '6xl': '3.75rem',
  '7xl': '4.5rem',
  '8xl': '6rem',
  '9xl': '8rem'
};

const defaultSpacings = {
  '0': '0rem',
  '0.5': '0.125rem',
  '1': '0.25rem',
  '1.5': '0.375rem',
  '2': '0.5rem',
  '2.5': '0.625rem',
  '3': '0.75rem',
  '3.5': '0.875rem',
  '4': '1rem',
  '5': '1.25rem',
  '6': '1.5rem',
  '7': '1.75rem',
  '8': '2rem',
  '9': '2.25rem',
  '10': '2.5rem',
  '11': '2.75rem',
  '12': '3rem',
  '14': '3.5rem',
  '16': '4rem',
  '20': '5rem',
  '24': '6rem',
  '28': '7rem',
  '32': '8rem',
  '36': '9rem',
  '40': '10rem',
  '44': '11rem',
  '48': '12rem',
  '52': '13rem',
  '56': '14rem',
  '60': '15rem',
  '64': '16rem',
  '72': '18rem',
  '80': '20rem',
  '96': '24rem'
};

/**
 * Helper to get clean theme values or fall back to standard defaults if they return CSS variable tokens.
 */
function getThemeLookup(theme, path, fallbackDict) {
  const dict = {};
  Object.keys(fallbackDict).forEach(key => {
    let val = theme(`${path}.${key}`);
    // Handle arrays (Tailwind fontSizes can be [size, options])
    if (Array.isArray(val)) {
      val = val[0];
    } else if (val && typeof val === 'object' && val.fontSize) {
      val = val.fontSize;
    }

    // If it's undefined or resolves to a CSS variable reference (which we cannot parse in JS),
    // fall back to our pre-defined dictionary token
    if (!val || (typeof val === 'string' && (val.includes('var(') || val.includes('--')))) {
      dict[key] = fallbackDict[key];
    } else {
      dict[key] = val;
    }
  });
  return dict;
}

module.exports = plugin.withOptions(
  function (options = {}) {
    return function ({ theme, matchUtilities }) {
      const minWidthOption = options.minWidth || '320px';
      const maxWidthOption = options.maxWidth || '1536px';

      // 1. Resolve screen boundaries, checking if user has screen tokens configured
      let minWidth = minWidthOption;
      let maxWidth = maxWidthOption;

      const themeSm = theme('screens.sm');
      if (themeSm && typeof themeSm === 'string' && !themeSm.includes('var(') && !themeSm.includes('--')) {
        minWidth = themeSm;
      }
      const theme2xl = theme('screens.2xl') || theme('screens.xl');
      if (theme2xl && typeof theme2xl === 'string' && !theme2xl.includes('var(') && !theme2xl.includes('--')) {
        maxWidth = theme2xl;
      }

      // 2. Resolve fontSizes and spacings from theme, falling back to defaults if tokens are unresolved
      const fontSizes = getThemeLookup(theme, 'fontSize', defaultFontSizes);
      const spacings = getThemeLookup(theme, 'spacing', defaultSpacings);

      // 3. Pre-generate combinations of keys to support smooth autocompletion in IDEs
      const fontSizeCombinations = {};
      Object.keys(fontSizes).forEach(minKey => {
        Object.keys(fontSizes).forEach(maxKey => {
          const minValStr = fontSizes[minKey];
          const maxValStr = fontSizes[maxKey];
          const minVal = parseLength(minValStr);
          const maxVal = parseLength(maxValStr);
          if (minVal && maxVal && minVal.px < maxVal.px) {
            fontSizeCombinations[`${minKey}-${maxKey}`] = `${minValStr}-${maxValStr}`;
          }
        });
      });

      const spacingCombinations = {};
      Object.keys(spacings).forEach(minKey => {
        Object.keys(spacings).forEach(maxKey => {
          const minValStr = spacings[minKey];
          const maxValStr = spacings[maxKey];
          const minVal = parseLength(minValStr);
          const maxVal = parseLength(maxValStr);
          if (minVal && maxVal && minVal.px < maxVal.px) {
            spacingCombinations[`${minKey}-${maxKey}`] = `${minValStr}-${maxValStr}`;
          }
        });
      });

      // Helper to match utilities
      const createMatch = (properties) => {
        return (value) => {
          const bounds = getMinMaxValues(value);
          if (!bounds) return null;

          // If the parsed bounds are keys in our resolved theme dictionaries, resolve them
          const minValStr = fontSizes[bounds.min] || spacings[bounds.min] || bounds.min;
          const maxValStr = fontSizes[bounds.max] || spacings[bounds.max] || bounds.max;

          const clampVal = calculateFluidValue(minValStr, maxValStr, minWidth, maxWidth);
          if (!clampVal) return null;

          if (Array.isArray(properties)) {
            const styles = {};
            properties.forEach(prop => {
              styles[prop] = clampVal;
            });
            return styles;
          }
          return { [properties]: clampVal };
        };
      };

      // 4. Register Fluid Typography Utility
      matchUtilities(
        {
          'fluid-text': createMatch('font-size')
        },
        { values: fontSizeCombinations }
      );

      // 5. Register Fluid Spacing Utilities
      const spacingUtilities = {
        'fluid-p': 'padding',
        'fluid-px': ['padding-left', 'padding-right'],
        'fluid-py': ['padding-top', 'padding-bottom'],
        'fluid-pt': 'padding-top',
        'fluid-pb': 'padding-bottom',
        'fluid-pl': 'padding-left',
        'fluid-pr': 'padding-right',
        'fluid-m': 'margin',
        'fluid-mx': ['margin-left', 'margin-right'],
        'fluid-my': ['margin-top', 'margin-bottom'],
        'fluid-mt': 'margin-top',
        'fluid-mb': 'margin-bottom',
        'fluid-ml': 'margin-left',
        'fluid-mr': 'margin-right',
        'fluid-gap': 'gap',
        'fluid-gap-x': 'column-gap',
        'fluid-gap-y': 'row-gap',
        'fluid-w': 'width',
        'fluid-h': 'height',
      };

      Object.entries(spacingUtilities).forEach(([prefix, properties]) => {
        matchUtilities(
          {
            [prefix]: createMatch(properties)
          },
          { values: spacingCombinations }
        );
      });
    };
  }
);
