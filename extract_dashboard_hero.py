from pathlib import Path
import re

path = Path("src/App.tsx")
content = path.read_text(encoding="utf-8")

pattern = (
    r"function DashboardHero\(\{ onSeeDashboard \}: "
    r"\{ onSeeDashboard: \(\) => void \}\) \{.*?\n\}\n\n"
    r"(?=function formatNotificationDate)"
)

content, count = re.subn(pattern, "", content, count=1, flags=re.S)

if count != 1:
    raise SystemExit(
        "ERREUR : DashboardHero n'a pas été extrait. "
        "App.tsx n'a pas été enregistré."
    )

import_line = "import DashboardHero from './components/dashboard/DashboardHero'"

if import_line not in content:
    content = content.replace(
        "import EvolutionPanel from './components/dashboard/EvolutionPanel'",
        "import EvolutionPanel from './components/dashboard/EvolutionPanel'\n" + import_line,
        1,
    )

path.write_text(content, encoding="utf-8")
print("DashboardHero extrait avec succès.")
