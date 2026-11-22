# Pride or Prejudice?

What people say when they hear the phrase "Ireland is full".

334 comments from six public Reddit threads, sorted by where they stand on the phrase and
shown side by side. You can read them four ways: as written, by the words for how people feel,
by the words for what people need, and by the phrase itself. The page then shows what the
comments add up to, and helps you write to your TDs.

A project by Leah Downing. First made in 2025 during the MA in Interaction Design at the
National College of Art and Design, Dublin. Rebuilt in November 2026.

## See it

Open `index.html` in a browser. There is nothing to install and nothing to build.
The site is plain HTML, CSS and JavaScript with no libraries, no cookies and no trackers.

## Where things are

| To change | Open |
| --- | --- |
| The words on the page | `index.html` |
| The letter to TDs | `data/letter.js` |
| Official figures and their sources | `data/facts.js` |
| Typefaces | `css/fonts.css` |
| Colours, sizes and layout | `css/style.css` |
| How the page behaves | `js/app.js` |

## The data

- `data/source/comments_coded.csv` holds the comments as they were first labelled. The labels in it are
  never edited. Two Reddit usernames that appeared inside comments were replaced with `[username]`.
- `data/source/review_log.csv` lists every comment that was later moved to another column or
  left out, with the reason. It also lists comments that are worth a second look.
- `tools/build_data.py` reads those two files and writes `data/comments.js`. Every number on the
  page about the threads comes from that script, so the numbers cannot drift away from the
  comments shown beside them. Run it again after changing the review log:

      python3 tools/build_data.py

- `data/source/tds_oireachtas_2026-11-22.txt` is the list of TDs, copied from each member's own
  page on oireachtas.ie on 22 November 2026. `tools/build_tds.py` turns it into `data/tds.js`.
  It needs refreshing after an election or by-election. No address is ever guessed.

## Typefaces

The project was designed in Edition Medieval (Elias Hanzer) and Auger Mono (Signal Type Foundry).
Neither is in this repository, because both need a paid web licence. The site ships with two
open-licence faces in their place: Federo and Commit Mono, both under the SIL Open Font License
(licence texts are in `fonts/`). To use the original faces, see the note at the top of `css/fonts.css`.
