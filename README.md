# Nihongo Pro Ultimate v3 — Navigation Fix

A responsive static Japanese learning site with Vietnamese explanations and a learning path from START through JLPT N1.

## Package modules
- `index.html`, `styles.css`, `app.js`: UI and application logic.
- `content.js`: original vocabulary and grammar data.
- `course.js`: themed unit roadmap, level-indexed word-based Kanji entries and reading snippets.
- `supabase-schema.sql`: existing schema for separate cloud progress.
- `CONTENT_ROADMAP.md`: scope and honest coverage notes.

## Current package coverage
- 6 levels: START, N5, N4, N3, N2, N1
- 240 vocabulary entries and 120 grammar entries (starter corpus)
- Level-based lesson pages with integrated vocabulary, grammar, sample reading and marking completion
- Word-based Kanji review list
- Kana, listening (browser speech synthesis), short reading, quiz, review list and progress dashboard
- Existing guest/local storage and optional Supabase auth/progress sync

## Important content limitations
This is an upgraded runnable package and curriculum scaffold, not a complete commercial school curriculum, not a full JLPT word/kanji/grammar inventory, and not official exam content. Reading texts and listening remain starter samples; listening uses browser text-to-speech rather than native recordings. Some Kanji entries are word-level learning items (reading as used in that word), not a complete character dictionary with all readings, radicals and stroke diagrams. All content is independently authored/paraphrased; it does not reproduce copyrighted textbook chapters.

## Deploy to GitHub Pages
1. Download and unzip this package.
2. Upload/replace the files at the root of your GitHub Pages repository:
   `index.html`, `app.js`, `styles.css`, `content.js`, `course.js`, `supabase-schema.sql`, `README.md`, `CONTENT_ROADMAP.md`.
3. Commit the files.
4. Repository Settings → Pages → ensure the selected branch and root directory are configured.
5. Wait for deployment and open your Pages URL.

## Supabase setup (cloud accounts)
The static site requires your own Supabase project for cloud login/sync.
1. Create a project in Supabase.
2. Run `supabase-schema.sql` in SQL Editor.
3. Copy the Project URL and anon/public key (never service_role).
4. Enter those values into the two constants near the top of `app.js`.
5. Configure Auth URL settings with your deployed site URL.
6. Register individual email accounts on the site.

## Offline/guest
Guest progress is stored locally in the browser on the device. Cloud sync is not available until Supabase is configured.

## Safety note
Never paste Supabase `service_role` credentials into client-side code.


## v3 fix
- Unified delegated navigation handling for sidebar, dynamically rendered module buttons, and homepage shortcuts.
- Prevents navigation event handler conflicts and rerouting to home.

## JLPT timed mock exam (v4 package)
Added a timed practice exam area for N5-N1 with section timer, answer selection, navigation, section transitions, review/explanations after submission, and local exam history. Questions are original practice items generated from the current small content banks; this is a prototype rather than a complete official-length exam bank. Audio/listening sections and fully validated official exam structure are not yet implemented in this prototype.


## v5 hotfix (iPhone sidebar + mock exam)
- Sidebar navigation now scrolls internally on mobile and desktop when its contents exceed screen height.
- Mock exam flow rewritten to manage a single timer per section, clamp question navigation, and avoid stale timer loops.
- This is a hotfix, not a complete JLPT-sized question bank.

## v6 — JLPT-style mock exam redesign
- Rebuilt mock-exam interface: section structure, timed sections, question navigator, answered state, review flags, end-test scoring/review.
- N5/N4/N3 separated into vocabulary, grammar/reading, listening; N2/N1 into language knowledge/reading and listening.
- Listening practice currently uses original scripts and browser Japanese speech synthesis (not recorded exam audio).
- Original pilot items only; not an official-length or validated JLPT score simulator. Larger bank/audio recording work remains.


## v7 exam content rebuild
- Exam question prompts and answer choices are Japanese-only during testing; Vietnamese appears only in review/explanations.
- Added level-specific original reading and listening pilot content.
- This remains a small practice bank, not a full JLPT-length exam; listening uses browser speech synthesis.


## v8 corrective pass
- Expanded listening items from a single item to multiple short independent dialogues per level.
- Added five short reading practice items per level (still prototype quality, not a full official-pattern bank).
- Simplified the submit-and-grade control to directly finish and render the results.
- The question bank remains experimental and should not be advertised as a full JLPT replica.


## v9 Exam reliability patch
- Set-specific rotated question pools, increased section quotas, result review displays choices, submit confirmation.
- Original generated practice content; still a prototype rather than a full validated official JLPT-length exam.
