from pathlib import Path
from datetime import datetime
import re
import shutil

root = Path("src")
app_path = root / "App.tsx"
main_path = root / "main.tsx"
push_path = root / "contexts" / "PushContext.tsx"

for path in (app_path, main_path, push_path):
    if not path.exists():
        raise SystemExit(f"Fichier introuvable : {path}")

app = app_path.read_text(encoding="utf-8")
main = main_path.read_text(encoding="utf-8")
push = push_path.read_text(encoding="utf-8")

# Vérifier que les fichiers correspondent bien à l'état attendu.
required_app = [
    "const logout = useCallback(async () => {",
    "const updateUnreadNotifications = useCallback",
    "async function handleActivatePush()",
    "const verifierEtatNotifications = useCallback",
    "onUnreadCountChange={updateUnreadNotifications}",
]
for marker in required_app:
    if marker not in app:
        raise SystemExit(f"Migration interrompue : bloc attendu absent : {marker}")

if "export function PushProvider" not in push:
    raise SystemExit("PushProvider introuvable.")

if "const { token } = useAuth()" not in push:
    raise SystemExit("PushContext ne semble pas utiliser AuthContext.")

# Sauvegarde horodatée des trois fichiers concernés.
stamp = datetime.now().strftime("%Y%m%d_%H%M%S")
backup = Path(f"backup_push_context_{stamp}")
backup.mkdir()
shutil.copy2(app_path, backup / "App.tsx")
shutil.copy2(main_path, backup / "main.tsx")
shutil.copy2(push_path, backup / "PushContext.tsx")

# Corriger les erreurs Push : journaliser sans relancer une exception.
push = push.replace(
"""    } catch (error) {
      console.error('Erreur activation notifications :', error)
      throw error
    } finally {""",
"""    } catch (error) {
      console.error('Erreur activation notifications :', error)
    } finally {"""
)
push = push.replace(
"""    } catch (error) {
      console.error('Erreur désactivation notifications :', error)
      throw error
    } finally {""",
"""    } catch (error) {
      console.error('Erreur désactivation notifications :', error)
    } finally {"""
)

# Enregistrer le contexte corrigé.
push_path.write_text(push, encoding="utf-8")

# Ajouter usePush dans App.tsx.
app = app.replace(
"import { useAuth } from './contexts/AuthContext'",
"import { useAuth } from './contexts/AuthContext'\nimport { usePush } from './contexts/PushContext'",
1
)

# Retirer les imports Push devenus inutiles.
app = re.sub(
r"\nimport \{\n  activatePushNotifications,\n  listenToForegroundMessages,\n  obtenirJetonPushExistant,\n\} from './pushNotifications'\n",
"\n",
app,
count=1
)

# Récupérer les états depuis PushContext.
app = app.replace(
"""  } = useAuth()

  const page: Page""",
"""  } = useAuth()

  const {
    pushEnabled,
    pushBusy,
    unreadNotifications,
    setUnreadNotifications,
    activatePush,
    disablePush,
    disablePushForLogout,
  } = usePush()

  const page: Page""",
1
)

# Supprimer les anciens états locaux Push.
app, count = re.subn(
r"\n  const \[unreadNotifications, setUnreadNotifications\] = useState\(0\)\n"
r"  const \[pushBusy, setPushBusy\] = useState\(false\)\n"
r"\s*const \[pushEnabled, setPushEnabled\] = useState\(\(\) => \{\n"
r".*?\n  \}\)\n",
"\n",
app,
count=1,
flags=re.S
)
if count != 1:
    raise SystemExit("Impossible de retirer les anciens états Push.")

# Remplacer la déconnexion.
start = app.index("  const logout = useCallback(async () => {")
end_marker = "  }, [token, clearSession])"
end = app.index(end_marker, start) + len(end_marker)

new_logout = """  const logout = useCallback(async () => {
    await disablePushForLogout()
    clearSession()
    setFiches([])
    setUsers([])
  }, [disablePushForLogout, clearSession])"""

app = app[:start] + new_logout + app[end:]

# Retirer le callback local et les trois anciens effets Push,
# jusqu'à l'effet de contrôle des pages superviseur.
start_marker = "  const updateUnreadNotifications = useCallback"
start = app.index(start_marker)

end_marker = "  useEffect(() => {\n      if (\n  isSupervisor"
end = app.index(end_marker, start)

app = app[:start] + app[end:]

# Supprimer le handler local de changement de page Push.
app = app.replace(
"""              onUnreadCountChange={updateUnreadNotifications}""",
"""              onUnreadCountChange={setUnreadNotifications}""",
1
)

# Remplacer les anciens handlers par ceux du contexte.
app = app.replace(
"""                  void handleDisablePush()""",
"""                  void disablePush()""",
1
)
app = app.replace(
"""                  void handleActivatePush()""",
"""                  void activatePush()""",
1
)

# Vérifier qu'aucune ancienne référence ne subsiste.
for obsolete in (
    "setPushEnabled",
    "setPushBusy",
    "handleActivatePush",
    "handleDisablePush",
    "verifierEtatNotifications",
    "obtenirJetonPushExistant",
    "listenToForegroundMessages",
    "activatePushNotifications",
    "updateUnreadNotifications",
):
    if obsolete in app:
        raise SystemExit(f"Ancienne référence encore présente dans App.tsx : {obsolete}")

# Installer PushProvider à l'intérieur de AuthProvider.
if "import { AuthProvider } from './contexts/AuthContext'" not in main:
    raise SystemExit("Import AuthProvider introuvable dans main.tsx.")

main = main.replace(
"import { AuthProvider } from './contexts/AuthContext'",
"import { AuthProvider } from './contexts/AuthContext'\nimport { PushProvider } from './contexts/PushContext'",
1
)

main = main.replace(
"""      <AuthProvider>
        <App />
      </AuthProvider>""",
"""      <AuthProvider>
        <PushProvider>
          <App />
        </PushProvider>
      </AuthProvider>""",
1
)

if "<PushProvider>" not in main:
    raise SystemExit("Installation de PushProvider non confirmée.")

# Écrire seulement après validation de toutes les transformations.
app_path.write_text(app, encoding="utf-8")
main_path.write_text(main, encoding="utf-8")

print("Migration PushContext effectuée.")
print(f"Sauvegarde créée : {backup}")
print("Fichiers modifiés :")
print("- src/contexts/PushContext.tsx")
print("- src/App.tsx")
print("- src/main.tsx")
