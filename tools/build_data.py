#!/usr/bin/env python3
"""
Builds data/comments.js from the coded comments.

    python3 tools/build_data.py

Reads   data/source/comments_coded.csv   the comments as first coded (never edited)
        data/source/review_log.csv       later corrections, one row per comment
Writes  data/comments.js                 the three columns as HTML, plus every
                                         number the page shows about the thread

Every figure on the site about the thread comes out of this script, so the
numbers on the page cannot drift away from the comments shown beside them.
"""
import csv, html, json, re, datetime, pathlib, collections

ROOT = pathlib.Path(__file__).resolve().parent.parent
SRC = ROOT / "data" / "source" / "comments_coded.csv"
LOG = ROOT / "data" / "source" / "review_log.csv"
OUT = ROOT / "data" / "comments.js"

STANCE = {"AGREE_IRELAND_IS_FULL": "agree", "DISAGREE_IRELAND_IS_FULL": "disagree", "AMBIGUOUS_OR_META": "neither"}
REVISED = {"AGREE": "agree", "DISAGREE": "disagree", "NEITHER": "neither"}
ORDER = ["agree", "neither", "disagree"]

# Words for how people feel. Lit up by the "Feelings" view.
FEEL = set("""fear fears afraid scared anger angry rage anxiety anxious stress stressed exhaustion
exhausted hope hopes hopeful hopefulness frustration frustrated tired tiredness panic panicked
insecurity insecure worry worried overwhelm overwhelmed desperation desperate relief relieved
stability stable safety safe unsafe fair unfair fairness""".split())

# Words for what people need. Covered by bars in the "What gets covered up" view.
LOST = set("""housing trust safety dignity jobs infrastructure infastructure care capacity
stability services solidarity resources""".split())

# Topics counted in the findings. A comment counts once per topic if any of its words match.
TOPICS = [
    ("immigration", "Immigration",
     r"\b(immigra\w+|migra\w+|asylum|refugees?|foreign(ers?)?|ipas|deport\w*|borders?)\b",
     "immigration, immigrants, migrants, asylum, refugees, foreign, foreigners, IPAS, deported, borders"),
    ("housing", "Housing",
     r"\b(hous(e|es|ing)|homes|homeless(ness)?|rent(s|ing|ed|al|ers?)?|landlords?|accommodation|mortgages?|apartments?)\b",
     "house, houses, housing, homes, homeless, rent, renting, rental, landlord, accommodation, mortgage, apartment"),
    ("services", "Health, schools and services",
     r"\b(hospitals?|health(care)?|hse|a&e|gps?|waiting lists?|schools?|public transport|bus(es)?|luas|infrastructure|services)\b",
     "hospital, health, healthcare, HSE, A&E, GP, waiting lists, school, public transport, bus, Luas, infrastructure, services"),
    ("government", "Government",
     r"\b(government|govt|politicians?|tds?|fine gael|fianna f[aá]il|ffg|fg|ff|sinn f[eé]in|minister|taoiseach|d[aá]il|policy|policies)\b",
     "government, politicians, TDs, Fine Gael, Fianna Fáil, Sinn Féin, minister, Taoiseach, Dáil, policy"),
]

# Endings for the opening sentence "Ireland is ...". Each is checked against the comment it
# comes from, so nothing can be shown that a commenter did not write.
OPENING = [
    (8, " full."),
    (34, " far from full"),
    (1, " full, so we should increase its capacity"),
    (282, "n’t full it’s terribly designed!"),
    (92, " full… …full of pints"),
    (69, " less full than woefully mismanaged."),
    (24, " one of the safest countries in the world"),
]

PHRASE = re.compile(r"ireland\s+is\s+full", re.I)
URL = re.compile(r"https?://\S+")
WORD = re.compile(r"[A-Za-zÀ-ÿ]+(?:['’\-][A-Za-zÀ-ÿ]+)*")
ABBREV = ("e.g.", "i.e.", "etc.", "vs.", "Mr.", "Mrs.", "Dr.", "St.")


def clean(body):
    t = body.replace("\xa0", " ")
    t = t.replace("&amp;", "&").replace("&gt;", ">").replace("&lt;", "<")
    t = re.sub(r"\\([*_~\[\]()])", r"\1", t)          # Reddit escapes like c\*\*ts
    t = re.sub(r"\s+", " ", t).strip()
    return t


def short_url(m):
    u = m.group(0)
    tail = ""
    while u and u[-1] in ".,);!?":
        tail = u[-1] + tail
        u = u[:-1]
    u = re.sub(r"^https?://(www\.)?", "", u)
    u = re.split(r"[?#]", u)[0].rstrip("/")
    if len(u) > 48:
        u = u[:47] + "…"
    return "\x01" + u + "\x02" + tail


def sentences(t):
    marked = re.sub(r"([.!?…]+[\"”’')\]]*)\s+(?=[A-Z0-9\"“‘'(\[>])", "\\1\x00", t)
    parts, out = marked.split("\x00"), []
    for p in parts:
        if out and out[-1].endswith(ABBREV):
            out[-1] += " " + p
        else:
            out.append(p)
    return [p for p in out if p.strip()]


def mark_words(text, counts):
    """Escape text and wrap feeling words and need words."""
    out, pos = [], 0
    for m in WORD.finditer(text):
        w = m.group(0).lower().replace("’", "'")
        cls = []
        if w in FEEL:
            cls.append("f"); counts["feel"] += 1
        if w in LOST:
            cls.append("l"); counts["lost"] += 1
        if cls:
            out.append(html.escape(text[pos:m.start()], quote=False))
            out.append('<span class="%s">%s</span>' % (" ".join(cls), html.escape(m.group(0), quote=False)))
            pos = m.end()
    out.append(html.escape(text[pos:], quote=False))
    return "".join(out)


def render_sentence(s, counts):
    out, pos = [], 0
    for m in PHRASE.finditer(s):
        out.append(mark_words(s[pos:m.start()], counts))
        out.append('<span class="ph">%s</span>' % html.escape(m.group(0), quote=False))
        counts["uses"] += 1
        pos = m.end()
    out.append(mark_words(s[pos:], counts))
    h = "".join(out)
    h = h.replace("\x01", '<span class="url">').replace("\x02", "</span>")
    return '<span class="s">%s</span>' % h


def main():
    rows = list(csv.DictReader(open(SRC, encoding="utf-8-sig", newline="")))
    log = {int(r["comment"]): r for r in csv.DictReader(open(LOG, encoding="utf-8", newline=""))}

    comments, left_out, moved = [], 0, 0
    for i, r in enumerate(rows, start=1):
        stance = STANCE[r["stance_bucket"]]
        fix = log.get(i)
        if fix and fix["status"] == "left out":
            left_out += 1
            continue
        if fix and fix["status"] == "changed":
            assert REVISED[fix["original"]] == stance, "review log does not match source for comment %d" % i
            stance = REVISED[fix["revised"]]
            moved += 1
        comments.append({"n": i, "stance": stance, "text": clean(r["body"])})

    by = {s: [c for c in comments if c["stance"] == s] for s in ORDER}
    total = len(comments)

    # The opening: check each ending was really written
    by_n = {c["n"]: c for c in comments}
    opening = []
    for n, ending in OPENING:
        c = by_n[n]
        needle = ("Ireland is" + ending).lower()
        assert needle in c["text"].lower(), "opening line for comment %d is not in the comment" % n
        opening.append({"n": n, "text": ending, "stance": c["stance"]})

    stats = {"total": total, "leftOut": left_out, "moved": moved, "sourceRows": len(rows), "stances": {}, "topics": []}
    columns = {}
    all_counts = collections.Counter()
    for s in ORDER:
        counts = collections.Counter()
        paras = []
        for c in by[s]:
            body = URL.sub(short_url, c["text"])
            inner = " ".join(render_sentence(x, counts) for x in sentences(body))
            paras.append('<p class="c" data-n="%d">%s</p>' % (c["n"], inner))
        columns[s] = "".join(paras)
        words = sum(len(c["text"].split()) for c in by[s])
        said = sum(1 for c in by[s] if PHRASE.search(c["text"]))
        stats["stances"][s] = {"n": len(by[s]), "pct": 0, "words": words,
                               "feel": counts["feel"], "lost": counts["lost"], "uses": counts["uses"], "said": said}
        all_counts.update(counts)
        all_counts["words"] += words
        all_counts["said"] += said

    # Shares of the whole, rounded so the three add up to 100
    exact = {s: len(by[s]) / total * 100 for s in ORDER}
    floors = {s: int(exact[s]) for s in ORDER}
    for s in sorted(ORDER, key=lambda s: exact[s] - floors[s], reverse=True)[:100 - sum(floors.values())]:
        floors[s] += 1
    for s in ORDER:
        stats["stances"][s]["pct"] = floors[s]

    for key, label, rx, terms in TOPICS:
        R = re.compile(rx, re.I)
        row = {"key": key, "label": label, "terms": terms}
        for s in ORDER:
            n = sum(1 for c in by[s] if R.search(c["text"]))
            row[s] = {"n": n, "pct": round(n / len(by[s]) * 100)}
        n_all = sum(row[s]["n"] for s in ORDER)
        row["all"] = {"n": n_all, "pct": round(n_all / total * 100)}
        stats["topics"].append(row)

    sided = stats["stances"]["agree"]["n"] + stats["stances"]["disagree"]["n"]
    stats.update({
        "words": all_counts["words"], "feel": all_counts["feel"], "lost": all_counts["lost"],
        "uses": all_counts["uses"], "said": all_counts["said"], "saidPct": round(all_counts["said"] / total * 100),
        "sided": sided, "sidedDisagreePct": round(stats["stances"]["disagree"]["n"] / sided * 100),
        "feelWords": sorted(FEEL), "lostWords": sorted(LOST - {"infastructure"}),
        "built": datetime.date.today().isoformat(),
    })

    # The findings text in index.html makes three claims in words. Stop the build if the
    # comments no longer support them, so the page can never say something the data does not.
    t = {row["key"]: row for row in stats["topics"]}
    assert 45 <= t["housing"]["agree"]["pct"] <= 55, "text says half of agreeing comments mention housing"
    assert abs(t["housing"]["agree"]["pct"] - t["immigration"]["agree"]["pct"]) <= 6, \
        "text says agreeing comments mention housing about as often as immigration"
    assert t["housing"]["disagree"]["pct"] > 34, "text says more than a third of disagreeing comments mention housing"

    data = {"stats": stats, "opening": opening, "columns": columns}
    OUT.write_text("/* Built by tools/build_data.py. Do not edit by hand. */\nwindow.POP_DATA = "
                   + json.dumps(data, ensure_ascii=False, separators=(",", ":")) + ";\n", encoding="utf-8")

    print("comments shown:", total, "| left out:", left_out, "| moved:", moved)
    for s in ORDER:
        print("  %-9s" % s, stats["stances"][s])
    for t in stats["topics"]:
        print("  %-28s" % t["label"], {s: "%d%%" % t[s]["pct"] for s in ORDER}, "all", t["all"])
    print("  words", stats["words"], "| feeling words", stats["feel"], "| need words", stats["lost"],
          "| phrase written", stats["uses"], "times in", stats["said"], "comments (%d%%)" % stats["saidPct"])
    print("  of %d that take a side, %d%% disagree" % (sided, stats["sidedDisagreePct"]))
    print("wrote", OUT.relative_to(ROOT), "%.0f KB" % (OUT.stat().st_size / 1024))


if __name__ == "__main__":
    main()
