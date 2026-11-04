from pathlib import Path
import re

app_path = Path("src/App.tsx")
app = app_path.read_text(encoding="utf-8")

match = re.search(
    r"function Icon\(\{ name \}: \{ name: string \}\) \{.*?\n\}",
    app,
    re.S,
)

if not match:
    raise SystemExit("ERREUR : fonction Icon introuvable. Aucun fichier modifié.")

icon_code = match.group(0)
Path("src/components/shared/Icon.tsx").write_text(
    icon_code + "\n\nexport default Icon\n",
    encoding="utf-8",
)

print("Icon.tsx créé avec le composant existant.")
