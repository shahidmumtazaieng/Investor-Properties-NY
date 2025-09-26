# Investor Properties NY Design System

## Color Palette

### Primary Colors
- **Primary Blue**: `#1e3a8a` - Main brand color
- **Accent Yellow**: `#f59e0b` - Secondary brand color
- **Accent Yellow Light**: `#fbbf24` - Lighter accent color
- **Success Emerald**: `#10b981` - Success states

### Neutral Colors
- **Neutral 50**: `#fafafa` - Backgrounds
- **Neutral 100**: `#f5f5f5` - Cards
- **Neutral 200**: `#e5e5e5` - Borders
- **Neutral 400**: `#a3a3a3` - Subtle text
- **Neutral 600**: `#525252` - Body text

## Typography

### Font Family
- **Display**: `Inter, system-ui, sans-serif`

### Heading Classes
- **Hero Heading**: `text-5xl md:text-7xl lg:text-8xl font-bold leading-tight`
- **Section Heading**: `text-4xl md:text-5xl lg:text-6xl font-bold leading-tight`

### Body Text
- **Large Body**: `text-lg md:text-xl lg:text-2xl leading-relaxed`

## Gradients

- **Hero Gradient**: `linear-gradient(135deg, #1e3a8a 0%, #3730a3 50%, #581c87 100%)`
- **Gold Gradient**: `linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)`
- **Primary Gradient**: `linear-gradient(135deg, #1e3a8a 0%, #3730a3 100%)`
- **Success Gradient**: `linear-gradient(135deg, #10b981 0%, #059669 100%)`
- **Mesh Gradient**: `radial-gradient(circle at 50% 50%, rgba(245, 158, 11, 0.1) 0%, transparent 50%)`

## Animations

- **Fade In**: `fadeIn 1s ease-in-out`
- **Slide Up**: `slideUp 0.8s ease-out`
- **Slide In Right**: `slideInRight 0.8s ease-out`
- **Float**: `float 6s ease-in-out infinite`
- **Float Delayed**: `float 6s ease-in-out infinite 2s`
- **Pulse Glow**: `pulseGlow 2s ease-in-out infinite`
- **Gradient Shift**: `gradientShift 3s ease-in-out infinite`
- **Bounce In**: `bounceIn 1s ease-out`

## Components

### Buttons

#### Variants
1. **Primary**: Uses primary gradient with white text, padding 8px 4px, rounded-xl
2. **Secondary**: Uses gold gradient with white text, padding 8px 4px, rounded-xl
3. **Success**: Uses success gradient with white text, padding 8px 4px, rounded-xl
4. **Outline**: Transparent with white border and text, padding 8px 4px, rounded-xl

### Cards

#### Variants
1. **Modern**: White card with subtle shadow and hover effects
2. **Glass**: Translucent card with backdrop blur effect
3. **Floating**: Centered card with glass effect for statistics

## Spacing

- **Section Padding**: `py-20 md:py-32`

## Implementation

All components use Tailwind CSS classes with custom extensions defined in the configuration. Focus states use standard Tailwind colors (`blue-500`) rather than custom color names to avoid compilation issues.