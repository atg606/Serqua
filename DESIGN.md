# Serqua Design System

## Theme

An early-morning performance studio: matte-black equipment, cool daylight, polished metal, and quiet focus. The homepage is strictly black, silver, white, and grey, combining cinematic product imagery with the decisive commerce rhythm of Zara, Rhode's product clarity, and Birdz Studios' motion-led confidence.

## Color

- White: `oklch(0.99 0 0)`
- Soft silver surface: `oklch(0.955 0 0)`
- Rule silver: `oklch(0.82 0 0)`
- Muted silver: `oklch(0.67 0 0)`
- Graphite: `oklch(0.22 0 0)`
- Black: `oklch(0.075 0 0)`
- Ink: `oklch(0.105 0 0)`
- Focus only: `oklch(0.72 0.045 230)`

Client-provided Pantone references include 419 C / Black C, Cool Gray 1 C / 427 C, and metallic Silver 877 C. Pink, blue, green, and washed neutral Pantones belong to the wider brand palette but are intentionally excluded from the homepage. The pale blue focus colour appears only as an accessibility outline, not as visible art direction.

## Typography

Display: Barlow Condensed for bold, kinetic sportswear statements and product-scale typography.

Editorial accent: Bodoni Moda for a small number of high-contrast statements. The Serqua wordmark and emphasized brand-name instances use the cleaned transparent `serqua-wordmark-silver.png` asset derived from the supplied custom calligraphic reference, preserving its ornate S and dotted r.

Body and interface: Manrope for disciplined clarity, navigation, prices, controls, and readable supporting content. Supporting copy should generally remain at 16–19px on desktop; avoid reducing meaningful copy to caption scale.

## Layout

- Maximum content width: 1440px.
- Full-bleed, high-contrast product hero with the jar as the dominant object and content aligned to a stable twelve-column grid.
- Strong vertical rhythm: compact utility/navigation, expansive hero, crisp product storytelling, and alternating white/silver/black fields.
- Responsive sections collapse intentionally rather than merely shrinking.

## Components

- Buttons are compact, square-edged, and typographically strong; primary uses black on white or white on black.
- Product tiles show only the requested card information: product name, image, price, size, Add to Cart, and Quick View. Until approved product photography arrives, use the black-and-silver typographic asset placeholders rather than the outdated chocolate packaging renders.
- The dedicated `/shop/` experience opens directly on its two-variant product catalogue. Desktop uses a sticky left category sidebar; smaller screens convert those filters into horizontal category controls. It also includes responsive sorting, a native quick-view dialog, persistent bag drawer, quantity controls, and a ₹4,499 free-shipping progress indicator. Checkout remains an explicit Shopify integration hand-off until the live store connection is supplied.
- Benefit rows use fine rules and small line icons.
- Navigation is dark, structured, and keyboard accessible with a mobile drawer.
- Customer access appears as a reusable in-page modal on Home and Shop. It uses passwordless email login and a minimal Shopify-ready registration form; no credentials or personal information are persisted before Shopify integration.
- `/account/` is the post-login dashboard destination, with Overview, Orders, Profile and Addresses views. Before Shopify is connected, it shows explicit preview and empty states instead of fabricated customer data.
- `/help/` centralizes direct WhatsApp/email contact, validated support intake, Shopify-ready order tracking, and factual FAQs. Unconnected workflows must state their preview status instead of simulating submission or tracking.
- Mobile includes a persistent, thumb-friendly purchase control.

## Motion

One orchestrated hero entrance uses opacity, blur, and a slow image settle. Product and social imagery use restrained hover scale. All motion is removed or reduced under `prefers-reduced-motion`.
