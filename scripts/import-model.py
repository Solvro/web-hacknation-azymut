"""Import the supplied MC workbook into ignored local application data."""
import hashlib
import json
from pathlib import Path
from xml.etree import ElementTree as ET
from zipfile import ZipFile

ROOT = Path(__file__).resolve().parents[1]
WORKBOOK = ROOT / "materials" / "Model_kompetencji.xlsx"
OUTPUT = ROOT / "data" / "competencies.json"
CRITERIA = {
    "rzetelność": "reliability",
    "komunikacja": "communication",
    "wykorzystywanie wiedzy i doskonalenie zawodowe": "knowledge",
    "organizacja pracy i orientacja na osiąganie celów": "organization",
    "kreatywność": "creativity",
    "współpraca": "cooperation",
    "myślenie analityczne": "analysis",
    "negocjowanie": "negotiation",
    "wystąpienia publiczne": "speaking",
    "orientacja na klienta/interesanta": "customer",
    "radzenie sobie w sytuacjach kryzysowych": "crisis",
    "zarządzanie strategiczne": "strategy",
    "zarządzanie ludźmi": "leadership",
    "podejmowanie decyzji i odpowiedzialność": "decisions",
}
LEVELS = ["Znacznie poniżej oczekiwań", "Poniżej oczekiwań", "Na poziomie oczekiwań",
          "Powyżej oczekiwań", "Znacznie powyżej oczekiwań"]


def import_model():
    if not WORKBOOK.exists():
        raise SystemExit(f"Do uruchomienia demo potrzebny jest plik {WORKBOOK}")
    competencies = {}
    with ZipFile(WORKBOOK) as workbook:
        # The supplied version stores descriptions as literal strings in A:F.
        for path in workbook.namelist():
            if not path.startswith("xl/worksheets/sheet") or not path.endswith(".xml"):
                continue
            sheet = ET.fromstring(workbook.read(path))
            cells = {cell.attrib["r"]: cell.findtext("{*}v", "")
                     for cell in sheet.findall(".//{*}sheetData/{*}row/{*}c")}
            key = CRITERIA.get(cells["A1"].strip().lower())
            if key is None:
                continue
            if key in competencies or [cells.get(f"{col}3") for col in "BCDEF"] != LEVELS:
                raise ValueError(f"Niezgodny układ modelu: {key}")
            indicators = []
            for row in sheet.findall(".//{*}sheetData/{*}row"):
                index = int(row.attrib["r"])
                if index < 4:
                    continue
                values = [cells.get(f"{col}{index}", "").strip() for col in "ABCDEF"]
                if not all(values):
                    raise ValueError(f"Niepełny wskaźnik: {key}, wiersz {index}")
                indicators.append({"id": f"{key}-{index - 3}", "label": values[0], "levels": values[1:]})
            competencies[key] = indicators
    if set(competencies) != set(CRITERIA.values()) or sum(map(len, competencies.values())) != 49:
        raise ValueError("Oczekiwano 14 kompetencji i 49 wskaźników.")
    version = hashlib.sha256(WORKBOOK.read_bytes()).hexdigest()
    OUTPUT.parent.mkdir(exist_ok=True)
    OUTPUT.write_text(json.dumps({"version": version, "competencies": competencies},
                                 ensure_ascii=False), encoding="utf-8")
    print("Model MC gotowy: 14 kompetencji, 49 wskaźników, 245 opisów.")


if __name__ == "__main__":
    import_model()
