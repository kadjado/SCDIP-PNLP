function HelpPage() {
  const questions = [
    ['Comment consulter les fiches ?', 'Ouvrez « Fiches paludisme » dans le menu. La barre de recherche permet de retrouver une fiche, et les boutons Précédent et Suivant de parcourir les pages.'],
    ['Comment créer une fiche ?', 'Les agents de formation sanitaire utilisent le bouton + en haut du registre des fiches, remplissent le formulaire, puis cliquent sur « Enregistrer la fiche ».'],
    ['Comment valider une fiche ?', 'Les superviseurs disposent des actions Valider, Demander correction et Traiter réponse dans la colonne Actions du registre des fiches.'],
    ['Comment activer les notifications ?', 'Cliquez sur la cloche en haut à droite pour activer ou désactiver les notifications sur cet appareil. Les messages non lus apparaissent dans la Messagerie.'],
    ['J’ai oublié mon mot de passe.', 'Veuillez contacter l’administrateur du système pour réinitialiser votre mot de passe.'],
  ]

  return (
    <section className="panel list-panel">
      <div className="help-list">
        {questions.map(([question, answer]) => (
          <details key={question}>
            <summary>{question}</summary>
            <p>{answer}</p>
          </details>
        ))}
      </div>
    </section>
  )
}

export default HelpPage
