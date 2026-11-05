
import { useCallback, useEffect, useState } from "react";
import { api } from "../../services/api";
import "./ReportsCenter.css";

type Periodicite = "jour" | "semaine" | "mois" | "annee";

type StatistiquesRapport = {
  filtres: {
    date_debut: string | null;
    date_fin: string | null;
    periodicite: Periodicite;
  };
  indicateurs: {
    total_fiches: number;
    paludisme_simple: number;
    paludisme_grave: number;
    non_confirmes: number;
    autres_diagnostics: number;
    cas_confirmes: number;
    hospitalisations: number;
    tdr_realises: number;
    guerisons_hospitalisation: number;
    deces_hospitalisation: number;
    issues_hospitalisation_cloturees: number;
    taux_guerison_issues_cloturees: number;
    taux_deces_issues_cloturees: number;
  };
  repartitions: {
    diagnostics: Record<string, number>;
    issues_hospitalisation: Record<string, number>;
    grossesses: Record<string, number>;
    resultats_tdr: Record<string, number>;
    sexes: Record<string, number>;
  };
  evolution: {
    periode: string;
    total: number;
  }[];
};

type LigneRegion = {
  region_id: number;
  region_code: string;
  region: string;
  total_fiches: number;
};

type LignePrefecture = {
  region_id: number;
  region: string;
  prefecture_id: number;
  prefecture_code: string;
  prefecture: string;
  total_fiches: number;
};

type LigneCommune = {
  prefecture_id: number;
  prefecture: string;
  commune_id: number;
  commune_code: string;
  commune: string;
  total_fiches: number;
};

type LigneFormationSanitaire = {
  commune_id: number;
  commune: string;
  formation_sanitaire_id: number;
  formation_sanitaire_code: string;
  formation_sanitaire: string;
  type_fs: "USP" | "CMS" | "Hôpital";
  total_fiches: number;
};

type StatistiquesGeographiques = {
  filtres: {
    date_debut: string | null;
    date_fin: string | null;
  };
  indicateurs: {
    total_fiches: number;
  };
  repartition_geographique: {
    regions: LigneRegion[];
    prefectures: LignePrefecture[];
    communes: LigneCommune[];
    formations_sanitaires: LigneFormationSanitaire[];
  };
};

const EMPTY_GEO: StatistiquesGeographiques = {
  filtres: {
    date_debut: null,
    date_fin: null,
  },
  indicateurs: {
    total_fiches: 0,
  },
  repartition_geographique: {
    regions: [],
    prefectures: [],
    communes: [],
    formations_sanitaires: [],
  },
};

type ReportsCenterProps = {
  token: string;
};

const number = (value: number) =>
  new Intl.NumberFormat("fr-FR").format(value ?? 0);

const percentage = (value: number) =>
  `${(value ?? 0).toLocaleString("fr-FR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })} %`;

function formatDate(value: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function dateLocale(daysAgo: number) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const EMPTY_STATS: StatistiquesRapport = {
  filtres: {
    date_debut: null,
    date_fin: null,
    periodicite: "mois",
  },
  indicateurs: {
    total_fiches: 0,
    paludisme_simple: 0,
    paludisme_grave: 0,
    non_confirmes: 0,
    autres_diagnostics: 0,
    cas_confirmes: 0,
    hospitalisations: 0,
    tdr_realises: 0,
    guerisons_hospitalisation: 0,
    deces_hospitalisation: 0,
    issues_hospitalisation_cloturees: 0,
    taux_guerison_issues_cloturees: 0,
    taux_deces_issues_cloturees: 0,
  },
  repartitions: {
    diagnostics: {},
    issues_hospitalisation: {},
    grossesses: {},
    resultats_tdr: {},
    sexes: {},
  },
  evolution: [],
};

export default function ReportsCenter({ token }: ReportsCenterProps) {
  const [stats, setStats] = useState<StatistiquesRapport>(EMPTY_STATS);
  const [geoStats, setGeoStats] =
  useState<StatistiquesGeographiques>(EMPTY_GEO);

  const [niveauGeo, setNiveauGeo] = useState<
    "regions" | "prefectures" | "communes" | "formations_sanitaires"
  >("regions");

  const [regionSelectionnee, setRegionSelectionnee] =
    useState<number | null>(null);

  const [prefectureSelectionnee, setPrefectureSelectionnee] =
    useState<number | null>(null);

  const [communeSelectionnee, setCommuneSelectionnee] =
    useState<number | null>(null);
  const [dateDebut, setDateDebut] = useState(dateLocale(30));
  const [dateFin, setDateFin] = useState(dateLocale(0));
  const [periodicite, setPeriodicite] =
    useState<Periodicite>("jour");
  const [section, setSection] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const chargerStatistiques = useCallback(async () => {
    if (!token) {
      setError("Session utilisateur indisponible.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams();

      if (dateDebut) params.set("date_debut", dateDebut);
      if (dateFin) params.set("date_fin", dateFin);

      params.set("periodicite", periodicite);

      const query = params.toString();

      const [resultat, resultatGeo] = await Promise.all([
        api<StatistiquesRapport>(
          `/api/v1/rapports/statistiques?${query}`,
          token
        ),

        api<StatistiquesGeographiques>(
          `/api/v1/rapports/geographie?${query}`,
          token
        ),
      ]);

      setStats(resultat);
      setGeoStats(resultatGeo);

      setStats(resultat);
    } catch (err) {
      console.error("Erreur de chargement des rapports :", err);

      setError(
        err instanceof Error
          ? err.message
          : "Impossible de charger les statistiques."
      );
    } finally {
      setLoading(false);
    }
  }, [token, dateDebut, dateFin, periodicite]);

  useEffect(() => {
    chargerStatistiques();
  }, [chargerStatistiques]);

  const resetFiltres = () => {
    setDateDebut(dateLocale(30));
    setDateFin(dateLocale(0));
    setPeriodicite("jour");
  };

  const indicateurs = stats.indicateurs;
  const repartitions = stats.repartitions;
  const evolution = stats.evolution;

  const maximumEvolution = Math.max(
    ...evolution.map((item) => item.total),
    1
  );

  const points = evolution.map((item, index) => {
    const x =
      evolution.length <= 1
        ? 300
        : (index / (evolution.length - 1)) * 600;

    const y = 195 - (item.total / maximumEvolution) * 175;

    return { ...item, x, y };
  });

  const ligne = points
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const aire = points.length
    ? `0,195 ${ligne} 600,195`
    : "";

  return (
    <main className="sc-report">
      <header className="sc-head">
        <div>
          <small>SCDIP · PNLP</small>
          <h1>Centre de rapports</h1>
          <p>
            Analyse des données et surveillance épidémiologique
            du paludisme
          </p>
        </div>

        <div className="sc-head-actions">
          <span className="sc-demo">
            <i />
            Données réelles
          </span>

          <button onClick={() => window.print()}>
            ↧ Exporter / Imprimer
          </button>
        </div>
      </header>

      <section className="sc-filters">
        <label>
          Date de début
          <input
            type="date"
            value={dateDebut}
            max={dateFin || undefined}
            onChange={(event) => setDateDebut(event.target.value)}
          />
        </label>

        <label>
          Date de fin
          <input
            type="date"
            value={dateFin}
            min={dateDebut || undefined}
            onChange={(event) => setDateFin(event.target.value)}
          />
        </label>

        <label>
          Périodicité
          <select
            value={periodicite}
            onChange={(event) =>
              setPeriodicite(event.target.value as Periodicite)
            }
          >
            <option value="jour">Par jour</option>
            <option value="semaine">Par semaine</option>
            <option value="mois">Par mois</option>
            <option value="annee">Par année</option>
          </select>
        </label>

        <button className="soft" onClick={resetFiltres}>
          ↺ Réinitialiser
        </button>

        <button onClick={chargerStatistiques} disabled={loading}>
          {loading ? "Chargement..." : "↻ Actualiser"}
        </button>
      </section>

      <nav className="sc-tabs">
        <button
          className={section === "overview" ? "active" : ""}
          onClick={() => setSection("overview")}
        >
          Vue d’ensemble
        </button>
        <button
          className={section === "geography" ? "active" : ""}
          onClick={() => setSection("geography")}
        >
          Répartition géographique
        </button>
        <button
          className={section === "method" ? "active" : ""}
          onClick={() => setSection("method")}
        >
          Méthodologie
        </button>
      </nav>

      {error && (
        <div className="sc-panel" role="alert">
          <h3>Erreur de chargement</h3>
          <p>{error}</p>
          <button onClick={chargerStatistiques}>
            Réessayer
          </button>
        </div>
      )}

      {loading && !error && (
        <div className="sc-panel">
          <p>Chargement des statistiques depuis le serveur...</p>
        </div>
      )}

      {!loading && !error && section === "overview" && (
        <>
          <div className="sc-insight">
            <b>Période analysée</b>
            <p>
              {dateDebut
                ? formatDate(dateDebut)
                : "Depuis le début"}
              {" — "}
              {dateFin
                ? formatDate(dateFin)
                : "Jusqu'à aujourd'hui"}
            </p>
          </div>

          <section className="sc-kpis">
            <Kpi
              title="Fiches enregistrées"
              value={number(indicateurs.total_fiches)}
              detail="Total des fiches accessibles"
              color="blue"
            />

            <Kpi
              title="Cas confirmés"
              value={number(indicateurs.cas_confirmes)}
              detail="Paludisme simple et grave"
              color="green"
            />

            <Kpi
              title="Non confirmés"
              value={number(indicateurs.non_confirmes)}
              detail="Diagnostic non confirmé"
              color="amber"
            />

            <Kpi
              title="Hospitalisations"
              value={number(indicateurs.hospitalisations)}
              detail="Patients hospitalisés"
              color="red"
            />
          </section>

          <section className="sc-grid">
            <article className="sc-panel">
              <PanelHead
                eyebrow="DIAGNOSTICS"
                title="Répartition des diagnostics"
                subtitle="Nombre de fiches par catégorie diagnostique"
              />

              <Distribution data={repartitions.diagnostics} />
            </article>

            <article className="sc-panel">
              <PanelHead
                eyebrow="SUIVI TEMPOREL"
                title="Évolution des fiches"
                subtitle={`Nombre de fiches par ${
                  periodicite === "jour"
                    ? "jour"
                    : periodicite === "semaine"
                    ? "semaine"
                    : periodicite === "mois"
                    ? "mois"
                    : "année"
                }`}
              />

              {evolution.length === 0 ? (
                <Empty message="Aucune donnée d'évolution pour cette période." />
              ) : (
                <>
                  <div className="sc-line-chart">
                    <div className="ylabels">
                      <span>{number(maximumEvolution)}</span>
                      <span>{number(Math.round(maximumEvolution * 0.66))}</span>
                      <span>{number(Math.round(maximumEvolution * 0.33))}</span>
                      <span>0</span>
                    </div>

                    <div className="chart-area">
                      <div className="gridlines">
                        <i />
                        <i />
                        <i />
                        <i />
                      </div>

                      <svg
                        viewBox="0 0 600 210"
                        preserveAspectRatio="none"
                        role="img"
                        aria-label="Évolution des fiches enregistrées"
                      >
                        <polygon className="area" points={aire} />

                        {points.length > 1 && (
                          <polyline className="line" points={ligne} />
                        )}

                        {points.map((point, index) => (
                          <circle
                            key={`${point.periode}-${index}`}
                            cx={point.x}
                            cy={point.y}
                            r="4"
                          >
                            <title>
                              {formatDate(point.periode)} :{" "}
                              {number(point.total)} fiches
                            </title>
                          </circle>
                        ))}
                      </svg>

                      <div className="xlabels">
                        {points.map((point, index) => (
                          <span key={`${point.periode}-${index}`}>
                            {formatDate(point.periode)}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="sc-insight">
                    <b>Total sur la période</b>
                    <p>
                      {number(
                        evolution.reduce(
                          (total, item) => total + item.total,
                          0
                        )
                      )}{" "}
                      fiches réparties sur {evolution.length} périodes.
                    </p>
                  </div>
                </>
              )}
            </article>
          </section>

          <section className="sc-grid lower">
            <article className="sc-panel">
              <PanelHead
                eyebrow="DÉPISTAGE"
                title="Résultats des TDR"
                subtitle={`${number(indicateurs.tdr_realises)} tests réalisés`}
              />

              <Distribution data={repartitions.resultats_tdr} />
            </article>

            <article className="sc-panel">
              <PanelHead
                eyebrow="HOSPITALISATION"
                title="Issues d'hospitalisation"
                subtitle={`${number(
                  indicateurs.issues_hospitalisation_cloturees
                )} issues clôturées`}
              />

              <Distribution data={repartitions.issues_hospitalisation} />

              <div className="sc-insight">
                <b>Taux parmi les issues clôturées</b>
                <p>
                  Guérison :{" "}
                  {percentage(
                    indicateurs.taux_guerison_issues_cloturees
                  )}
                </p>
                <p>
                  Décès :{" "}
                  {percentage(
                    indicateurs.taux_deces_issues_cloturees
                  )}
                </p>
              </div>
            </article>
          </section>

          <section className="sc-grid lower">
            <article className="sc-panel">
              <PanelHead
                eyebrow="RÉPARTITION"
                title="Répartition par sexe"
                subtitle="Sexe renseigné dans les fiches"
              />
              <Distribution data={repartitions.sexes} />
            </article>

            <article className="sc-panel">
              <PanelHead
                eyebrow="SANTÉ MATERNELLE"
                title="Grossesses"
                subtitle="Répartition des fiches selon la grossesse"
              />
              <Distribution data={repartitions.grossesses} />
            </article>
          </section>

          <article className="sc-panel">
            <PanelHead
              eyebrow="INDICATEURS COMPLÉMENTAIRES"
              title="Synthèse des hospitalisations"
              subtitle="Données issues des fiches accessibles"
            />

            <div className="sc-kpis">
              <Kpi
                title="Guérisons"
                value={number(indicateurs.guerisons_hospitalisation)}
                detail="Issues clôturées"
                color="green"
              />

              <Kpi
                title="Décès"
                value={number(indicateurs.deces_hospitalisation)}
                detail="Issues clôturées"
                color="red"
              />

              <Kpi
                title="TDR réalisés"
                value={number(indicateurs.tdr_realises)}
                detail="Tests effectués"
                color="blue"
              />

              <Kpi
                title="Paludisme grave"
                value={number(indicateurs.paludisme_grave)}
                detail="Diagnostics enregistrés"
                color="amber"
              />
            </div>
          </article>
        </>
      )}
      {!loading && !error && section === "geography" && (
        <section className="sc-panel">
          <PanelHead
            eyebrow="ANALYSE TERRITORIALE"
            title="Répartition géographique des fiches"
            subtitle="Statistiques issues des formations sanitaires accessibles"
          />

          <div className="sc-insight">
            <b>Total des fiches géographiques</b>
            <p>
              {number(geoStats.indicateurs.total_fiches)} fiches enregistrées
              dans le périmètre autorisé.
            </p>
          </div>

          <div className="sc-tabs">
            <button
              className={niveauGeo === "regions" ? "active" : ""}
              onClick={() => {
                setNiveauGeo("regions");
                setRegionSelectionnee(null);
                setPrefectureSelectionnee(null);
                setCommuneSelectionnee(null);
              }}
            >
              Régions
            </button>

            <button
              className={niveauGeo === "prefectures" ? "active" : ""}
              onClick={() => setNiveauGeo("prefectures")}
            >
              Préfectures
            </button>

            <button
              className={niveauGeo === "communes" ? "active" : ""}
              onClick={() => setNiveauGeo("communes")}
            >
              Communes
            </button>

            <button
              className={niveauGeo === "formations_sanitaires" ? "active" : ""}
              onClick={() => setNiveauGeo("formations_sanitaires")}
            >
              Formations sanitaires
            </button>
          </div>

          {niveauGeo === "regions" && (
            <GeographieTable
              title="Fiches par région"
              rows={geoStats.repartition_geographique.regions.map((item) => ({
                id: item.region_id,
                nom: item.region,
                code: item.region_code,
                total: item.total_fiches,
              }))}
              onSelect={(id) => {
                setRegionSelectionnee(id);
                setNiveauGeo("prefectures");
              }}
            />
          )}

          {niveauGeo === "prefectures" && (
            <>
              <button
                className="soft"
                onClick={() => {
                  setNiveauGeo("regions");
                  setRegionSelectionnee(null);
                  setPrefectureSelectionnee(null);
                }}
              >
                ← Retour aux régions
              </button>

              <GeographieTable
                title="Fiches par préfecture"
                rows={geoStats.repartition_geographique.prefectures
                  .filter((item) =>
                    regionSelectionnee === null ||
                    item.region_id === regionSelectionnee
                  )
                  .map((item) => ({
                    id: item.prefecture_id,
                    nom: item.prefecture,
                    code: item.prefecture_code,
                    total: item.total_fiches,
                  }))}
                onSelect={(id) => {
                  setPrefectureSelectionnee(id);
                  setNiveauGeo("communes");
                }}
              />
            </>
          )}

          {niveauGeo === "communes" && (
            <>
              <button
                className="soft"
                onClick={() => setNiveauGeo("prefectures")}
              >
                ← Retour aux préfectures
              </button>

              <GeographieTable
                title="Fiches par commune"
                rows={geoStats.repartition_geographique.communes
                  .filter((item) =>
                    prefectureSelectionnee === null ||
                    item.prefecture_id === prefectureSelectionnee
                  )
                  .map((item) => ({
                    id: item.commune_id,
                    nom: item.commune,
                    code: item.commune_code,
                    total: item.total_fiches,
                  }))}
                onSelect={(id) => {
                  setCommuneSelectionnee(id);
                  setNiveauGeo("formations_sanitaires");
                }}
              />
            </>
          )}

          {niveauGeo === "formations_sanitaires" && (
            <>
              <button
                className="soft"
                onClick={() => setNiveauGeo("communes")}
              >
                ← Retour aux communes
              </button>

              <div className="bars">
                {geoStats.repartition_geographique.formations_sanitaires
                  .filter((item) =>
                    communeSelectionnee === null ||
                    item.commune_id === communeSelectionnee
                  )
                  .map((item) => (
                    <div
                      className="bar-row"
                      key={item.formation_sanitaire_id}
                    >
                      <span>
                        {item.formation_sanitaire}
                        <small>
                          {" "}· {item.type_fs} · {item.commune}
                        </small>
                      </span>

                      <div>
                        <i
                          style={{
                            width: `${
                              (item.total_fiches /
                                Math.max(
                                  ...geoStats.repartition_geographique
                                    .formations_sanitaires.map(
                                      (fs) => fs.total_fiches
                                    ),
                                  1
                                )) * 100
                            }%`,
                          }}
                        />
                      </div>

                      <b>{number(item.total_fiches)}</b>
                    </div>
                  ))}
              </div>

              {geoStats.repartition_geographique.formations_sanitaires
                .filter((item) =>
                  communeSelectionnee === null ||
                  item.commune_id === communeSelectionnee
                ).length === 0 && (
                <Empty message="Aucune formation sanitaire avec des fiches pour cette sélection." />
              )}
            </>
          )}
        </section>
      )}
      {!loading && !error && section === "method" && (
        <article className="sc-panel method">
          <small>RÈGLES D’INTERPRÉTATION</small>
          <h2>Comment lire les indicateurs</h2>

          <div className="method-grid">
            {[
              [
                "1. Fiches enregistrées",
                "Nombre de fiches accessibles à l'utilisateur connecté sur la période sélectionnée.",
              ],
              [
                "2. Cas confirmés",
                "Somme des diagnostics Paludisme simple et Paludisme grave enregistrés dans les fiches.",
              ],
              [
                "3. Cas non confirmés",
                "Nombre de fiches dont le diagnostic est Non confirmé. Cette catégorie ne représente pas nécessairement tous les cas suspects.",
              ],
              [
                "4. Hospitalisations",
                "Nombre de fiches dont le champ hospitalisé est vrai.",
              ],
              [
                "5. Taux de guérison et de décès",
                "Ces taux sont calculés uniquement sur les issues d'hospitalisation clôturées. Ils ne représentent pas les taux globaux de mortalité ou de guérison de la population.",
              ],
              [
                "6. Évolution",
                "Nombre de fiches regroupées selon la périodicité choisie : jour, semaine, mois ou année.",
              ],
              [
                "7. Résultats TDR",
                "Répartition des résultats TDR enregistrés dans les fiches. Elle ne doit pas être confondue avec la répartition de tous les diagnostics.",
              ],
              [
                "8. Limites géographiques",
                "Les statistiques respectent les droits d'accès géographiques de l'utilisateur connecté. Les comparaisons régionales nécessiteront un endpoint dédié.",
              ],
            ].map(([title, text]) => (
              <div key={title}>
                <h3>{title}</h3>
                <p>{text}</p>
              </div>
            ))}
          </div>

          <div className="method-warning">
            <b>Important — interprétation épidémiologique</b>
            <p>
              Les volumes de fiches ne suffisent pas à confirmer une
              épidémie. Les taux rapportés à la population nécessitent
              des dénominateurs officiels. Les alertes doivent reposer
              sur des seuils validés par le PNLP.
            </p>
          </div>
        </article>
      )}

      <footer className="sc-footer">
        <span>SCDIP-PNLP · Centre de rapports</span>
        <span>Statistiques issues du serveur</span>
      </footer>
    </main>
  );
}

function Kpi({
  title,
  value,
  detail,
  color,
}: {
  title: string;
  value: string;
  detail: string;
  color: string;
}) {
  return (
    <article className="sc-kpi">
      <i className={color}>
        {color === "blue"
          ? "▤"
          : color === "green"
          ? "✓"
          : color === "amber"
          ? "◷"
          : "⌖"}
      </i>
      <div>
        <p>{title}</p>
        <b>{value}</b>
        <small>{detail}</small>
      </div>
    </article>
  );
}

function PanelHead({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="panel-head">
      <div>
        <small>{eyebrow}</small>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </div>
      <span className="pill">Données réelles</span>
    </div>
  );
}

function Distribution({
  data,
}: {
  data: Record<string, number>;
}) {
  const entries = Object.entries(data).sort(
    ([, a], [, b]) => b - a
  );

  const total = entries.reduce((sum, [, value]) => sum + value, 0);

  if (entries.length === 0 || total === 0) {
    return <Empty message="Aucune donnée disponible pour cette répartition." />;
  }

  return (
    <div className="bars">
      {entries.map(([label, value]) => (
        <div className="bar-row" key={label}>
          <span>{label}</span>
          <div>
            <i
              style={{
                width: `${(value / total) * 100}%`,
              }}
            />
          </div>
          <b>{number(value)}</b>
        </div>
      ))}

      <p className="footnote">
        Total : {number(total)} enregistrements.
      </p>
    </div>
  );
}

function Empty({ message }: { message: string }) {
  return (
    <div className="sc-insight">
      <p>{message}</p>
    </div>
  );
}

function GeographieTable({
  title,
  rows,
  onSelect,
}: {
  title: string;
  rows: {
    id: number;
    nom: string;
    code: string;
    total: number;
  }[];
  onSelect: (id: number) => void;
}) {
  const total = rows.reduce((sum, row) => sum + row.total, 0);

  if (rows.length === 0) {
    return (
      <>
        <h3>{title}</h3>
        <Empty message="Aucune donnée géographique disponible pour cette période." />
      </>
    );
  }

  return (
    <div>
      <PanelHead
        eyebrow="DÉTAIL TERRITORIAL"
        title={title}
        subtitle={`${number(rows.length)} territoires · ${number(total)} fiches`}
      />

      <div className="bars">
        {rows
          .slice()
          .sort((a, b) => b.total - a.total)
          .map((row) => (
            <button
              type="button"
              className="bar-row"
              key={row.id}
              onClick={() => onSelect(row.id)}
              style={{
                width: "100%",
                textAlign: "left",
                cursor: "pointer",
              }}
              title={`Consulter les détails de ${row.nom}`}
            >
              <span>
                {row.nom}
                <small> · {row.code}</small>
              </span>

              <div>
                <i
                  style={{
                    width: `${
                      (row.total /
                        Math.max(...rows.map((item) => item.total), 1)) *
                      100
                    }%`,
                  }}
                />
              </div>

              <b>{number(row.total)}</b>
            </button>
          ))}
      </div>
    </div>
  );
}
