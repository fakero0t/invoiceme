/**
 * Design Token Type Definitions
 * Type-safe access to CSS design tokens
 */

// Color Tokens
export type ColorToken =
  | '--color-venmo-blue-50'
  | '--color-venmo-blue-100'
  | '--color-venmo-blue-200'
  | '--color-venmo-blue-300'
  | '--color-venmo-blue-400'
  | '--color-venmo-blue-500'
  | '--color-venmo-blue-600'
  | '--color-venmo-blue-700'
  | '--color-venmo-blue-800'
  | '--color-venmo-blue-900'
  | '--color-venmo-purple-50'
  | '--color-venmo-purple-100'
  | '--color-venmo-purple-200'
  | '--color-venmo-purple-300'
  | '--color-venmo-purple-400'
  | '--color-venmo-purple-500'
  | '--color-venmo-purple-600'
  | '--color-venmo-purple-700'
  | '--color-venmo-purple-800'
  | '--color-venmo-purple-900'
  | '--color-venmo-blue'
  | '--color-venmo-purple'
  | '--color-deep-blue'
  | '--color-background'
  | '--color-card-white'
  | '--color-border-gray'
  | '--color-text-primary'
  | '--color-text-secondary'
  | '--color-text-tertiary'
  | '--color-success'
  | '--color-success-light'
  | '--color-success-dark'
  | '--color-warning'
  | '--color-warning-light'
  | '--color-warning-dark'
  | '--color-error'
  | '--color-error-light'
  | '--color-error-dark'
  | '--color-info'
  | '--color-info-light'
  | '--color-info-dark';

// Spacing Tokens
export type SpacingToken =
  | '--spacing-0'
  | '--spacing-1'
  | '--spacing-2'
  | '--spacing-3'
  | '--spacing-4'
  | '--spacing-5'
  | '--spacing-6'
  | '--spacing-8'
  | '--spacing-10'
  | '--spacing-12'
  | '--spacing-16'
  | '--spacing-20'
  | '--spacing-24';

// Border Radius Tokens
export type RadiusToken =
  | '--radius-none'
  | '--radius-sm'
  | '--radius-md'
  | '--radius-lg'
  | '--radius-xl'
  | '--radius-2xl'
  | '--radius-full';

// Shadow Tokens
export type ShadowToken =
  | '--shadow-none'
  | '--shadow-sm'
  | '--shadow-md'
  | '--shadow-lg'
  | '--shadow-xl'
  | '--shadow-focus';

// Font Size Tokens
export type FontSizeToken =
  | '--font-size-display-lg'
  | '--font-size-display'
  | '--font-size-h1'
  | '--font-size-h2'
  | '--font-size-h3'
  | '--font-size-body-lg'
  | '--font-size-body'
  | '--font-size-body-sm'
  | '--font-size-caption';

// Icon Size Tokens
export type IconSizeToken =
  | '--icon-xs'
  | '--icon-sm'
  | '--icon-md'
  | '--icon-lg'
  | '--icon-xl'
  | '--icon-2xl';

// Duration Tokens
export type DurationToken =
  | '--duration-fast'
  | '--duration-base'
  | '--duration-medium'
  | '--duration-slow'
  | '--duration-slower';

// Easing Tokens
export type EasingToken =
  | '--ease-in-out'
  | '--ease-out'
  | '--ease-in'
  | '--ease-bounce';

// All Design Tokens
export type DesignToken =
  | ColorToken
  | SpacingToken
  | RadiusToken
  | ShadowToken
  | FontSizeToken
  | IconSizeToken
  | DurationToken
  | EasingToken;

/**
 * Get a CSS variable value from the document root
 * @param name - The CSS variable name (e.g., '--color-venmo-blue')
 * @returns The value of the CSS variable
 */
export function getCSSVariable(name: string): string {
  return getComputedStyle(document.documentElement)
    .getPropertyValue(name)
    .trim();
}

/**
 * Set a CSS variable value on the document root
 * @param name - The CSS variable name (e.g., '--color-venmo-blue')
 * @param value - The value to set (e.g., '#3D95CE')
 */
export function setCSSVariable(name: string, value: string): void {
  document.documentElement.style.setProperty(name, value);
}

