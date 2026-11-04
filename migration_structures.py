from pathlib import Path
from datetime import datetime
import re

app_path = Path("src/App.tsx")
content = app_path.read_text(encoding="utf-8-sig")

backup = app_path.with_name(
    f"App.tsx.before_structures_{datetime.now():%Y%m%d_%H%M%S}.bak"
)
backup.write_text(content, encoding="utf-8-sig")

patterns = [
    r"function StructureRow\(\{.*?\n\}\n\n(?=function StructurePanel)",
    r"function StructurePanel\(\{.*?\n\}\n\n(?=function ComingSoon)",
]

for pattern in patterns:
    content, count = re.subn(pattern, "", content, count=1, flags=re.S)
    if count != 1:
        print("ERREUR : extraction incomplète.")
        print(f"Copie de sécurité : {backup}")
        raise SystemExit("App.tsx n'a pas été modifié.")

imports = [
    "import StructureRow from './components/structures/StructureRow'",
    "import StructurePanel from './components/structures/StructurePanel'",
]

anchor = "import FicheTable from './components/fiches/FicheTable'\n"

if anchor not in content:
    raise SystemExit("Import FicheTable introuvable. App.tsx non modifié.")

for line in imports:
    if line not in content:
        anchor += line + "\n"

content = content.replace(
    "import FicheTable from './components/fiches/FicheTable'\n",
    anchor,
    1,
)

app_path.write_text(content, encoding="utf-8-sig")

print("StructureRow et StructurePanel extraits avec succès.")
print(f"Copie de sécurité : {backup}")
