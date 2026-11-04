from pathlib import Path
import re
from datetime import datetime

app_path = Path("src/App.tsx")
content = app_path.read_text(encoding="utf-8")

backup = app_path.with_name(
    f"App.tsx.before_fiche_table_{datetime.now():%Y%m%d_%H%M%S}.bak"
)
backup.write_text(content, encoding="utf-8-sig")

fiche_pattern = (
    r"function FicheTable\(\{.*?\n\}\n\n"
    r"(?=function StructureRow)"
)

content, fiche_count = re.subn(
    fiche_pattern, "", content, count=1, flags=re.S
)

empty_pattern = (
    r"function EmptyState\(\{ text \}: \{ text: string \}\) \{.*?\n\}\n\n"
    r"(?=export default App)"
)

content, empty_count = re.subn(
    empty_pattern, "", content, count=1, flags=re.S
)

if fiche_count != 1 or empty_count != 1:
    print("ERREUR : extraction incomplète.")
    print(f"FicheTable trouvé : {fiche_count}")
    print(f"EmptyState trouvé : {empty_count}")
    print(f"Copie de sécurité conservée : {backup}")
    raise SystemExit("App.tsx n'a pas été modifié.")

content = content.replace(
    "import FicheActions from './FicheActions'\n", ""
)

imports = [
    "import FicheTable from './components/fiches/FicheTable'",
    "import EmptyState from './components/shared/EmptyState'",
]

for line in imports:
    if line not in content:
        content = content.replace(
            "import PreventionBanner from './components/dashboard/PreventionBanner'\n",
            "import PreventionBanner from './components/dashboard/PreventionBanner'\n"
            + line + "\n",
            1,
        )

app_path.write_text(content, encoding="utf-8-sig")

print("FicheTable et EmptyState extraits avec succès.")
print(f"Copie de sécurité : {backup}")
