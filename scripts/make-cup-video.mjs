#!/usr/bin/env node
// Builds the home page cup video from the raw clip.
//
// The raw clip is a still photo exported as a 3 second video with a
// "jitter.video" watermark in the bottom-right corner. This script:
//   1. takes one clean frame from it (the plate),
//   2. covers the watermark: a delogo fill, blurred to keep only the tone of
//      the table, plus the wood grain lifted from a clean strip of the same
//      table, blended in through a feathered edge,
//   3. animates the steam with a seamless 6 second flow loop: two copies of
//      the plume rise and cross-fade half a cycle apart, with a slow sideways
//      sway. The cup, saucer and table are never moved,
//   4. writes public/videos/cup-steam.webm, public/videos/cup-steam.mp4 and
//      the poster public/images/home/cup-steam.jpg (frame 0 of the loop).
//
// Needs ffmpeg on PATH. Not part of build or verify; run it only when the
// clip has to be regenerated.
//
// Usage: node scripts/make-cup-video.mjs <path-to-raw-clip.mp4>

import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const VIDEO_DIR = join(ROOT, 'public', 'videos');
const POSTER_DIR = join(ROOT, 'public', 'images', 'home');

// Frame the plate is taken from (seconds).
const PLATE_AT = 1.5;

// Watermark box in the 720 x 900 source, with a few px of margin.
const LOGO = { x: 531, y: 829, w: 170, h: 52 };
// Patch drawn over it (bigger than the box so the feathered edge sits on
// clean wood), and the clean strip the wood grain is lifted from.
const PATCH = { x: 525, y: 824, w: 182, h: 62, feather: 8 };
const GRAIN_FROM = { x: 30, y: 832 };

// Steam region. Local Y = RIM is the cup rim: the motion fades to zero there.
const STEAM = { x: 270, y: 170, w: 290, h: 440, rim: 425 };
const LOOP_SECONDS = 6;
const FPS = 30;
const RISE_PX = 30;
// Two sideways waves that travel up the plume: a slow sway and a faster curl.
// Both periods divide the loop length, so the loop stays seamless.
const SWAY_PX = 3;
const CURL_PX = 1.5;

function ffmpeg(args) {
  const result = spawnSync('ffmpeg', ['-hide_banner', '-v', 'error', '-y', ...args], {
    stdio: 'inherit',
    windowsHide: true,
  });
  if (result.error) {
    console.error('make-cup-video: could not start ffmpeg. Is it installed and on PATH?');
    process.exit(1);
  }
  if (result.status !== 0) {
    console.error(`make-cup-video: ffmpeg failed (exit ${result.status}).`);
    process.exit(1);
  }
}

// Strength of the motion at a pixel: zero at the rim and at the region edges.
const MASK =
  `clip((${STEAM.rim}-Y)/90,0,1)*clip(Y/50,0,1)*clip(X/30,0,1)*clip((W-1-X)/30,0,1)`;

// One colour plane of the flow loop. ld(1) is the phase, ld(2) the weight of
// the first copy, ld(3) the swayed x.
function steamPlane(plane) {
  return [
    `st(0,${MASK})`,
    `st(1,mod(T/${LOOP_SECONDS},1))`,
    'st(2,1-abs(2*ld(1)-1))',
    `st(3,X+(${SWAY_PX}*sin(2*PI*T/${LOOP_SECONDS}+Y/45)+${CURL_PX}*sin(4*PI*T/${LOOP_SECONDS}+Y/23))*ld(0))`,
    `ld(2)*${plane}(ld(3),Y+${RISE_PX}*ld(1)*ld(0))+(1-ld(2))*${plane}(ld(3),Y+${RISE_PX}*mod(ld(1)+0.5,1)*ld(0))`,
  ].join('\\;');
}

function main() {
  const source = process.argv[2];
  if (!source) {
    console.error('Usage: node scripts/make-cup-video.mjs <path-to-raw-clip.mp4>');
    process.exit(1);
  }

  const work = mkdtempSync(join(tmpdir(), 'cup-video-'));
  const plate = join(work, 'plate.png');
  const clean = join(work, 'clean.png');
  const master = join(work, 'master.mkv');
  const webm = join(VIDEO_DIR, 'cup-steam.webm');
  const mp4 = join(VIDEO_DIR, 'cup-steam.mp4');
  const poster = join(POSTER_DIR, 'cup-steam.jpg');

  mkdirSync(VIDEO_DIR, { recursive: true });
  mkdirSync(POSTER_DIR, { recursive: true });

  try {
    console.log('make-cup-video: 1/5 plate');
    ffmpeg(['-ss', String(PLATE_AT), '-i', source, '-frames:v', '1', plate]);

    console.log('make-cup-video: 2/5 watermark');
    const featherMask =
      `color=black:s=${PATCH.w}x${PATCH.h},format=gray,` +
      `geq=lum='255*clip(min(min(X,W-1-X),min(Y,H-1-Y))/${PATCH.feather},0,1)'[m]`;
    ffmpeg([
      '-i', plate,
      '-filter_complex',
      [
        '[0]split=3[base][d0][g0]',
        `[d0]delogo=x=${LOGO.x}:y=${LOGO.y}:w=${LOGO.w}:h=${LOGO.h},crop=${PATCH.w}:${PATCH.h}:${PATCH.x}:${PATCH.y},gblur=sigma=7[tone]`,
        `[g0]crop=${PATCH.w}:${PATCH.h}:${GRAIN_FROM.x}:${GRAIN_FROM.y},split[g][g1]`,
        '[g1]gblur=sigma=3[gb]',
        '[g][gb]blend=all_mode=grainextract[grain]',
        '[tone][grain]blend=all_mode=grainmerge,format=rgba[p]',
        featherMask,
        '[p][m]alphamerge[pm]',
        `[base][pm]overlay=${PATCH.x}:${PATCH.y}:format=auto`,
      ].join(';'),
      '-frames:v', '1',
      clean,
    ]);

    console.log('make-cup-video: 3/5 steam loop');
    ffmpeg([
      '-loop', '1', '-framerate', String(FPS), '-t', String(LOOP_SECONDS), '-i', clean,
      '-filter_complex',
      [
        '[0]format=gbrp,split[base][s0]',
        `[s0]crop=${STEAM.w}:${STEAM.h}:${STEAM.x}:${STEAM.y},geq=r='${steamPlane('r')}':g='${steamPlane('g')}':b='${steamPlane('b')}'[steam]`,
        `[base][steam]overlay=${STEAM.x}:${STEAM.y},format=yuv444p`,
      ].join(';'),
      '-c:v', 'ffv1', '-an',
      master,
    ]);

    console.log('make-cup-video: 4/5 encode');
    ffmpeg([
      '-i', master,
      '-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-row-mt', '1',
      '-deadline', 'good', '-cpu-used', '2', '-pix_fmt', 'yuv420p', '-an',
      webm,
    ]);
    ffmpeg([
      '-i', master,
      '-c:v', 'libx264', '-profile:v', 'high', '-crf', '23', '-preset', 'slow',
      '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an',
      mp4,
    ]);

    console.log('make-cup-video: 5/5 poster');
    ffmpeg(['-i', master, '-frames:v', '1', '-q:v', '3', poster]);

    for (const file of [webm, mp4, poster]) {
      const kb = Math.round(statSync(file).size / 1024);
      console.log(`  ${file.replace(ROOT, '.')}  ${kb} KB`);
    }
  } finally {
    rmSync(work, { recursive: true, force: true });
  }
}

main();
