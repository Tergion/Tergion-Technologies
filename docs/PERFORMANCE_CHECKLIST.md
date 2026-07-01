# Performance Checklist

## Page Model

- Keep marketing pages mostly static where possible.
- Prefer server-rendered content for core copy and navigation.
- Use client components only where interactivity is required.
- Avoid broad client-side wrappers around the full application.

## Assets

- Optimize images and use `next/image` for real images where appropriate.
- Avoid video backgrounds.
- Avoid particle effects.
- Avoid large decorative assets that do not improve user understanding.
- Keep mockups lightweight and clearly illustrative.

## Motion And Styling

- Keep animation restrained.
- Prefer transform and opacity animation over layout, blur, or filter animation.
- Respect reduced-motion preferences.
- Use backdrop filtering carefully and avoid large full-screen blur layers.
- Avoid animation that causes layout shift.

## Runtime

- Keep the lead form modal lightweight.
- Avoid chatbot scripts in the current site phase.
- Avoid analytics or third-party scripts until reviewed.
- Check mobile performance after meaningful visual changes.
- Run a production build after meaningful UI or routing changes.
