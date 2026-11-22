# Pride or Prejudice?

What people say when they hear the phrase "Ireland is full".

334 comments from six public Reddit threads, sorted by where they stand on the phrase and laid
out as the green, white and orange of the Irish flag. You can read them four ways: as written,
by the words for how people feel, by the words for what people need, and by the phrase itself.

A project by Leah Downing. First made in 2025 during the MA in Interaction Design at the
National College of Art and Design, Dublin. Rebuilt in November 2026.

## The four pages

| Page | File |
| --- | --- |
| Home: the intro, then the flag of comments | `index.html` |
| The findings | `findings.html` |
| Write to your TDs, and the poster | `write.html` |
| About the project | `about.html` |

Open `index.html` in a browser to see the site. There is nothing to install and nothing to build.
It is plain HTML, CSS and JavaScript with no libraries, no cookies and no trackers.

The header, the menu and the footer are the same block of HTML on all four pages. If you change
one of them, change it on all four.

## Where things are

| To change | Open |
| --- | --- |
| The words on a page | that page's `.html` file |
| The letter to TDs | `data/letter.js` |
| Official figures and their sources | `data/facts.js` |
| Typefaces | `css/fonts.css` |
| Colours, sizes and layout | `css/site.css` |
| How the pages behave | `js/app.js` |

The flag on the home page has two looks. `data-flag="solid"` on the `.flag` element in
`index.html` gives colour fields with dark text. `data-flag="dark"` gives coloured text on
the dark ground.

## The data

- `data/source/comments_coded.csv` holds the comments as they were first labelled. The labels in it are
  never edited. Two Reddit usernames that appeared inside comments were replaced with `[username]`.
- `data/source/review_log.csv` lists every comment that was later moved to another side or
  left out, with the reason. It also lists comments that are worth a second look.
- `tools/build_data.py` reads those two files and writes `data/comments.js` and `data/stats.js`.
  Every number on the site about the threads comes from that script, so the numbers cannot drift
  away from the comments shown in the flag. Run it again after changing the review log:

      python3 tools/build_data.py

- `data/source/tds_oireachtas_2026-11-22.txt` is the list of TDs, copied from each member's own
  page on oireachtas.ie on 22 November 2026. `tools/build_tds.py` turns it into `data/tds.js`.
  It needs refreshing after an election or by-election. No address is ever guessed.

## Typefaces

Edition Medieval by Elias Hanzer and Auger Mono by Signal Type Foundry. Both are commercial
typefaces and are not free to reuse. The Edition Medieval file in `fonts/` is the trial cut,
so the site needs a web licence for it. See the note at the top of `css/fonts.css`.
