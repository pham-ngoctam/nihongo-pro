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
