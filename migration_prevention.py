from pathlib import Path
import re

app_path = Path("src/App.tsx")
content = app_path.read_text(encoding="utf-8")

pattern = r"function PreventionBanner\(\) \{.*?\n\}\n\n(?=function FicheTable)"

content, count = re.subn(pattern, "", content, count=1, flags=re.S)

if count != 1:
    raise SystemExit(
        "ERREUR : PreventionBanner introuvable ou structure inattendue. "
        "App.tsx n'a pas été modifié."
    )

import_line = "import PreventionBanner from './components/dashboard/PreventionBanner'\n"

if import_line.strip() not in content:
    anchor = "import NotificationPanel from './components/dashboard/NotificationPanel'\n"
    if anchor not in content:
        raise SystemExit(
            "ERREUR : import NotificationPanel introuvable. "
            "App.tsx n'a pas été modifié."
        )
    content = content.replace(anchor, anchor + import_line, 1)

app_path.write_text(content, encoding="utf-8")
print("PreventionBanner extrait avec succès.")
