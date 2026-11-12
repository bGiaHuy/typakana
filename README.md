# Typakana · JPD113 practice

Personal Japanese study app with kana, numbers, vocabulary, kanji, reading and
image-based JPD113 speaking practice. Built on
[furudean/type-kana](https://github.com/furudean/type-kana); the original MIT
license and attribution are retained. The original project's hosted site below
does not contain these custom practice modules.

<img src="assets/logo.svg" 
  width="128" 
  height="128" 
  align="right" 
  alt="Type Kana logo" />

A quiz app to help you learn
<ruby>
ひらがな<rp>(</rp><rt>hiragana</rt><rp>)</rp>
</ruby>
and
<ruby>
カタカナ<rp>(</rp><rt>katakana</rt><rp>)</rp>
</ruby>, the Japanese syllabaries.

If you are just looking to play, a hosted version of whatever is currently on the `main` branch should be available [here](https://type-kana.himawari.fun/). No promises of uptime though!

## Quick start

Make sure you have at least Node.js 22 installed, then run this in your shell:

```bash
npm install
npm run dev
```

This will install the dependencies needed, then start a live preview of the app as you edit the code.

## Building for production

The command `npm run build` spits out a production ready build based on the [Svelte Kit adapter](https://kit.svelte.dev/docs#adapters) used.

The current adapter used is [`@sveltejs/adapter-vercel`](https://github.com/sveltejs/kit/tree/master/packages/adapter-vercel), which outputs the app in the `.vercel` directory.

## JPD113 speaking practice

Open `/speaking` (also linked on the home page). The personal study deck contains
171 cropped images from 70 exercise pages of **JPD113 - Speaking (Q&A) (7).pdf**
(AnhNH88), plus personal questions: 733 questions in 12 topics.

By default, questions are shuffled across all topics. Choose a topic/picture,
disable shuffle to practise every question in picture order, or
take a random 20-question round. Reveal the sample answer after speaking and mark
it as remembered or needing review. Ratings and the current round are stored in
this browser; optional written answers and recordings are temporary. Recordings
stay in the tab and are discarded when changing questions. There is no automatic
pronunciation grading. Japanese speech uses the device's installed Japanese
voices; recording requires microphone permission and HTTPS or localhost.

Answers are authored study examples, not an official answer key. Open-ended and
personal answers allow other correct responses. A few source slides omit AM/PM;
the affected answers explain their daytime interpretation. Prices are read as
printed, without assuming whether they are unit prices or totals. Names follow
the visible pictures because the PDF's hidden text layer contains overlaps.

The teacher's source artwork is supplied for this user's study; it does not
inherit this repository's code license. Keep permission for the source material
separate from code licensing before publishing or redistributing the images.

To rebuild crops and the deck with Python, use the already installed
`pdfplumber` and Pillow, then run:

```sh
python scripts/import-speaking.py "path/to/JPD113 - Speaking (Q&A) (7).pdf"
npm test
npm run check
npm run build
```

`npm test` checks source-page coverage, asset existence, irregular readings,
filtering and corrupt/resumed progress. An optional browser check uses an
existing Playwright installation and Microsoft Edge, with a fake microphone:

```powershell
$env:PLAYWRIGHT_MODULE = 'path/to/node_modules/playwright'
node scripts/test-speaking.mjs
```

Start `npm run dev` first, or set `SPEAKING_URL` to the running app. The browser
check covers recording, reveal/self-rating, resume, review, personal questions,
mock rounds, mobile/dark layouts and every image URL. It writes screenshots to
the workspace's `output/speaking` directory. Actual voice quality and physical
microphone quality must be checked on the user's device.

## Thanks to

- [Kenney.nl](https://www.kenney.nl/), for free audio that I used
- My dear friend Nancy, for additional sound design
- [M+ Fonts Project](https://mplus-fonts.osdn.jp/), for the M<sup>+</sup> Type-2 font used in this app
- [Type Kana](https://lab.fleon.org/type-kana/) and [Real Kana](https://realkana.com/), for inspiration.
- [Material Design Icons](https://github.com/Templarian/MaterialDesign)
