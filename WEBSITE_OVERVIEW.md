# Kaviya Birthday Website Overview

This file documents the current website structure, section flow, visual placement system, animations, transitions, and asset handling in one place.

## 1. Project Type

The website is a static, single-page birthday experience built with:

- `index.html` for structure and content.
- `style.css` for layout, visual design, responsive behavior, and base animation states.
- `app.js` for GSAP ScrollTrigger animation, canvas particles, cursor movement, photo preloading, and optional audio.
- CDN dependencies:
  - GSAP `3.12.5`
  - GSAP ScrollTrigger
  - Lenis smooth scrolling
  - Google Fonts: `Cormorant Garamond` and `Montserrat`

The experience is designed as a pinned cinematic story. The page does not behave like a normal vertical website with stacked sections. Instead, the viewport is pinned and the scroll wheel scrubs through a timeline.

## 2. Main Architecture

The full narrative lives inside:

```html
<main id="master-stage">
```

This is the only primary stage for the experience. It is controlled by GSAP ScrollTrigger in `app.js`:

```js
scrollTrigger: {
    trigger: masterStage,
    start: 'top top',
    end: '+=1150%',
    pin: true,
    scrub: 1,
    anticipatePin: 1
}
```

Meaning:

- `pin: true` keeps the whole `#master-stage` fixed in the viewport while the user scrolls.
- `scrub: 1` makes the animation timeline follow the scroll position smoothly.
- `end: '+=1150%'` gives the story enough scroll distance for text, photo groups, and the final wish.
- Once the ScrollTrigger timeline ends, the browser scroll unlocks naturally.

## 3. Stage Placement System

Inside `#master-stage`, the page uses:

```html
<section class="stage-viewport">
    <div class="stage-grid">
        ...
    </div>
</section>
```

The important placement rule is in `style.css`:

```css
.stage-grid {
    display: grid;
    grid-template-areas: "stage";
    place-items: center;
    perspective: 1200px;
}

.narrative-layer,
.memory-canvas,
.photo-section,
.photo-card {
    grid-area: stage;
}
```

All narrative text layers, photo sections, photo cards, and the final wish share the same grid area. This creates a single cinematic center stage where content replaces other content instead of scrolling normally.

Most layers are also absolutely positioned:

```css
.narrative-layer,
.memory-canvas {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
}
```

This allows every section to occupy the same viewport space while GSAP controls visibility, scale, depth, blur, and opacity.

## 4. Initial Hidden States

The site intentionally hides all later-stage content at load:

```css
.text-layer,
.memory-canvas,
.photo-section,
.photo-card,
.photo-caption,
.zenith-layer {
    opacity: 0;
    visibility: hidden;
    pointer-events: none;
}
```

This prevents photos and later text from flashing before the GSAP timeline begins.

In `app.js`, the same initial state is reinforced:

```js
gsap.set('.text-layer, .memory-canvas, .photo-section, .photo-card, .photo-caption, .zenith-layer', {
    autoAlpha: 0,
    visibility: 'hidden',
    pointerEvents: 'none'
});
```

`autoAlpha` controls both opacity and visibility in GSAP.

## 5. Global Visual Atmosphere

The page uses a warm visual palette:

- Background: `#FCF8F8`
- Deep espresso text: `#2C2424`
- Champagne gold accent: `#D4AF37`
- Warm coral hover accent: `#E07A5F`
- Muted whisper text: `#8B7B7B`

The background is not flat. `#master-stage` includes soft radial gradients:

```css
background:
    radial-gradient(circle at 18% 18%, rgba(212, 175, 55, 0.11), transparent 34%),
    radial-gradient(circle at 80% 72%, rgba(224, 122, 95, 0.09), transparent 36%),
    var(--color-bg);
```

There is also an `.ambient-glow` element centered behind the content. It creates a soft gold halo using a radial gradient and blur.

## 6. Custom Cursor

The site hides the default cursor and uses two custom cursor elements:

```html
<div class="custom-cursor" id="custom-cursor"></div>
<div class="custom-cursor-follower" id="custom-cursor-follower"></div>
```

In `app.js`, mouse movement is tracked:

```js
state.mouse.targetX = event.clientX;
state.mouse.targetY = event.clientY;
```

The small cursor moves directly to the target mouse position. The larger follower uses interpolation:

```js
state.mouse.x += (state.mouse.targetX - state.mouse.x) * 0.14;
state.mouse.y += (state.mouse.targetY - state.mouse.y) * 0.14;
```

This creates a soft trailing cursor effect.

The follower also has a continuous pulse animation:

```css
animation: magneticPulse 2.4s ease-in-out infinite;
```

When hovering over buttons or links, the body gets `hover-interactive`, making the cursor larger and warmer.

## 7. Canvas Particle Layer

The background particle layer is:

```html
<canvas id="bg-canvas"></canvas>
```

It is fixed behind the main content:

```css
#bg-canvas {
    position: fixed;
    inset: 0;
    z-index: 1;
    pointer-events: none;
}
```

Particles are created in `app.js` using the `Particle` class. There are currently:

```js
const PARTICLE_COUNT = 240;
```

Particles have:

- Random position
- Random size
- Gold or coral color
- Low opacity
- Slow drift velocity

During normal story sections, particles drift and slightly react to the mouse when nearby.

During the final section, the particle state changes to:

```js
state.particlesState = 'constellation';
```

In that mode, particles move toward generated points that spell `KAVIYA` on an offscreen canvas. Nearby particles are connected with faint gold lines.

## 8. Audio Control

The page includes an optional ambient audio button:

```html
<button class="audio-control" id="audio-control">
```

The audio is generated with the Web Audio API, not from an audio file.

It creates:

- Two oscillators
- A gain node
- A low-pass filter
- An LFO for subtle filter movement

The gain starts at `0` and fades up when enabled:

```js
const targetGain = nextState ? 0.08 : 0;
```

The audio also reacts to scroll progress:

```js
synth.osc1.frequency.setTargetAtTime(55 + progress * 10, ...);
synth.osc2.frequency.setTargetAtTime(82.4 + progress * 14, ...);
synth.filterNode.frequency.setTargetAtTime(420 + progress * 520, ...);
```

So the ambient sound becomes subtly brighter as the story progresses.

## 9. Image Preloading

All visible photos are preloaded in two places.

In `index.html`, each photo has:

```html
<link rel="preload" as="image" href="photos/...">
```

In `app.js`, the same image paths are listed in `imageSources` and loaded with JavaScript before the ScrollTrigger timeline initializes:

```js
preloadImages().then(initScroll);
```

This reduces popping or late image loading during scrubbed animations.

## 10. Narrative Section Order

The scroll-driven story runs in this order:

1. Arrival
2. Character appreciation: kindness
3. Character appreciation: resilience
4. Character appreciation: impact
5. Photo section: bloom cluster
6. Photo section: portrait duet
7. Photo section: flowing ribbon
8. Photo section: final mosaic
9. Final birthday wish

Each section is placed in the same stage area and transitions in/out through opacity, blur, scale, and Z-axis movement.

## 11. Section 1: Arrival

HTML:

```html
<article class="narrative-layer arrival-layer" data-layer="arrival">
    <h1>Kaviya</h1>
    <p class="arrival-line">A story written in the stars...</p>
</article>
```

The arrival layer starts visible. The name `Kaviya` is large, centered, and champagne gold.

The line below starts hidden:

```js
gsap.set('.arrival-line', {
    autoAlpha: 0,
    scale: 1.08,
    filter: 'blur(12px)'
});
```

Animation:

```js
timeline
    .to('.arrival-line', {
        autoAlpha: 1,
        scale: 1,
        filter: 'blur(0px)',
        duration: 0.34
    })
    .to('.arrival-line', {
        autoAlpha: 1,
        duration: 0.42
    })
    .to('.arrival-layer', {
        autoAlpha: 0,
        scale: 0.9,
        z: 210,
        filter: 'blur(16px)',
        duration: 0.62,
        ease: 'power3.in'
    });
```

Effect:

- The arrival line softly appears from blur.
- The layer holds briefly.
- The full arrival layer fades, scales down, moves forward on the Z-axis, and blurs away.

## 12. Sections 2-4: Character Appreciation Text

There are three appreciation text blocks:

### Kindness

```html
<article class="narrative-layer text-layer" data-layer="kindness">
    <p>There is a rare warmth in the way you view the world.</p>
    <span>Kindness, not as a gesture, but as something quietly woven into you.</span>
</article>
```

### Resilience

```html
<article class="narrative-layer text-layer" data-layer="resilience">
    <p>A quiet strength that makes everything around you brighter.</p>
    <span>You carry grace through ordinary days and turn them into something softer.</span>
</article>
```

### Impact

```html
<article class="narrative-layer text-layer" data-layer="impact">
    <p>You do not just exist in my life; you illuminate it.</p>
    <span>Some people are remembered by moments. You become the light inside them.</span>
</article>
```

These use the shared `revealLayer()` helper:

```js
function revealLayer(timeline, selector, position) {
    timeline.set(selector, { visibility: 'visible' }, position)
        .fromTo(selector,
            {
                autoAlpha: 0,
                scale: 1.16,
                z: -260,
                filter: 'blur(18px)'
            },
            {
                autoAlpha: 1,
                scale: 1,
                z: 0,
                filter: 'blur(0px)',
                duration: 1,
                ease: 'power3.out'
            },
            position
        )
        .to(selector,
            {
                autoAlpha: 0,
                scale: 0.88,
                z: 180,
                filter: 'blur(16px)',
                duration: 0.82,
                ease: 'power3.in'
            },
            position + 1.24
        );
}
```

Timeline positions:

```js
revealLayer(timeline, '[data-layer="kindness"]', 1.58);
revealLayer(timeline, '[data-layer="resilience"]', 3.92);
revealLayer(timeline, '[data-layer="impact"]', 6.26);
```

Effect:

- Each text block enters from deep space using `z: -260`.
- It is enlarged at first with `scale: 1.16`.
- It sharpens from `blur(18px)` to `blur(0px)`.
- It exits by fading, shrinking to `scale: 0.88`, moving forward with `z: 180`, and blurring again.
- Blocks do not overlap because each one is shown and hidden at a separate timeline position.

## 13. Photo Gallery Layer

The gallery lives inside:

```html
<section class="memory-canvas" aria-label="Photo memories">
```

Inside it are four `photo-section` groups:

- `photo-bloom`
- `photo-duet`
- `photo-ribbon`
- `photo-mosaic`

The gallery layer itself becomes visible before the first photo group:

```js
timeline.set('.memory-canvas', {
    autoAlpha: 1,
    visibility: 'visible'
}, 8.64);
```

After all photo sections, it is hidden:

```js
timeline.set('.memory-canvas', {
    autoAlpha: 0,
    visibility: 'hidden'
}, 19.3);
```

## 14. Photo Card Placement

Each photo card starts at the center of the stage:

```css
.photo-card {
    position: absolute;
    left: 50%;
    top: 50%;
}
```

The actual offset and rotation are stored in HTML data attributes:

```html
<figure class="photo-card" data-x="-230" data-y="-72" data-r="-8">
```

These values mean:

- `data-x`: horizontal offset from center
- `data-y`: vertical offset from center
- `data-r`: rotation in degrees

In JavaScript, these values are read by:

```js
function cardX(element, drift = 0) {
    return (Number(element.dataset.x || 0) + drift) * motionScale();
}

function cardY(element, drift = 0) {
    return (Number(element.dataset.y || 0) + drift) * motionScale();
}

function cardRotation(element, drift = 0) {
    return Number(element.dataset.r || 0) + drift;
}
```

The `motionScale()` function reduces offsets on smaller screens so the clusters remain inside the viewport:

```js
if (window.innerWidth < 520) return 0.42;
if (window.innerWidth < 760) return 0.56;
if (window.innerWidth < 1040) return 0.78;
return 1;
```

## 15. Photo Caption Placement

Captions are positioned below the photo cluster:

```css
.memory-canvas {
    --photo-cluster-lift: clamp(-92px, -9vh, -56px);
    --photo-caption-bottom: clamp(10px, 2.2vh, 24px);
}

.photo-cluster {
    transform: translateY(var(--photo-cluster-lift));
}

.photo-caption {
    bottom: var(--photo-caption-bottom);
    z-index: 4;
}
```

This means:

- The photo cluster is lifted upward slightly.
- The caption gets its own lower band.
- The caption has a higher `z-index` so it stays readable.

On mobile, the lift is reduced:

```css
--photo-cluster-lift: clamp(-64px, -7vh, -36px);
--photo-caption-bottom: 12px;
```

## 16. Shared Photo Section Animation

All photo groups use `revealPhotoSection()`.

Entry animation:

- Cards start invisible.
- Cards start at a common origin.
- Cards start deep on the Z-axis with `z: -460`.
- Cards start blurred with `blur(24px)`.
- Cards start hidden behind a circular clip path:

```js
clipPath: 'circle(0% at 50% 50%)'
```

Then each card animates to:

```js
autoAlpha: 1,
x: cardX(element),
y: cardY(element),
z: 0,
scale: 1,
rotate: cardRotation(element),
filter: 'blur(0px)',
clipPath: 'circle(76% at 50% 50%)'
```

This creates the materializing photo effect.

Hold animation:

- Cards drift slightly.
- Cards rotate slightly.
- Cards scale up subtly.

Exit animation:

- Cards fade out.
- Cards move forward to `z: 260`.
- Cards blur to `blur(20px)`.
- Cards shrink through `scale`.
- Clip path contracts to:

```js
clipPath: 'circle(34% at 50% 50%)'
```

## 17. Photo Section 1: Bloom Cluster

Selector:

```js
[data-photo-section="bloom"]
```

Timeline:

```js
revealPhotoSection(timeline, '[data-photo-section="bloom"]', 8.64, {
    staggerFrom: 'center',
    driftY: -12,
    rotateDrift: 1.8
});
```

Photos used:

- `photos/1781799660423.png`
- `photos/1781799671233.png`
- `photos/1781799687992.png`
- `photos/1781799704353.png`

Placement:

- Four photos arranged as a soft overlapping cluster.
- Two portrait cards, two square cards.
- The cluster is centered but lifted upward so the caption is visible below.

Animation behavior:

- Cards materialize outward from the center.
- Stagger starts from the center.
- Cards drift upward during the hold.
- Cards rotate slightly more during the hold.

Caption:

```text
Little pieces of time, glowing because they have you in them.
```

## 18. Photo Section 2: Portrait Duet

Selector:

```js
[data-photo-section="duet"]
```

Timeline:

```js
revealPhotoSection(timeline, '[data-photo-section="duet"]', 11.26, {
    staggerFrom: 'edges',
    originY: 44,
    driftY: -10,
    holdScale: 1.01,
    exitRotate: 2
});
```

Photos used:

- `photos/IMG_20260618_215602.jpg.jpeg`
- `photos/IMG_20260618_215611.jpg.jpeg`

Placement:

- Two tall portrait feature cards.
- One sits left of center.
- One sits right of center.

Animation behavior:

- Cards enter from slightly below because of `originY: 44`.
- Stagger begins from the edges.
- Cards settle into a balanced duet layout.
- Exit adds slight rotation.

Caption:

```text
Some frames feel calm, like the world paused to notice you.
```

## 19. Photo Section 3: Flowing Ribbon

Selector:

```js
[data-photo-section="ribbon"]
```

Timeline:

```js
revealPhotoSection(timeline, '[data-photo-section="ribbon"]', 13.94, {
    staggerFrom: 'start',
    stagger: 0.045,
    originX: -80,
    driftX: 18,
    driftY: -4,
    holdScale: 1.015,
    exitDriftX: 48,
    exitFrom: 'end'
});
```

Photos used:

- `photos/IMG_20260618_215630.jpg.jpeg`
- `photos/IMG_20260618_215643.jpg.jpeg`
- `photos/IMG_20260618_215656.jpg.jpeg`
- `photos/IMG_20260618_215710.jpg.jpeg`
- `photos/IMG_20260618_215724.jpg.jpeg`
- `photos/IMG_20260618_215740.jpg.jpeg`
- `photos/IMG_20260618_215804.jpg.jpeg`

Placement:

- Seven slim portrait cards.
- Cards are arranged horizontally like a ribbon across the center.
- Each card has its own `data-x`, `data-y`, and `data-r` for an organic layout.

Animation behavior:

- Cards enter from the left because of `originX: -80`.
- Stagger starts from the first card.
- During hold, the cards drift slightly right.
- On exit, the cards continue drifting right and leave from the end.

Caption:

```text
Every expression, every small light, carrying its own quiet story.
```

## 20. Photo Section 4: Final Mosaic

Selector:

```js
[data-photo-section="mosaic"]
```

Timeline:

```js
revealPhotoSection(timeline, '[data-photo-section="mosaic"]', 16.72, {
    staggerFrom: 'random',
    originY: -30,
    driftY: -14,
    holdScale: 1.02,
    exitScale: 0.72,
    exitRotate: 4
});
```

Photos used:

- `photos/1781799677010.png`
- `photos/1781799682283.png`
- `photos/Screenshot_20260618_215213.jpg.jpeg`
- `photos/Screenshot_20260618_215244.jpg.jpeg`

Placement:

- Mixed portrait and screenshot cards.
- Cards are arranged as a final gathered mosaic before the birthday wish.

Animation behavior:

- Cards enter from slightly above because of `originY: -30`.
- Stagger order is random, making the reveal feel less mechanical.
- Cards drift upward during hold.
- Cards exit with extra scale-down and rotation.

Caption:

```text
And then the memories gather into one bright, impossible thank you.
```

## 21. Final Birthday Wish

HTML:

```html
<article class="narrative-layer zenith-layer" data-layer="zenith">
    <h2>Happy Birthday, <span>Kaviya</span></h2>
    <p>May this year meet you with wonder, peace, and every beautiful thing you quietly deserve.</p>
</article>
```

Timeline:

```js
timeline
    .set('[data-layer="zenith"]', { visibility: 'visible' }, 19.64)
    .fromTo('[data-layer="zenith"]',
        {
            autoAlpha: 0,
            scale: 1.2,
            z: -320,
            filter: 'blur(22px)'
        },
        {
            autoAlpha: 1,
            scale: 1,
            z: 0,
            filter: 'blur(0px)',
            duration: 1.28,
            ease: 'power3.out',
            onStart: () => {
                state.particlesState = 'constellation';
            }
        },
        19.64
    )
    .to('[data-layer="zenith"]', {
        autoAlpha: 1,
        duration: 1.16
    }, 20.96);
```

Effect:

- The final wish emerges from deep blur and Z-depth.
- The word `Kaviya` is highlighted in champagne gold.
- The particle system switches into constellation mode.
- The particles form the name `KAVIYA` behind/around the final wish.

## 22. Final Constellation Behavior

The constellation is generated from text on a temporary canvas:

```js
tempCtx.fillText('KAVIYA', 360, 86);
```

The script reads pixels from that canvas and stores matching points:

```js
state.constellationPoints = coords;
```

When the timeline reaches the final phase:

```js
if (self.progress > 0.91) {
    state.particlesState = 'constellation';
}
```

Each particle picks a random point from the stored letter coordinates and eases toward it:

```js
this.x += (this.constellationTarget.x - this.x) * 0.07;
this.y += (this.constellationTarget.y - this.y) * 0.07;
```

Nearby particles are connected with subtle gold lines, creating the constellation effect.

## 23. Responsive Behavior

The layout adapts under `760px` width.

Key mobile changes:

- Audio label is hidden to save space.
- Stage width becomes `calc(100vw - 28px)`.
- Arrival title gets a mobile clamp.
- Text blocks get larger mobile-relative sizing.
- Photo cards shrink based on type:
  - Normal photo cards
  - Tall feature cards
  - Slim ribbon cards
  - Screenshot cards
  - Square cards
- Caption font size is reduced.
- Photo cluster lift is reduced so photos do not move too high on small screens.

The JavaScript also reduces photo offsets through `motionScale()`:

- `0.42` below `520px`
- `0.56` below `760px`
- `0.78` below `1040px`
- `1` on full desktop

This keeps the same composition style while preventing overflow.

## 24. Transition Style Summary

The site uses the following transition language throughout:

- Fade in/out through `autoAlpha`.
- Depth motion through GSAP `z`.
- Focus changes through `filter: blur(...)`.
- Cinematic scale shifts through `scale`.
- Organic photo positioning through `data-x`, `data-y`, and `data-r`.
- Circular image reveals through `clipPath: circle(...)`.
- Staggered photo reveals to avoid mechanical simultaneous motion.
- Subtle hold movement so photo groups do not feel static.
- Final particle convergence for the climax.

## 25. File Responsibility Summary

### `index.html`

Responsible for:

- Loading fonts, CSS, scripts, and preloaded photos.
- Defining custom cursor elements.
- Defining audio control markup.
- Defining the background canvas.
- Defining the pinned `#master-stage`.
- Providing all narrative text.
- Providing all photo sections and photo card placement data.

### `style.css`

Responsible for:

- Design tokens and colors.
- Global reset and body styling.
- Cursor appearance.
- Audio control styling.
- Canvas layer placement.
- Pinned stage visual layout.
- Shared grid area placement.
- Hidden initial states.
- Typography hierarchy.
- Photo card dimensions and visual treatment.
- Caption placement below the photo gallery.
- Responsive behavior.

### `app.js`

Responsible for:

- Registering GSAP ScrollTrigger.
- Tracking mouse movement.
- Animating the custom cursor.
- Preloading images.
- Creating and animating particles.
- Creating the final constellation.
- Creating optional Web Audio ambience.
- Initializing Lenis smooth scrolling.
- Building the pinned GSAP master timeline.
- Revealing text layers.
- Revealing photo sections.
- Triggering the final birthday wish and constellation state.

## 26. Current User-Facing Flow

The visitor sees:

1. Warm background, custom cursor, and Kaviya's name.
2. The line: "A story written in the stars..."
3. Three emotional appreciation messages.
4. A four-photo memory bloom.
5. A two-photo portrait duet.
6. A seven-photo flowing ribbon.
7. A final four-photo mosaic.
8. The final birthday wish: "Happy Birthday, Kaviya".
9. A constellation particle effect forming `KAVIYA`.

The experience is controlled entirely by scroll, with the stage pinned until the full story has played.
