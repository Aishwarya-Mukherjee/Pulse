---
name: Serene Pulse
colors:
  surface: '#fff8f4'
  surface-dim: '#dfd9d5'
  surface-bright: '#fff8f4'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f9f2ee'
  surface-container: '#f4ede8'
  surface-container-high: '#eee7e3'
  surface-container-highest: '#e8e1dd'
  on-surface: '#1e1b19'
  on-surface-variant: '#3f4848'
  inverse-surface: '#33302d'
  inverse-on-surface: '#f6efeb'
  outline: '#6f7978'
  outline-variant: '#bfc8c8'
  surface-tint: '#276868'
  primary: '#246565'
  on-primary: '#ffffff'
  primary-container: '#407e7e'
  on-primary-container: '#f3fffe'
  inverse-primary: '#93d2d1'
  secondary: '#695c51'
  on-secondary: '#ffffff'
  secondary-container: '#f1dfd1'
  on-secondary-container: '#6f6257'
  tertiary: '#844e36'
  on-tertiary: '#ffffff'
  tertiary-container: '#a1664c'
  on-tertiary-container: '#fffbff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#afeeed'
  primary-fixed-dim: '#93d2d1'
  on-primary-fixed: '#002020'
  on-primary-fixed-variant: '#004f50'
  secondary-fixed: '#f1dfd1'
  secondary-fixed-dim: '#d4c4b6'
  on-secondary-fixed: '#231a11'
  on-secondary-fixed-variant: '#50453a'
  tertiary-fixed: '#ffdbcd'
  tertiary-fixed-dim: '#feb697'
  on-tertiary-fixed: '#351001'
  on-tertiary-fixed-variant: '#6b3a23'
  background: '#fff8f4'
  on-background: '#1e1b19'
  surface-variant: '#e8e1dd'
typography:
  display:
    fontFamily: Inter
    fontSize: 48px
    fontWeight: '500'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 28px
    fontWeight: '500'
    lineHeight: 36px
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '500'
    lineHeight: 32px
  body-lg:
    fontFamily: Inter
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 26px
  label-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0.01em
  caption:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  container-padding-mobile: 20px
  container-padding-desktop: 40px
  gutter: 24px
  stack-sm: 12px
  stack-md: 24px
  stack-lg: 48px
---

## Brand & Style

The design system is centered on a **Supportive & Human-Centric** narrative, pivoting away from productivity-first metrics toward holistic wellness and personal growth. The target audience includes individuals seeking mindfulness, coaching, and health tracking in an environment that feels like a sanctuary rather than a dashboard.

The visual style is a blend of **Soft Minimalism** and **Organic Tactility**. It prioritizes heavy whitespace, a warm "paper-like" background, and a reduction of visual noise to lower cognitive load. Every interaction should feel intentional and calm, evoking an emotional response of safety, clarity, and encouragement.

## Colors

The palette is anchored in natural, earthy tones to reinforce the wellness narrative. 

- **Primary (#4D8B8B):** A muted Sage Teal used for primary actions, progress indicators, and active states. It represents growth and stability.
- **Secondary (#E2D1C3):** A warm Sand tone used for subtle accents and decorative elements.
- **Background (#FCF9F7):** A warm Cream that reduces eye strain compared to pure white, providing a soft foundation for the interface.
- **Surface & Neutrals:** We use "Warm Grays" (#F4F0EE, #EAE4E0) for container backgrounds to maintain depth without breaking the soft aesthetic. Text is rendered in a deep charcoal-brown rather than pure black to keep the contrast accessible but gentle.

## Typography

This design system utilizes **Inter** for its legibility and modern neutrality, but applies it with a "soft-touch" approach. 

To achieve a reassuring tone, we avoid the "Extra Bold" or "Black" weights commonly found in SaaS. Instead, we cap weights at **Medium (500)** for headlines and **Regular (400)** for body text. Line heights are intentionally generous (1.5x to 1.6x for body text) to create a breathable, "literary" reading experience that encourages reflection. Headlines use a slightly tighter tracking to maintain a modern, sophisticated feel.

## Layout & Spacing

The layout philosophy follows a **Fluid Grid** with an emphasis on safe margins and large "breathing zones." 

- **Desktop:** A 12-column grid with a maximum content width of 1280px. Gutters are kept wide (24px) to prevent the UI from feeling cramped.
- **Mobile:** A single-column flow with generous 20px side margins to ensure content doesn't feel "trapped" by the screen edges.
- **Rhythm:** We use an 8px base unit. Vertical stack spacing is intentionally exaggerated (e.g., using 48px or 64px between sections) to reinforce the calm, unhurried nature of the brand.

## Elevation & Depth

This design system avoids harsh dropshadows or heavy industrial borders. Depth is communicated through **Tonal Layering** and **Ambient Soft Shadows**.

1.  **Low Elevation:** Surface-on-surface containers use a slightly darker or lighter tint of the background (e.g., #F4F0EE) with no shadow.
2.  **High Elevation (Cards/Modals):** Elements use a very diffused, low-opacity shadow (Color: #4D3D33, Alpha: 0.04, Blur: 20px) to simulate a soft object resting on a matte surface.
3.  **Interaction:** Hover states should not feel "sharp." Use subtle scale increases (1.02x) or soft color shifts rather than heavy shadow changes to indicate focus.

## Shapes

The shape language is **Organic and Friendly**. We move away from the "standard" 4px-8px radius toward a much softer profile.

- **Base Radius (8px):** Used for small interactive elements like checkboxes or input fields.
- **Large Radius (16px):** Used for standard buttons and list items.
- **Extra Large Radius (24px):** Used for primary cards, modals, and container surfaces. 

This high degree of roundedness removes "visual sharpness," making the interface feel approachable and physically safe.

## Components

- **Buttons:** Primary buttons use the Sage Teal (#4D8B8B) with white text and a 16px radius. Secondary buttons are ghost-style with a thin 1px border in a muted sand tone.
- **Cards:** Cards should have no borders. Use a soft background color (#F4F0EE) or a very subtle ambient shadow. Ensure 24px of internal padding for a spacious feel.
- **Input Fields:** Use a subtle background fill rather than a high-contrast outline. Focused states use a soft 2px glow in the primary teal color.
- **Chips/Tags:** Use high-roundedness (pill-shaped) with low-contrast background fills to categorize wellness topics or coaching tags.
- **Lists:** Items should be separated by whitespace rather than dividers wherever possible. If dividers are necessary, use a very faint #EAE4E0 line.
- **Progress Indicators:** Use soft, rounded line ends for progress bars and circular trackers to maintain the organic aesthetic.