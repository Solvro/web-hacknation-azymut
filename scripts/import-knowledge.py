# /// script
# requires-python = ">=3.11"
# dependencies = ["pypdf==6.10.2"]
# ///
"""Import official sources from the local partner materials."""
import json
import re
import unicodedata
from pathlib import Path
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parents[1]
MATERIALS = ROOT / "materials"
SOURCES = [
    ("ustawa", "Ustawa o służbie cywilnej (Dz.U. 2026 poz. 590)", "ustawa o służbie", "https://eli.gov.pl/api/acts/DU/2026/590/text.pdf", "both", "Art.", {35, 36, 37, 38, 71, 81, 82, 83, 89}),
    ("r2015", "Rozporządzenie o pierwszej ocenie (Dz.U. 2015 poz. 1144)", "rozporządzenie o pierwszej", "https://eli.gov.pl/api/acts/DU/2015/1144/text.pdf", "first", "§", set(range(1, 14))),
    ("r2016", "Rozporządzenie o ocenie okresowej (Dz.U. 2016 poz. 470)", "rozporządzenie o ocenach okresowych z 2016 r. (3)", "https://eli.gov.pl/api/acts/DU/2016/470/text.pdf", "periodic", "§", set(range(1, 14))),
    ("p2015", "KPRM · Pierwsza ocena w służbie cywilnej", "pierwsza ocena w służbie cywilnej - poradnik", "", "first", "", set()),
    ("p2016", "KPRM · Poradnik: oceny okresowe w służbie cywilnej", "poradnik - oceny okresowe", "", "periodic", "", set()),
]


def pages_for(prefix):
    matches = sorted(path for path in MATERIALS.rglob("*.pdf")
                     if unicodedata.normalize("NFC", path.name).lower().startswith(prefix))
    if not matches:
        raise SystemExit(f"Brak dokumentu w materials/: {prefix}")
    for number, page in enumerate(PdfReader(matches[0]).pages, 1):
        text = page.extract_text() or ""
        text = re.sub(r"(?mi)^\s*Dziennik Ustaw\s*[–—-]\s*\d+\s*[–—-]\s*Poz\.\s*\d+\s*$", "", text)
        yield number, re.sub(r"(\w)-\s*\n\s*(\w)", r"\1\2", text)


def normalize(text):
    return " ".join(text.split())


def law_parts(pages, symbol, allowed):
    text = "\n".join(page for _, page in pages)
    headings = list(re.finditer(rf"(?m)^[ \t]*{re.escape(symbol)}\s*(\d+)[a-z]?\.[ \t]*", text))
    found = set()
    for i, heading in enumerate(headings):
        number = int(heading[1])
        if number not in allowed or number in found:
            continue
        found.add(number)
        label = heading[0].strip().rstrip(".")
        stop = headings[i + 1].start() if i + 1 < len(headings) else len(text)
        body = text[heading.end():stop]
        units = list(re.finditer(r"(?m)^[ \t]*(\d+[a-z]?)\.[ \t]+", body))
        if re.match(r"\s*(\d+[a-z]?)\.[ \t]+", body):
            for j, unit in enumerate(units):
                end = units[j + 1].start() if j + 1 < len(units) else len(body)
                yield f"{label} ust. {unit[1]}", normalize(body[unit.end():end])
        else:
            yield label, normalize(body)
    if found != allowed:
        raise ValueError(f"Brak jednostek {symbol}: {sorted(allowed - found)}")


def main():
    documents = []
    for key, title, prefix, url, scope, symbol, allowed in SOURCES:
        pages = list(pages_for(prefix))
        if symbol:
            units = law_parts([page for page in pages if key != "ustawa" or page[0] > 2], symbol, allowed)
        else:
            units = ((f"s. {number}", normalize(page)) for number, page in pages if number > 4)
        for index, (locator, text) in enumerate(units):
            if text:
                documents.append(dict(id=f"{key}-{index}", title=title, locator=locator, text=text, url=url, scope=scope,
                                      kind="law" if symbol else "guide"))
    model = json.loads((ROOT / "data/competencies.json").read_text(encoding="utf-8"))
    for indicators in model["competencies"].values():
        for indicator in indicators:
            texts = " ".join(f"Poziom {level}: {description}" for level, description in enumerate(indicator["levels"], 1))
            documents.append(dict(id=indicator["id"], title="Model kompetencji MC", locator=normalize(indicator["label"]),
                                  text=normalize(texts), url="", scope="both", kind="model"))
    (ROOT / "data/knowledge.json").write_text(json.dumps(documents, ensure_ascii=False), encoding="utf-8")
    print(f"Baza wiedzy gotowa: {len(documents)} jednostek, stron i wskaźników.")


if __name__ == "__main__":
    main()
