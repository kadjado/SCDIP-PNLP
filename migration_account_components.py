from pathlib import Path
import re

path = Path("src/App.tsx")
content = path.read_text(encoding="utf-8-sig")

# Extraire ProfilePage
content, profile_count = re.subn(
    r"(?ms)^function ProfilePage\(.*?(?=^function HelpPage\(\))",
    "",
    content,
    count=1,
)

# Extraire HelpPage, avec ou sans point-virgule à l'export
content, help_count = re.subn(
    r"(?ms)^function HelpPage\(\).*?(?=^export default App\s*;?\s*$)",
    "",
    content,
    count=1,
)

if profile_count != 1 or help_count != 1:
    raise SystemExit(
        f"Migration annulée : ProfilePage={profile_count}, HelpPage={help_count}"
    )

# Vérifier que ComingSoon est conservé
if "function ComingSoon(" not in content:
    raise SystemExit("Migration annulée : ComingSoon introuvable.")

# Ajouter les imports
anchor = "import StructurePanel from './components/structures/StructurePanel'"

if anchor not in content:
    raise SystemExit("Migration annulée : import StructurePanel introuvable.")

content = content.replace(
    anchor,
    anchor
    + "\nimport ProfilePage from './components/account/ProfilePage'"
    + "\nimport HelpPage from './components/account/HelpPage'",
    1,
)

# Retirer User des imports de types
content, user_count = re.subn(
    r"(?m)^\s*User,\s*\n",
    "",
    content,
    count=1,
)

if user_count != 1:
    raise SystemExit("Migration annulée : import User non identifié.")

path.write_text(content, encoding="utf-8")
print("Migration réussie : ProfilePage et HelpPage sont extraits.")
