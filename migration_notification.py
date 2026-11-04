from pathlib import Path
import re

app_path = Path("src/App.tsx")
content = app_path.read_text(encoding="utf-8")

pattern = (
    r"function formatNotificationDate\(raw\?: string\) \{.*?"
    r"\n\}\n\n"
    r"function NotificationPanel\(.*?\n\}\n\n"
    r"(?=function PreventionBanner)"
)

content, count = re.subn(pattern, "", content, count=1, flags=re.S)

if count != 1:
    raise SystemExit(
        "ERREUR : le bloc NotificationPanel n'a pas été trouvé "
        "exactement à l'emplacement attendu. App.tsx n'a pas été modifié."
    )

import_line = "import NotificationPanel from './components/dashboard/NotificationPanel'\n"

if import_line.strip() not in content:
    anchor = "import DashboardHero from './components/dashboard/DashboardHero'\n"
    if anchor not in content:
        raise SystemExit(
            "ERREUR : import DashboardHero introuvable. "
            "App.tsx n'a pas été modifié."
        )
    content = content.replace(anchor, anchor + import_line, 1)

app_path.write_text(content, encoding="utf-8")
print("NotificationPanel extrait et import ajouté dans App.tsx.")
