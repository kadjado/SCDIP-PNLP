from pathlib import Path
import re

path = Path("src/App.tsx")
content = path.read_text(encoding="utf-8")

patterns = [
    r"function Icon\(\{ name \}: \{ name: string \}\) \{.*?\n\}\n\n(?=function DashboardHero)",
    r"function getMonthlyStats\(fiches: Fiche\[\]\) \{.*?\n\}\n\nconst formatNumber = .*?\n\nfunction niceStep\(max: number\) \{.*?\n\}\n\n(?=function KpiCard)",
    r"function KpiCard\(.*?\n\}\n\n(?=function EvolutionPanel)",
    r"function EvolutionPanel\(.*?\n\}\n\n(?=function formatNotificationDate)",
]

for pattern in patterns:
    content, count = re.subn(pattern, "", content, count=1, flags=re.S)
    if count != 1:
        raise SystemExit(
            f"ERREUR : extraction impossible pour le motif {pattern[:55]!r}. "
            "App.tsx n'a pas été enregistré."
        )

imports = """import Icon from './components/shared/Icon'
import KpiCard from './components/dashboard/KpiCard'
import EvolutionPanel from './components/dashboard/EvolutionPanel'
import { getMonthlyStats } from './utils/dashboardStats'
"""

if "from './components/shared/Icon'" not in content:
    content = content.replace(
        "import './App.css'",
        "import './App.css'\n" + imports.rstrip(),
        1,
    )

path.write_text(content, encoding="utf-8")
print("App.tsx mis à jour.")
