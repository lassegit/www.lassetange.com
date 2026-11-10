/**
 * Builds the Open Graph cards in `public/social-card-<locale>.jpg`, one per language.
 *
 * Facebook and LinkedIn do not render an arbitrary image: they lay a link preview out at 1.91:1 and
 * want at least 1200px of width for the large format, and their image pipelines only reliably accept
 * a baseline, three-channel sRGB JPEG. The portrait in `public/profile-picture.jpg` is a 2:3
 * photograph and none of those things, so rather than hand it over and hope, a card is composed
 * around it: the same round photo the site uses, the name, and the tagline in the reader's language.
 *
 * The tagline is read out of `src/content/<locale>/home.md`, so the card cannot drift from the page.
 *
 * Run `pnpm social-cards` after changing a tagline or the photo, and commit the result. The cards are
 * checked-in derivatives, like `profile-picture-480.jpg`, because the build runs on Cloudflare and has
 * neither ImageMagick nor librsvg — locally, `brew install imagemagick librsvg`.
 */

import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const LOCALES = ['da', 'en', 'de'];

/** 1.91:1 at the width LinkedIn wants. These two numbers are also declared to the crawlers as
 *  `og:image:width` and `og:image:height` in `src/lib/data.ts`; changing one means changing both. */
const WIDTH = 1200;
const HEIGHT = 630;

/** Diameter of the round photo, drawn at 1:1 in a card this size. */
const PORTRAIT = 372;

/** The site's palette, from `src/styles.css`. A card has no dark mode, so only the light values. */
const INK = '#1b1b1b';
const MUTED = '#5f5d57';
const CANVAS = '#faf9f6';
const SURFACE = '#f2f0ea';
const ACCENT = '#14539a';

/** `ui-sans-serif` as the card renderer resolves it. Named explicitly because librsvg has no notion
 *  of the CSS generic the stylesheet leans on. */
const SANS = 'Helvetica Neue, Helvetica, Arial, sans-serif';

/* -------------------------------------------------------------------------------------------------
 * Inputs
 * ---------------------------------------------------------------------------------------------- */

/** The `tagline:` from a content file's frontmatter — the one line of the card that is translated. */
function tagline(locale) {
  const source = readFileSync(join(root, 'src/content', locale, 'home.md'), 'utf8');
  const match = /^tagline:[ \t]*(.+)$/m.exec(source);
  if (!match) throw new Error(`No tagline in src/content/${locale}/home.md`);
  return match[1].trim();
}

/**
 * The photo as a square PNG data URI, framed like the round avatar on the page: centered, and biased
 * toward the top of the frame so the crop falls across the chest rather than the chin.
 *
 * Tighter than the page's crop, though. The avatar sits beside an `<h1>` that names the subject, so it
 * can afford headroom; a card has to survive being scaled down to a thumbnail in a feed, where a face
 * occupying half the frame stops reading as a face. The crop is a fraction of the export rather than
 * a fixed number of pixels, so re-exporting the portrait at another resolution keeps the same
 * framing: 88% of the width is the tightest crop that still clears the crown of the head.
 *
 * Rendered at twice the drawn size, so downscaling into the JPEG has detail to work from.
 */
function photo() {
  const source = join(root, 'public/profile-picture.jpg');
  const [width, height] = execFileSync('magick', ['identify', '-format', '%w %h', source], { encoding: 'utf8' })
    .trim()
    .split(/\s+/)
    .map(Number);

  const size = Math.round(width * 0.88);
  const left = Math.round((width - size) / 2);
  const top = Math.round((height - size) * 0.05);

  const png = execFileSync(
    'magick',
    [
      source,
      '-crop',
      `${size}x${size}+${left}+${top}`,
      '+repage',
      '-resize',
      `${PORTRAIT * 2}x${PORTRAIT * 2}`,
      '-colorspace',
      'sRGB',
      '-type',
      'TrueColor',
      '-strip',
      'png:-',
    ],
    { maxBuffer: 32 * 1024 * 1024 },
  );

  return `data:image/png;base64,${png.toString('base64')}`;
}

/** XML-escape, so the `&` every one of the three taglines contains stays an `&`. */
function escape(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/* -------------------------------------------------------------------------------------------------
 * The card
 * ---------------------------------------------------------------------------------------------- */

/**
 * One card, as SVG.
 *
 * Everything lives in the middle. Twitter re-crops a 1.91:1 sheet to 2:1 for `summary_large_image`,
 * taking 15px off the top and bottom, and a feed shrinks the whole card to a few hundred pixels wide —
 * so the margins are wide, the name is set large enough to survive that, and nothing but flat
 * background comes near an edge.
 */
function card({ name, tagline, url, image }) {
  const circle = { cx: 955, cy: HEIGHT / 2, r: PORTRAIT / 2 };

  /* Three roles in one 34px line run past x=760, and the portrait starts at x=769. So the tagline is
     set over as many lines as it has roles: the first role stays on the top line, the rest follow.
     The rule and the address then move down by however many extra lines there are, which keeps the
     single-line cards exactly where they have always been. */
  const comma = tagline.indexOf(',');
  const lines = comma === -1 ? [tagline] : [tagline.slice(0, comma), tagline.slice(comma + 1).trim()];
  const taglineY = 330;
  const lineHeight = 40;
  const ruleY = taglineY + (lines.length - 1) * lineHeight + 44;
  const urlY = ruleY + 50;

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <clipPath id="portrait">
      <circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" />
    </clipPath>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="${CANVAS}" />

  <!-- The photo, over the same soft gray the page shows behind it. -->
  <circle cx="${circle.cx}" cy="${circle.cy}" r="${circle.r}" fill="${SURFACE}" />
  <image xlink:href="${image}" x="${circle.cx - circle.r}" y="${circle.cy - circle.r}"
         width="${circle.r * 2}" height="${circle.r * 2}" clip-path="url(#portrait)"
         preserveAspectRatio="xMidYMid slice" />

  <g font-family="${SANS}" fill="${INK}">
    <text x="80" y="272" font-size="78" font-weight="600" letter-spacing="-1.2">${escape(name)}</text>
    ${lines
      .map((line, index) => `<text x="80" y="${taglineY + index * lineHeight}" font-size="34" fill="${MUTED}">${escape(line)}</text>`)
      .join('\n    ')}
    <rect x="80" y="${ruleY}" width="56" height="3" fill="${ACCENT}" />
    <text x="80" y="${urlY}" font-size="26" font-weight="500" fill="${ACCENT}">${escape(url)}</text>
  </g>
</svg>
`;
}

/* -------------------------------------------------------------------------------------------------
 * Build
 * ---------------------------------------------------------------------------------------------- */

const work = mkdtempSync(join(tmpdir(), 'social-cards-'));

try {
  const image = photo();

  for (const locale of LOCALES) {
    const svg = join(work, `${locale}.svg`);
    const png = join(work, `${locale}.png`);
    const jpg = join(root, 'public', `social-card-${locale}.jpg`);

    writeFileSync(svg, card({ name: 'Lasse Tange', tagline: tagline(locale), url: 'www.lassetange.com', image }));

    /** librsvg rather than ImageMagick's own SVG renderer, which does not hint text nearly as well. */
    execFileSync('rsvg-convert', ['--width', String(WIDTH), '--height', String(HEIGHT), '-o', png, svg]);

    /**
     * The encode is the part the networks are fussy about. `-colorspace sRGB -type TrueColor` forces
     * three channels, since a single-channel JPEG is exactly what their pipelines choke on;
     * `-interlace none` writes a baseline rather than a progressive file; `-strip` drops the EXIF and
     * GPS the camera left in the original.
     */
    execFileSync('magick', [
      png,
      '-colorspace',
      'sRGB',
      '-type',
      'TrueColor',
      '-interlace',
      'none',
      '-sampling-factor',
      '4:2:0',
      '-strip',
      '-quality',
      '88',
      jpg,
    ]);

    console.log(
      `public/social-card-${locale}.jpg  ${execFileSync('magick', ['identify', '-format', '%wx%h %[colorspace] %[channels] %b', jpg])}`,
    );
  }
} finally {
  rmSync(work, { recursive: true, force: true });
}
