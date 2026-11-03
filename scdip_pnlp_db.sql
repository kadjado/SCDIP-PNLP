--
-- PostgreSQL database dump
--

\restrict mnmcBfPJAUKd0VbAhyVyrhHRkENcR1sSzZKCHWuWKC54qZW5zbWPaI7CCpeUurX

-- Dumped from database version 17.11
-- Dumped by pg_dump version 17.11

-- Started on 2026-11-03 06:42:56

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- TOC entry 217 (class 1259 OID 16938)
-- Name: alembic_version; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.alembic_version (
    version_num character varying(32) NOT NULL
);


ALTER TABLE public.alembic_version OWNER TO postgres;

--
-- TOC entry 248 (class 1259 OID 17289)
-- Name: appareils_push; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.appareils_push (
    id integer NOT NULL,
    utilisateur_id integer NOT NULL,
    jeton text NOT NULL,
    plateforme character varying(20) NOT NULL,
    actif boolean DEFAULT true NOT NULL,
    cree_le timestamp with time zone DEFAULT now() NOT NULL,
    mis_a_jour_le timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT ck_appareils_push_plateforme CHECK (((plateforme)::text = ANY ((ARRAY['web'::character varying, 'android'::character varying])::text[])))
);


ALTER TABLE public.appareils_push OWNER TO postgres;

--
-- TOC entry 247 (class 1259 OID 17288)
-- Name: appareils_push_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.appareils_push_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.appareils_push_id_seq OWNER TO postgres;

--
-- TOC entry 5151 (class 0 OID 0)
-- Dependencies: 247
-- Name: appareils_push_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.appareils_push_id_seq OWNED BY public.appareils_push.id;


--
-- TOC entry 225 (class 1259 OID 16977)
-- Name: communes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.communes (
    id integer NOT NULL,
    code character varying(30) NOT NULL,
    libelle character varying(150) NOT NULL,
    prefecture_id integer NOT NULL
);


ALTER TABLE public.communes OWNER TO postgres;

--
-- TOC entry 224 (class 1259 OID 16976)
-- Name: communes_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.communes_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.communes_id_seq OWNER TO postgres;

--
-- TOC entry 5152 (class 0 OID 0)
-- Dependencies: 224
-- Name: communes_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.communes_id_seq OWNED BY public.communes.id;


--
-- TOC entry 238 (class 1259 OID 17157)
-- Name: demandes_correction; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.demandes_correction (
    id integer NOT NULL,
    fiche_id uuid NOT NULL,
    superviseur_id integer NOT NULL,
    motif text NOT NULL,
    statut character varying(30) NOT NULL,
    cree_le timestamp with time zone NOT NULL,
    modifie_le timestamp with time zone NOT NULL,
    CONSTRAINT ck_demande_correction_statut CHECK (((statut)::text = ANY ((ARRAY['ouverte'::character varying, 'reponse_agent'::character varying, 'a_corriger'::character varying, 'acceptee'::character varying])::text[])))
);


ALTER TABLE public.demandes_correction OWNER TO postgres;

--
-- TOC entry 237 (class 1259 OID 17156)
-- Name: demandes_correction_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.demandes_correction_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.demandes_correction_id_seq OWNER TO postgres;

--
-- TOC entry 5153 (class 0 OID 0)
-- Dependencies: 237
-- Name: demandes_correction_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.demandes_correction_id_seq OWNED BY public.demandes_correction.id;


--
-- TOC entry 230 (class 1259 OID 17039)
-- Name: fiches_paludisme; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.fiches_paludisme (
    id uuid NOT NULL,
    numero_fiche character varying(40) NOT NULL,
    formation_sanitaire_id integer NOT NULL,
    date_consultation date NOT NULL,
    num_oc character varying(50) NOT NULL,
    mois integer NOT NULL,
    age integer NOT NULL,
    sexe character varying(1) NOT NULL,
    grossesse character varying(20),
    tpi1 boolean NOT NULL,
    tpi2 character varying(20) NOT NULL,
    type_consultation character varying(30) NOT NULL,
    fievre boolean NOT NULL,
    motif_consultation character varying(255),
    ge_realisee boolean NOT NULL,
    type_ge character varying(30),
    charge_sigep character varying(50),
    tdr_realise boolean NOT NULL,
    type_tdr_id integer,
    resultat_tdr character varying(20),
    numero_laboratoire character varying(50),
    diagnostic character varying(30) NOT NULL,
    asaq boolean NOT NULL,
    arlm boolean NOT NULL,
    quinine_comprime boolean NOT NULL,
    quinine_injectable boolean NOT NULL,
    artesunate_injectable boolean NOT NULL,
    autre_traitement character varying(255),
    hospitalise boolean NOT NULL,
    date_sortie date,
    issue_hospitalisation character varying(30),
    agent_id integer NOT NULL,
    date_saisie timestamp with time zone NOT NULL,
    fonction_agent character varying(150) NOT NULL,
    validation_confirmee boolean NOT NULL,
    version integer NOT NULL,
    cree_le timestamp with time zone NOT NULL,
    modifie_le timestamp with time zone NOT NULL,
    supprime_le timestamp with time zone,
    validee_par_id integer,
    validee_le timestamp with time zone,
    CONSTRAINT ck_fiche_age CHECK (((age >= 0) AND (age <= 120))),
    CONSTRAINT ck_fiche_diagnostic CHECK (((diagnostic)::text = ANY ((ARRAY['Paludisme simple'::character varying, 'Paludisme grave'::character varying, 'Non confirmé'::character varying, 'Autre'::character varying])::text[]))),
    CONSTRAINT ck_fiche_issue CHECK (((issue_hospitalisation IS NULL) OR ((issue_hospitalisation)::text = ANY ((ARRAY['Guéri'::character varying, 'Transféré'::character varying, 'Décédé'::character varying, 'Sorti contre avis'::character varying, 'En cours'::character varying])::text[])))),
    CONSTRAINT ck_fiche_mois CHECK (((mois >= 1) AND (mois <= 12))),
    CONSTRAINT ck_fiche_sexe CHECK (((sexe)::text = ANY ((ARRAY['M'::character varying, 'F'::character varying])::text[]))),
    CONSTRAINT ck_fiche_type_consultation CHECK (((type_consultation)::text = ANY ((ARRAY['Nouveau cas'::character varying, 'Reconsultation'::character varying, 'Référé'::character varying])::text[])))
);


ALTER TABLE public.fiches_paludisme OWNER TO postgres;

--
-- TOC entry 227 (class 1259 OID 16992)
-- Name: formations_sanitaires; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.formations_sanitaires (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    libelle character varying(200) NOT NULL,
    type_fs character varying(20) NOT NULL,
    commune_id integer NOT NULL,
    actif boolean NOT NULL,
    CONSTRAINT ck_fs_type CHECK (((type_fs)::text = ANY ((ARRAY['USP'::character varying, 'CMS'::character varying, 'Hôpital'::character varying, 'Clinique'::character varying, 'Infirmerie'::character varying, 'Autre'::character varying, 'CHR'::character varying, 'CHU'::character varying, 'Cabinet Médical'::character varying, 'Centre de Santé'::character varying])::text[])))
);


ALTER TABLE public.formations_sanitaires OWNER TO postgres;

--
-- TOC entry 226 (class 1259 OID 16991)
-- Name: formations_sanitaires_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.formations_sanitaires_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.formations_sanitaires_id_seq OWNER TO postgres;

--
-- TOC entry 5154 (class 0 OID 0)
-- Dependencies: 226
-- Name: formations_sanitaires_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.formations_sanitaires_id_seq OWNED BY public.formations_sanitaires.id;


--
-- TOC entry 244 (class 1259 OID 17230)
-- Name: historique_affectations_superviseurs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historique_affectations_superviseurs (
    id integer NOT NULL,
    formation_sanitaire_id integer NOT NULL,
    ancien_superviseur_id integer,
    nouveau_superviseur_id integer,
    administrateur_id integer NOT NULL,
    action character varying(30) NOT NULL,
    date_operation timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.historique_affectations_superviseurs OWNER TO postgres;

--
-- TOC entry 243 (class 1259 OID 17229)
-- Name: historique_affectations_superviseurs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historique_affectations_superviseurs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historique_affectations_superviseurs_id_seq OWNER TO postgres;

--
-- TOC entry 5155 (class 0 OID 0)
-- Dependencies: 243
-- Name: historique_affectations_superviseurs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historique_affectations_superviseurs_id_seq OWNED BY public.historique_affectations_superviseurs.id;


--
-- TOC entry 234 (class 1259 OID 17092)
-- Name: historique_modifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historique_modifications (
    id integer NOT NULL,
    fiche_id uuid NOT NULL,
    utilisateur_id integer NOT NULL,
    date_operation timestamp with time zone NOT NULL,
    ancienne_version integer NOT NULL,
    nouvelle_version integer NOT NULL,
    changements json NOT NULL,
    operation character varying(20) NOT NULL
);


ALTER TABLE public.historique_modifications OWNER TO postgres;

--
-- TOC entry 233 (class 1259 OID 17091)
-- Name: historique_modifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historique_modifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historique_modifications_id_seq OWNER TO postgres;

--
-- TOC entry 5156 (class 0 OID 0)
-- Dependencies: 233
-- Name: historique_modifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historique_modifications_id_seq OWNED BY public.historique_modifications.id;


--
-- TOC entry 236 (class 1259 OID 17112)
-- Name: historique_permutations_affectations; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historique_permutations_affectations (
    id integer NOT NULL,
    agent_a_id integer NOT NULL,
    agent_b_id integer NOT NULL,
    administrateur_id integer NOT NULL,
    ancienne_fs_a_id integer NOT NULL,
    nouvelle_fs_a_id integer NOT NULL,
    ancienne_fs_b_id integer NOT NULL,
    nouvelle_fs_b_id integer NOT NULL,
    date_operation timestamp with time zone NOT NULL
);


ALTER TABLE public.historique_permutations_affectations OWNER TO postgres;

--
-- TOC entry 235 (class 1259 OID 17111)
-- Name: historique_permutations_affectations_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historique_permutations_affectations_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historique_permutations_affectations_id_seq OWNER TO postgres;

--
-- TOC entry 5157 (class 0 OID 0)
-- Dependencies: 235
-- Name: historique_permutations_affectations_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historique_permutations_affectations_id_seq OWNED BY public.historique_permutations_affectations.id;


--
-- TOC entry 240 (class 1259 OID 17180)
-- Name: historique_supervision; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.historique_supervision (
    id integer NOT NULL,
    demande_id integer NOT NULL,
    utilisateur_id integer NOT NULL,
    evenement character varying(40) NOT NULL,
    details text,
    cree_le timestamp with time zone NOT NULL
);


ALTER TABLE public.historique_supervision OWNER TO postgres;

--
-- TOC entry 239 (class 1259 OID 17179)
-- Name: historique_supervision_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.historique_supervision_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.historique_supervision_id_seq OWNER TO postgres;

--
-- TOC entry 5158 (class 0 OID 0)
-- Dependencies: 239
-- Name: historique_supervision_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.historique_supervision_id_seq OWNED BY public.historique_supervision.id;


--
-- TOC entry 232 (class 1259 OID 17075)
-- Name: journal_synchronisation; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.journal_synchronisation (
    id integer NOT NULL,
    fiche_id uuid NOT NULL,
    utilisateur_id integer NOT NULL,
    operation_id uuid NOT NULL,
    statut character varying(30) NOT NULL,
    message text,
    cree_le timestamp with time zone NOT NULL
);


ALTER TABLE public.journal_synchronisation OWNER TO postgres;

--
-- TOC entry 231 (class 1259 OID 17074)
-- Name: journal_synchronisation_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.journal_synchronisation_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.journal_synchronisation_id_seq OWNER TO postgres;

--
-- TOC entry 5159 (class 0 OID 0)
-- Dependencies: 231
-- Name: journal_synchronisation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.journal_synchronisation_id_seq OWNED BY public.journal_synchronisation.id;


--
-- TOC entry 246 (class 1259 OID 17262)
-- Name: livraisons_notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.livraisons_notifications (
    id integer NOT NULL,
    notification_id integer,
    fiche_id uuid,
    canal character varying(20) NOT NULL,
    destinataire character varying(255) NOT NULL,
    contenu json NOT NULL,
    statut character varying(20) DEFAULT 'en_attente'::character varying NOT NULL,
    tentatives integer DEFAULT 0 NOT NULL,
    prochaine_tentative timestamp with time zone DEFAULT now() NOT NULL,
    derniere_erreur text,
    cree_le timestamp with time zone DEFAULT now() NOT NULL,
    envoye_le timestamp with time zone,
    CONSTRAINT ck_livraison_notification_canal CHECK (((canal)::text = ANY ((ARRAY['whatsapp'::character varying, 'web_push'::character varying, 'android_push'::character varying])::text[]))),
    CONSTRAINT ck_livraison_notification_statut CHECK (((statut)::text = ANY ((ARRAY['en_attente'::character varying, 'en_cours'::character varying, 'envoyee'::character varying, 'echec'::character varying])::text[])))
);


ALTER TABLE public.livraisons_notifications OWNER TO postgres;

--
-- TOC entry 245 (class 1259 OID 17261)
-- Name: livraisons_notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.livraisons_notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.livraisons_notifications_id_seq OWNER TO postgres;

--
-- TOC entry 5160 (class 0 OID 0)
-- Dependencies: 245
-- Name: livraisons_notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.livraisons_notifications_id_seq OWNED BY public.livraisons_notifications.id;


--
-- TOC entry 242 (class 1259 OID 17208)
-- Name: notifications; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.notifications (
    id integer NOT NULL,
    utilisateur_id integer NOT NULL,
    type character varying(50) NOT NULL,
    titre character varying(160) NOT NULL,
    message text NOT NULL,
    fiche_id uuid,
    cree_le timestamp with time zone NOT NULL,
    lue_le timestamp with time zone
);


ALTER TABLE public.notifications OWNER TO postgres;

--
-- TOC entry 241 (class 1259 OID 17207)
-- Name: notifications_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.notifications_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.notifications_id_seq OWNER TO postgres;

--
-- TOC entry 5161 (class 0 OID 0)
-- Dependencies: 241
-- Name: notifications_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.notifications_id_seq OWNED BY public.notifications.id;


--
-- TOC entry 223 (class 1259 OID 16962)
-- Name: prefectures; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.prefectures (
    id integer NOT NULL,
    code character varying(30) NOT NULL,
    libelle character varying(150) NOT NULL,
    region_id integer NOT NULL
);


ALTER TABLE public.prefectures OWNER TO postgres;

--
-- TOC entry 222 (class 1259 OID 16961)
-- Name: prefectures_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.prefectures_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.prefectures_id_seq OWNER TO postgres;

--
-- TOC entry 5162 (class 0 OID 0)
-- Dependencies: 222
-- Name: prefectures_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.prefectures_id_seq OWNED BY public.prefectures.id;


--
-- TOC entry 219 (class 1259 OID 16944)
-- Name: regions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.regions (
    id integer NOT NULL,
    code character varying(30) NOT NULL,
    libelle character varying(150) NOT NULL
);


ALTER TABLE public.regions OWNER TO postgres;

--
-- TOC entry 218 (class 1259 OID 16943)
-- Name: regions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.regions_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.regions_id_seq OWNER TO postgres;

--
-- TOC entry 5163 (class 0 OID 0)
-- Dependencies: 218
-- Name: regions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.regions_id_seq OWNED BY public.regions.id;


--
-- TOC entry 221 (class 1259 OID 16953)
-- Name: types_tdr; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.types_tdr (
    id integer NOT NULL,
    code character varying(50) NOT NULL,
    libelle character varying(150) NOT NULL,
    actif boolean NOT NULL
);


ALTER TABLE public.types_tdr OWNER TO postgres;

--
-- TOC entry 220 (class 1259 OID 16952)
-- Name: types_tdr_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.types_tdr_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.types_tdr_id_seq OWNER TO postgres;

--
-- TOC entry 5164 (class 0 OID 0)
-- Dependencies: 220
-- Name: types_tdr_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.types_tdr_id_seq OWNED BY public.types_tdr.id;


--
-- TOC entry 229 (class 1259 OID 17008)
-- Name: utilisateurs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.utilisateurs (
    id integer NOT NULL,
    nom character varying(150) NOT NULL,
    prenom character varying(150) NOT NULL,
    email character varying(255) NOT NULL,
    password_hash character varying(255) NOT NULL,
    fonction character varying(150) NOT NULL,
    role character varying(40) NOT NULL,
    formation_sanitaire_id integer,
    commune_id integer,
    prefecture_id integer,
    region_id integer,
    actif boolean NOT NULL,
    cree_le timestamp with time zone NOT NULL,
    telephone character varying(20),
    CONSTRAINT ck_utilisateur_role CHECK (((role)::text = ANY ((ARRAY['agent_fs'::character varying, 'superviseur'::character varying, 'administrateur_national'::character varying])::text[])))
);


ALTER TABLE public.utilisateurs OWNER TO postgres;

--
-- TOC entry 228 (class 1259 OID 17007)
-- Name: utilisateurs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.utilisateurs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.utilisateurs_id_seq OWNER TO postgres;

--
-- TOC entry 5165 (class 0 OID 0)
-- Dependencies: 228
-- Name: utilisateurs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.utilisateurs_id_seq OWNED BY public.utilisateurs.id;


--
-- TOC entry 4839 (class 2604 OID 17292)
-- Name: appareils_push id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appareils_push ALTER COLUMN id SET DEFAULT nextval('public.appareils_push_id_seq'::regclass);


--
-- TOC entry 4823 (class 2604 OID 16980)
-- Name: communes id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communes ALTER COLUMN id SET DEFAULT nextval('public.communes_id_seq'::regclass);


--
-- TOC entry 4829 (class 2604 OID 17160)
-- Name: demandes_correction id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_correction ALTER COLUMN id SET DEFAULT nextval('public.demandes_correction_id_seq'::regclass);


--
-- TOC entry 4824 (class 2604 OID 16995)
-- Name: formations_sanitaires id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formations_sanitaires ALTER COLUMN id SET DEFAULT nextval('public.formations_sanitaires_id_seq'::regclass);


--
-- TOC entry 4832 (class 2604 OID 17233)
-- Name: historique_affectations_superviseurs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_affectations_superviseurs ALTER COLUMN id SET DEFAULT nextval('public.historique_affectations_superviseurs_id_seq'::regclass);


--
-- TOC entry 4827 (class 2604 OID 17095)
-- Name: historique_modifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_modifications ALTER COLUMN id SET DEFAULT nextval('public.historique_modifications_id_seq'::regclass);


--
-- TOC entry 4828 (class 2604 OID 17115)
-- Name: historique_permutations_affectations id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_permutations_affectations ALTER COLUMN id SET DEFAULT nextval('public.historique_permutations_affectations_id_seq'::regclass);


--
-- TOC entry 4830 (class 2604 OID 17183)
-- Name: historique_supervision id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_supervision ALTER COLUMN id SET DEFAULT nextval('public.historique_supervision_id_seq'::regclass);


--
-- TOC entry 4826 (class 2604 OID 17078)
-- Name: journal_synchronisation id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_synchronisation ALTER COLUMN id SET DEFAULT nextval('public.journal_synchronisation_id_seq'::regclass);


--
-- TOC entry 4834 (class 2604 OID 17265)
-- Name: livraisons_notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.livraisons_notifications ALTER COLUMN id SET DEFAULT nextval('public.livraisons_notifications_id_seq'::regclass);


--
-- TOC entry 4831 (class 2604 OID 17211)
-- Name: notifications id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications ALTER COLUMN id SET DEFAULT nextval('public.notifications_id_seq'::regclass);


--
-- TOC entry 4822 (class 2604 OID 16965)
-- Name: prefectures id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prefectures ALTER COLUMN id SET DEFAULT nextval('public.prefectures_id_seq'::regclass);


--
-- TOC entry 4820 (class 2604 OID 16947)
-- Name: regions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regions ALTER COLUMN id SET DEFAULT nextval('public.regions_id_seq'::regclass);


--
-- TOC entry 4821 (class 2604 OID 16956)
-- Name: types_tdr id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.types_tdr ALTER COLUMN id SET DEFAULT nextval('public.types_tdr_id_seq'::regclass);


--
-- TOC entry 4825 (class 2604 OID 17011)
-- Name: utilisateurs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateurs ALTER COLUMN id SET DEFAULT nextval('public.utilisateurs_id_seq'::regclass);


--
-- TOC entry 5114 (class 0 OID 16938)
-- Dependencies: 217
-- Data for Name: alembic_version; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.alembic_version (version_num) FROM stdin;
c19f6a2d8b41
\.


--
-- TOC entry 5145 (class 0 OID 17289)
-- Dependencies: 248
-- Data for Name: appareils_push; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.appareils_push (id, utilisateur_id, jeton, plateforme, actif, cree_le, mis_a_jour_le) FROM stdin;
\.


--
-- TOC entry 5122 (class 0 OID 16977)
-- Dependencies: 225
-- Data for Name: communes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.communes (id, code, libelle, prefecture_id) FROM stdin;
1	COM_AVE_1	Avé1	8
2	COM_AVE_2	Avé2	8
3	COM_BAS_MONO_1	Bas-Mono1	5
4	COM_BAS_MONO_2	Bas-Mono2	5
5	COM_YOTO_1	Yoto1	4
6	COM_YOTO_2	Yoto2	4
7	COM_YOTO_3	Yoto3	4
8	COM_VO_1	Vo1	7
9	COM_VO_2	Vo2	7
10	COM_VO_3	Vo3	7
11	COM_VO_4	Vo4	7
12	COM_LACS_1	Lacs1	6
13	COM_LACS_2	Lacs2	6
14	COM_LACS_3	Lacs3	6
15	COM_LACS_4	Lacs4	6
16	COM_ZIO_1	Zio1	3
17	COM_ZIO_2	Zio2	3
18	COM_ZIO_3	Zio3	3
19	COM_ZIO_4	Zio4	3
20	COM_AGOE_NYIVE_1	Agoè-nyivé1	2
21	COM_AGOE_NYIVE_2	Agoè-nyivé2	2
22	COM_AGOE_NYIVE_3	Agoè-nyivé3	2
23	COM_AGOE_NYIVE_4	Agoè-nyivé4	2
24	COM_AGOE_NYIVE_5	Agoè-nyivé5	2
25	COM_AGOE_NYIVE_6	Agoè-nyivé6	2
26	COM_GOLFE_1	Golfe1	1
27	COM_GOLFE_2	Golfe2	1
28	COM_GOLFE_3	Golfe3	1
29	COM_GOLFE_4	Golfe4	1
30	COM_GOLFE_5	Golfe5	1
31	COM_GOLFE_6	Golfe6	1
32	COM_GOLFE_7	Golfe7	1
33	COM_ANIE_1	Anié1	19
34	COM_ANIE_2	Anié2	19
35	COM_EST_MONO_1	Est-Mono1	20
36	COM_EST_MONO_2	Est-Mono2	20
37	COM_EST_MONO_3	Est-Mono3	20
38	COM_MOYEN_MONO_1	Moyen-Mono1	10
39	COM_MOYEN_MONO_2	Moyen-Mono2	10
40	COM_AGOU_1	Agou1	12
41	COM_AGOU_2	Agou2	12
42	COM_DANYI_1	Danyi1	15
43	COM_DANYI_2	Danyi2	15
44	COM_AKEBOU_1	Akébou1	17
45	COM_AKEBOU_2	Akébou2	17
46	COM_KPELE_1	Kpélé1	14
47	COM_KPELE_2	Kpélé2	14
48	COM_KLOTO_1	Kloto1	13
49	COM_KLOTO_2	Kloto2	13
50	COM_KLOTO_3	Kloto3	13
51	COM_OGOU_1	Ogou1	9
52	COM_OGOU_2	Ogou2	9
53	COM_OGOU_3	Ogou3	9
54	COM_OGOU_4	Ogou4	9
55	COM_AMOU_1	Amou1	18
56	COM_AMOU_2	Amou2	18
57	COM_AMOU_3	Amou3	18
58	COM_WAWA_1	Wawa1	16
59	COM_WAWA_2	Wawa2	16
60	COM_WAWA_3	Wawa3	16
61	COM_HAHO_1	Haho1	11
62	COM_HAHO_2	Haho2	11
63	COM_HAHO_3	Haho3	11
64	COM_HAHO_4	Haho4	11
65	COM_TCHAOUDJO_1	Tchaoudjo1	21
66	COM_TCHAOUDJO_2	Tchaoudjo2	21
67	COM_TCHAOUDJO_3	Tchaoudjo3	21
68	COM_TCHAOUDJO_4	Tchaoudjo4	21
69	COM_TCHAMBA_1	Tchamba1	22
70	COM_TCHAMBA_2	Tchamba2	22
71	COM_TCHAMBA_3	Tchamba3	22
72	COM_BLITTA_1	Blitta1	23
73	COM_BLITTA_2	Blitta2	23
74	COM_BLITTA_3	Blitta3	23
75	COM_SOTOUBOUA_1	Sotouboua1	24
76	COM_SOTOUBOUA_2	Sotouboua2	24
77	COM_SOTOUBOUA_3	Sotouboua3	24
78	COM_MO_1	Mô1	25
79	COM_MO_2	Mô2	25
80	COM_ASSOLI_1	Assoli1	27
81	COM_ASSOLI_2	Assoli2	27
82	COM_ASSOLI_3	Assoli3	27
83	COM_KOZAH_1	Kozah1	26
84	COM_KOZAH_2	Kozah2	26
85	COM_KOZAH_3	Kozah3	26
86	COM_KOZAH_4	Kozah4	26
87	COM_BASSAR_1	Bassar1	28
88	COM_BASSAR_2	Bassar2	28
89	COM_BASSAR_3	Bassar3	28
90	COM_BASSAR_4	Bassar4	28
91	COM_DANKPEN_1	Dankpen1	29
92	COM_DANKPEN_2	Dankpen2	29
93	COM_DANKPEN_3	Dankpen3	29
94	COM_DOUFELGOU_1	Doufelgou1	31
95	COM_DOUFELGOU_2	Doufelgou2	31
96	COM_DOUFELGOU_3	Doufelgou3	31
97	COM_KERAN_1	Kéran1	30
98	COM_KERAN_2	Kéran2	30
99	COM_KERAN_3	Kéran3	30
100	COM_BINAH_1	Binah1	32
101	COM_BINAH_2	Binah2	32
102	COM_CINKASSE_1	Cinkassé1	34
103	COM_CINKASSE_2	Cinkassé2	34
104	COM_TONE_1	Tône1	33
105	COM_TONE_2	Tône2	33
106	COM_TONE_3	Tône3	33
107	COM_TONE_4	Tône4	33
108	COM_KPENDJAL_1	Kpendjal1	36
109	COM_KPENDJAL_2	Kpendjal2	36
110	COM_KPENDJAL_OUEST_1	Kpendjal Ouest1	35
111	COM_KPENDJAL_OUEST_2	Kpendjal Ouest2	35
112	COM_OTI_1	Oti1	38
113	COM_OTI_2	Oti2	38
114	COM_OTI_SUD_1	Oti Sud1	37
115	COM_OTI_SUD_2	Oti Sud2	37
116	COM_TANDJOARE_1	Tandjoaré1	39
117	COM_TANDJOARE_2	Tandjoaré2	39
\.


--
-- TOC entry 5135 (class 0 OID 17157)
-- Dependencies: 238
-- Data for Name: demandes_correction; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.demandes_correction (id, fiche_id, superviseur_id, motif, statut, cree_le, modifie_le) FROM stdin;
\.


--
-- TOC entry 5127 (class 0 OID 17039)
-- Dependencies: 230
-- Data for Name: fiches_paludisme; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.fiches_paludisme (id, numero_fiche, formation_sanitaire_id, date_consultation, num_oc, mois, age, sexe, grossesse, tpi1, tpi2, type_consultation, fievre, motif_consultation, ge_realisee, type_ge, charge_sigep, tdr_realise, type_tdr_id, resultat_tdr, numero_laboratoire, diagnostic, asaq, arlm, quinine_comprime, quinine_injectable, artesunate_injectable, autre_traitement, hospitalise, date_sortie, issue_hospitalisation, agent_id, date_saisie, fonction_agent, validation_confirmee, version, cree_le, modifie_le, supprime_le, validee_par_id, validee_le) FROM stdin;
\.


--
-- TOC entry 5124 (class 0 OID 16992)
-- Dependencies: 227
-- Data for Name: formations_sanitaires; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.formations_sanitaires (id, code, libelle, type_fs, commune_id, actif) FROM stdin;
1	FS_0001	2D_ Defis Developpement	Autre	72	t
2	FS_0002	CMS NIKI NIKI	CMS	72	t
3	FS_0003	Comite d'Action pour la Recherche et le Developpement (CARD)	Autre	72	t
4	FS_0004	CRT-Blitta	Autre	72	t
5	FS_0005	Dispensaire de Blitta-Village	USP	72	t
6	FS_0006	Hopital de District de Blitta	Hôpital	72	t
7	FS_0007	Hopital Saint Luc de Pagala Gare	Hôpital	72	t
8	FS_0008	OAPIB	Autre	72	t
9	FS_0009	USP Doufouli	USP	72	t
10	FS_0010	USP Kpawa	USP	72	t
11	FS_0011	USP Tchaloude	USP	72	t
12	FS_0012	USP Tondja	USP	72	t
13	FS_0013	USP Waragni	USP	72	t
14	FS_0014	USP Yaloumbe	USP	72	t
15	FS_0015	USP Yeloum Lekohan	USP	72	t
16	FS_0016	CMS Agbandi	CMS	73	t
17	FS_0017	USP Assouma Condji	USP	73	t
18	FS_0018	USP Attikpai	USP	73	t
19	FS_0019	USP Koffiti	USP	73	t
20	FS_0020	USP Koulang	USP	73	t
21	FS_0021	USP Langabou	USP	73	t
22	FS_0022	USP Solingobou	USP	73	t
23	FS_0023	USP Tcharebaou	USP	73	t
24	FS_0024	USP Assoukoko	USP	74	t
25	FS_0025	USP Diguengue	USP	74	t
26	FS_0026	USP Katchenke	USP	74	t
27	FS_0027	USP Koui	USP	74	t
28	FS_0028	USP M'Poti	USP	74	t
29	FS_0029	USP N'kengbe	USP	74	t
30	FS_0030	USP Pagala Village	USP	74	t
31	FS_0031	USP Tchifama	USP	74	t
32	FS_0032	USP Welly	USP	74	t
33	FS_0033	USP Yegue	USP	74	t
34	FS_0034	CHP Djarkpanga	Autre	78	t
35	FS_0035	USP Agbamassomou	USP	78	t
36	FS_0036	USP Boulohou	USP	78	t
37	FS_0037	USP Folo	USP	78	t
38	FS_0038	USP Gnézimdè	USP	78	t
39	FS_0039	USP Kagnigbara	USP	78	t
40	FS_0040	USP Ipouali	USP	79	t
41	FS_0041	USP Saïboude	USP	79	t
42	FS_0042	USP Tindjassi	USP	79	t
43	FS_0043	CHP Sotouboua	Autre	75	t
44	FS_0044	CMA 4ème RI	Autre	75	t
45	FS_0045	CMS JEAN PERRIN ( CMS Cecodri )	CMS	75	t
46	FS_0046	CMS MARANATHA	CMS	75	t
47	FS_0047	CMS Sainte Madeleine de Canossa	CMS	75	t
48	FS_0048	CRT-Sotouboua	Autre	75	t
49	FS_0049	Regroupement des Associations pour le Developpement Applique des Ruraux (RADAR)	Autre	75	t
50	FS_0050	USP Akpakou	USP	75	t
51	FS_0051	USP Centrale	USP	75	t
52	FS_0052	USP Kaniamboua	USP	75	t
53	FS_0053	USP Kpei-Tchila	USP	75	t
54	FS_0054	USP Tchoide	USP	75	t
55	FS_0055	CMS Adjengre	CMS	76	t
56	FS_0056	CMS PADRE PIO	CMS	76	t
57	FS_0057	USP Alemade	USP	76	t
58	FS_0058	USP Aouda	USP	76	t
59	FS_0059	USP Babade	USP	76	t
60	FS_0060	USP Fazao	USP	76	t
61	FS_0061	USP Haloukpaboundou	USP	76	t
62	FS_0062	USP Melamboua	USP	76	t
63	FS_0063	USP Sessaro	USP	76	t
64	FS_0064	USP Tembio	USP	76	t
65	FS_0065	USP Tittigbe	USP	76	t
66	FS_0066	Prison civile d'Agombio	Autre	77	t
67	FS_0067	USP Bodjonde	USP	77	t
68	FS_0068	USP Fondah	USP	77	t
69	FS_0069	USP Hezoude	USP	77	t
70	FS_0070	USP Kaza	USP	77	t
71	FS_0071	USP Kazaboua	USP	77	t
72	FS_0072	USP Lorenza Longaretti	USP	77	t
73	FS_0073	USP Tchebebe	USP	77	t
74	FS_0074	ABOUBABA	Autre	69	t
75	FS_0075	CHP Tchamba	Autre	69	t
76	FS_0076	CMS Maison médicale ALAFIA Espoir	CMS	69	t
77	FS_0077	CMS Tchekele	CMS	69	t
78	FS_0078	CRT- TCHAMBA	Autre	69	t
79	FS_0079	EVT Tchamba	Autre	69	t
80	FS_0080	Structure d’Appui pour le Developpement des Initiatives Locales au Togo (ONG SADIL-TOGO)	Autre	69	t
81	FS_0081	USP Affem Boussou	USP	69	t
82	FS_0082	USP Affem Kabye	USP	69	t
83	FS_0083	USP Alibi I	USP	69	t
84	FS_0084	USP Alibi II	USP	69	t
85	FS_0085	USP Dagma	USP	69	t
86	FS_0086	USP Kazakali	USP	69	t
87	FS_0087	USP Kri-Kri	USP	69	t
88	FS_0088	USP Larini	USP	69	t
89	FS_0089	USP N'tchourou	USP	69	t
90	FS_0090	CMS Koussountou	CMS	70	t
91	FS_0091	CPMI Koussountou	Autre	70	t
92	FS_0092	USP Affossala Cope	USP	70	t
93	FS_0093	USP Bago	USP	70	t
94	FS_0094	USP HEZOUDE(Nv)	USP	70	t
95	FS_0095	USP Kouloumi	USP	70	t
96	FS_0096	USP Samai	USP	70	t
97	FS_0097	CMS Kaboli	CMS	71	t
98	FS_0098	CMS Soeur Jeanne Henriette	CMS	71	t
99	FS_0099	SAD	Autre	71	t
100	FS_0100	USP Balanka	USP	71	t
101	FS_0101	USP Goubi	USP	71	t
102	FS_0102	USP Parampa	USP	71	t
103	FS_0103	ADCF	Autre	65	t
104	FS_0104	ADIEJ	Autre	65	t
105	FS_0105	Association Pour le Developpement Integral de la Jeune Femme et de la Jeune Fille (ADIFF)	Autre	65	t
106	FS_0106	CAV	Autre	65	t
107	FS_0107	Centre de Sante Mancini	Centre de Santé	65	t
108	FS_0108	CERFAO/NDA	Autre	65	t
109	FS_0109	CHR Sokode	CHR	65	t
110	FS_0110	Clinique ADAK	Clinique	65	t
111	FS_0111	Clinique ATBEF - Sokode	Clinique	65	t
112	FS_0112	Clinique Gatari	Clinique	65	t
113	FS_0113	Clinique Puits de Jacob	Clinique	65	t
114	FS_0114	CMA Gendarmerie Sokode	Autre	65	t
115	FS_0115	CMS ALBARKA	CMS	65	t
116	FS_0116	CMS Béthel	CMS	65	t
117	FS_0117	CMS Bizanda	CMS	65	t
118	FS_0118	CMS Bon Secours Adesco	CMS	65	t
119	FS_0119	CMS Charite	CMS	65	t
120	FS_0120	CMS El Farouk	CMS	65	t
121	FS_0121	CMS Hankeli	CMS	65	t
122	FS_0122	CMS Koloware	CMS	65	t
123	FS_0123	CMS Kossobio	CMS	65	t
124	FS_0124	CMS Saint Damien	CMS	65	t
125	FS_0125	CMS Solinyogobu	CMS	65	t
126	FS_0126	Construire Ensemble (CE)	Autre	65	t
127	FS_0127	CPECUS SOKODE	Autre	65	t
128	FS_0128	CRAO Sokodé	Autre	65	t
129	FS_0129	Creuset Togo (CT)	Autre	65	t
130	FS_0130	CRT-RC	Autre	65	t
131	FS_0131	CRTS Sokode	Autre	65	t
132	FS_0132	Dimension Humaine (DH)	Autre	65	t
133	FS_0133	Ensemble Pour la Vie (EPV)	Autre	65	t
134	FS_0134	Espoir Vie Togo Sokode	Autre	65	t
135	FS_0135	Infirmerie ALEHERI	Autre	65	t
136	FS_0136	Infirmerie Assomption	Autre	65	t
137	FS_0137	Infirmerie Aurore de Sokodé	Autre	65	t
138	FS_0138	Infirmerie Bakhita	Autre	65	t
139	FS_0139	Infirmerie Daroul Cour'an	Autre	65	t
140	FS_0140	Infirmerie du Lycée Technique	Autre	65	t
141	FS_0141	Infirmerie Prison Civile Sokode	Autre	65	t
142	FS_0142	Polyclinique Sokode	Clinique	65	t
143	FS_0143	Programme d'Appui à la Femme et à l'Enfance deshéritee (PAFED)	Autre	65	t
144	FS_0144	UCJG	Autre	65	t
145	FS_0145	USP Aou Mono	USP	65	t
146	FS_0146	USP Baraka City	USP	65	t
147	FS_0147	USP Bowounda	USP	65	t
148	FS_0148	USP Daza-Esso	USP	65	t
149	FS_0149	USP Esperance Koulounde	USP	65	t
150	FS_0150	USP Kadambara	USP	65	t
151	FS_0151	USP KEDJIKANDJO	USP	65	t
152	FS_0152	USP Komah	USP	65	t
153	FS_0153	USP Kouvom	USP	65	t
154	FS_0154	USP Kparatao	USP	65	t
155	FS_0155	USP Nada	USP	65	t
156	FS_0156	USP Sabaringade	USP	65	t
157	FS_0157	USP Sada II	USP	65	t
158	FS_0158	USP Sagbadai	USP	65	t
159	FS_0159	USP Salimde	USP	65	t
160	FS_0160	USP Taworeda	USP	65	t
161	FS_0161	USP Tchalo	USP	65	t
162	FS_0162	USP Tchavade	USP	65	t
163	FS_0163	CMA TCHAWARE	Autre	66	t
164	FS_0164	USP Aou-Matchatom	USP	66	t
165	FS_0165	USP Kassena	USP	66	t
166	FS_0166	USP Lama-Tessi	USP	66	t
167	FS_0167	USP MALIKIDA	USP	66	t
168	FS_0168	USP Solao	USP	66	t
169	FS_0169	USP Yao-Kope	USP	66	t
170	FS_0170	USP Yara-Kabye	USP	66	t
171	FS_0171	Centre St Camille de Lelis d'Amoudè	Centre de Santé	67	t
172	FS_0172	USP Aleheride	USP	67	t
173	FS_0173	USP Amaïde	USP	67	t
174	FS_0174	USP Kemeni	USP	67	t
175	FS_0175	USP Kolina	USP	67	t
176	FS_0176	USP Koumoniade	USP	67	t
177	FS_0177	USP Agbandaoude - Tchaoudjo	USP	68	t
178	FS_0178	USP Agouloude	USP	68	t
179	FS_0179	USP Kpassouade	USP	68	t
180	FS_0180	USP Kpaza	USP	68	t
181	FS_0181	USP Wassarabo	USP	68	t
182	FS_0182	ACJH	Autre	20	t
183	FS_0183	APSBES	Autre	20	t
184	FS_0184	Association des Jeunes Musulmans pour la Bienfaisance	Autre	20	t
185	FS_0185	ATBEF CdE	Autre	20	t
186	FS_0186	Brigade Pour Mineur	Autre	20	t
187	FS_0187	CABINET D'ASSISTANT MEDICAL ONIS	Cabinet Médical	20	t
188	FS_0188	Cabinet d'Ophtalmologie Dr BANLA	Cabinet Médical	20	t
189	FS_0189	CABINET DE SOINS INFIRMIERS MAIN DE DIEU	Cabinet Médical	20	t
190	FS_0190	Cabinet Gratias Dei	Cabinet Médical	20	t
191	FS_0191	Cabinet la Lumière	Cabinet Médical	20	t
192	FS_0192	Cabinet Médical ELITE	Cabinet Médical	20	t
193	FS_0193	Cabinet Medical Le Devot	Cabinet Médical	20	t
194	FS_0194	Cabinet Médical Migni Bola - Shalom	Cabinet Médical	20	t
195	FS_0195	Cabinet medical Sainte Véronique	Cabinet Médical	20	t
196	FS_0196	Cabinet Medical St Raphael Archange	Cabinet Médical	20	t
197	FS_0197	CABINET SANTE ESPOIR	Cabinet Médical	20	t
198	FS_0198	Centre de sante Esperance Loyola	Centre de Santé	20	t
199	FS_0199	Centre de Sante Mentale St Jean de Dieu Agoenyive	Centre de Santé	20	t
200	FS_0200	Centre ophtalmologique la Croyance	Centre de Santé	20	t
201	FS_0201	Clinique AVOSANTO	Clinique	20	t
202	FS_0202	Clinique d’accouchement Eutocique Gracia	Clinique	20	t
203	FS_0203	Clinique de l'Ocean	Clinique	20	t
204	FS_0204	CLINIQUE DE L'UNION AFRICAINE	Clinique	20	t
205	FS_0205	Clinique Djadja-Avognon	Clinique	20	t
206	FS_0206	Clinique En Roth	Clinique	20	t
207	FS_0207	Clinique Espoir Bethel	Clinique	20	t
208	FS_0208	Clinique Fadel	Clinique	20	t
209	FS_0209	Clinique Floreale	Clinique	20	t
210	FS_0210	Clinique Groupe Medical	Clinique	20	t
211	FS_0211	Clinique La Barakat	Clinique	20	t
212	FS_0212	CLINIQUE LA BONTE	Clinique	20	t
213	FS_0213	CLINIQUE la Paix	Clinique	20	t
214	FS_0214	CLINIQUE LA TROMPETTE	Clinique	20	t
215	FS_0215	Clinique Le Peuplier	Clinique	20	t
216	FS_0216	CLINIQUE LES ELFES	Clinique	20	t
217	FS_0217	Clinique Les Moineaux	Clinique	20	t
218	FS_0218	CLINIQUE SAINT PAUL LA REFERENCE	Clinique	20	t
219	FS_0219	CLINIQUE SAINTE CATHERINE	Clinique	20	t
220	FS_0220	CLINIQUE SHEKINA	Clinique	20	t
221	FS_0221	Clinique Soins pour tous	Clinique	20	t
222	FS_0222	CMA 1er BIR	Autre	20	t
223	FS_0223	CMA GENDARMERIE LOME	Autre	20	t
224	FS_0224	CMA RBRA	Autre	20	t
225	FS_0225	CMS Agoenyive	CMS	20	t
226	FS_0226	CMS Avenir Enfance TOGO	CMS	20	t
227	FS_0227	CMS des Etoiles	CMS	20	t
228	FS_0228	CMS Douceur D'orient	CMS	20	t
229	FS_0229	CMS E2V	CMS	20	t
230	FS_0230	CMS G2A	CMS	20	t
231	FS_0231	CMS Jehova Ramah	CMS	20	t
232	FS_0232	CMS La Providence	CMS	20	t
233	FS_0233	CMS le Réconfort	CMS	20	t
234	FS_0234	CMS Le Rocher	CMS	20	t
235	FS_0235	CMS LERO	CMS	20	t
236	FS_0236	CMS Ma Citadelle	CMS	20	t
237	FS_0237	CMS MAKAFUI	CMS	20	t
238	FS_0238	CMS ONG Millenium	CMS	20	t
239	FS_0239	CMS ONG Rapha	CMS	20	t
240	FS_0240	CMS POLICE NATIONALE LOGOPE	CMS	20	t
241	FS_0241	CMS Rachel Jones	CMS	20	t
242	FS_0242	CMS Sante Plus	CMS	20	t
243	FS_0243	CMS Shalom	CMS	20	t
244	FS_0244	CMS St Arthur	CMS	20	t
245	FS_0245	CMS Vie - Espoir	CMS	20	t
246	FS_0246	CPSCNA	Autre	20	t
247	FS_0247	Disp Jean-Jacque Bazin	Autre	20	t
248	FS_0248	Hd Cacaveli	Autre	20	t
249	FS_0249	Infirmerie de La Prison de Cacaveli	Autre	20	t
250	FS_0250	Infirmerie du CORSDJC (Centre de d’Observation et de Réinsertion Sociale Des Jeunes de Cacaveli )	Centre de Santé	20	t
251	FS_0251	Infirmerie Petite Soeur A Soeur	Autre	20	t
252	FS_0252	Kom-Ombo	Autre	20	t
253	FS_0253	Lycee Moderne Agoe Centre	Centre de Santé	20	t
254	FS_0254	ONG ACDT	Autre	20	t
255	FS_0255	ONG AJLT	Autre	20	t
256	FS_0256	ONG ROPAC-TOGO	Autre	20	t
257	FS_0257	Polyclinique Demakpoe	Clinique	20	t
258	FS_0258	POLYCLINIQUE MAKKAH AL MOUKARRAMAH	Clinique	20	t
259	FS_0259	UNITE MEDICALE SAMB	Autre	20	t
260	FS_0260	CABINET DE SOINS INFIRMIERS BETHESDA	Cabinet Médical	21	t
261	FS_0261	Cabinet Médical Espoir	Cabinet Médical	21	t
262	FS_0262	Cabinet Médical REHOBOTH	Cabinet Médical	21	t
263	FS_0263	Clinique d'Accouchement Eutocique Don de DIEU	Clinique	21	t
264	FS_0264	CLINIQUE LA VIE ZOE	Clinique	21	t
265	FS_0265	CLINIQUE SAINTE CAMILLE	Clinique	21	t
266	FS_0266	CM BENEDICTUS	Autre	21	t
267	FS_0267	CMS LA Grace Divine	CMS	21	t
268	FS_0268	CMS La Solution	CMS	21	t
269	FS_0269	CMS LE SEUL	CMS	21	t
270	FS_0270	CMS Legbassito	CMS	21	t
271	FS_0271	CMS MA GUERISON	CMS	21	t
272	FS_0272	CMS Ma Sante	CMS	21	t
273	FS_0273	CMS OSER	CMS	21	t
274	FS_0274	CMS UNIVERS SANTE	CMS	21	t
275	FS_0275	Hopital Sainte Josephine Bakhita	Hôpital	21	t
276	FS_0276	Infirmerie du grand marché de hédzranawoé	Autre	21	t
277	FS_0277	La Solution	Autre	21	t
278	FS_0278	Aides Medicales et Charite	Autre	22	t
279	FS_0279	Centre de sante Marie Reine des Vierges	Centre de Santé	22	t
280	FS_0280	Centre de sante ONG FAMME	Centre de Santé	22	t
281	FS_0281	Clinique Eternel Guérit	Clinique	22	t
282	FS_0282	CLINIQUE MEDICALE SAINT ALFRED	Clinique	22	t
283	FS_0283	CMS Agoe Elavagnon	CMS	22	t
284	FS_0284	CMS CISSA	CMS	22	t
285	FS_0285	MAMA CLINIQUE	Clinique	22	t
286	FS_0286	VALLEE DE BERACA	Autre	22	t
287	FS_0287	CMS Direct Aid	CMS	23	t
288	FS_0288	CMS Fidel Castro	CMS	23	t
289	FS_0289	CMS MERE ET ENFANT ZENAB	CMS	23	t
290	FS_0290	CMS Notre Dame de Fatima de Fidokpui	CMS	23	t
291	FS_0291	CMS SANTE ELITE	CMS	23	t
292	FS_0292	CMS Togblecope	CMS	23	t
293	FS_0293	Hopital Dogta-Lafia	Hôpital	23	t
294	FS_0294	USP Nyivemegble	USP	23	t
295	FS_0295	ACSET	Autre	24	t
296	FS_0296	Cabinet RAMA	Cabinet Médical	24	t
297	FS_0297	Clinique Les Victorieux	Clinique	24	t
298	FS_0298	Clinique Virgo Poters	Clinique	24	t
299	FS_0299	CMS FOREVER-GRACE	CMS	24	t
300	FS_0300	CMS LA VIE	CMS	24	t
301	FS_0301	CMS PEM	CMS	24	t
302	FS_0302	CMS Sanguera	CMS	24	t
303	FS_0303	CMS Vidosa	CMS	24	t
304	FS_0304	CMS Yayra	CMS	24	t
305	FS_0305	Clinique ENG	Clinique	25	t
306	FS_0306	Clinique Psychiatrique Raoul Duval	Clinique	25	t
307	FS_0307	CMS Adetikope	CMS	25	t
308	FS_0308	CMS Le Berceau	CMS	25	t
309	FS_0309	CMS SANTE ESPOIR	CMS	25	t
310	FS_0310	CMS TOUT A MERVEILLE	CMS	25	t
311	FS_0311	Hopital JURA	Hôpital	25	t
312	FS_0312	MSA Tsikplonou Kondji	Autre	25	t
313	FS_0313	Action Contre Le Sida	Autre	26	t
314	FS_0314	AEC	Autre	26	t
315	FS_0315	Arc - En - Ciel	Autre	26	t
316	FS_0316	Cabinet D'assistant Medical La Bebediction	Cabinet Médical	26	t
317	FS_0317	Cabinet D'assistant Medical La Sante D'abord	Cabinet Médical	26	t
318	FS_0318	Cabinet de psychologie clinique Mieux être	Clinique	26	t
319	FS_0319	Cabinet dentaire EGNY	Cabinet Médical	26	t
320	FS_0320	Cabinet Dentaire Le Sourire	Cabinet Médical	26	t
321	FS_0321	Cabinet Lowossou	Cabinet Médical	26	t
322	FS_0322	Cabinet Médical ATA LAWOE DODE	Cabinet Médical	26	t
323	FS_0323	Cabinet Medical Christ-Roi	CHR	26	t
324	FS_0324	Cabinet Medical Dr Sossou	Cabinet Médical	26	t
325	FS_0325	Cabinet Medical Germinal	Cabinet Médical	26	t
326	FS_0326	Cabinet Medical Grace divine	Cabinet Médical	26	t
327	FS_0327	Cabinet Medical In Cha'allah	Cabinet Médical	26	t
328	FS_0328	Cabinet Médical Israël	Cabinet Médical	26	t
329	FS_0329	Cabinet Medical Jehovah-Jireh	Cabinet Médical	26	t
330	FS_0330	Cabinet Medical La Grace	Cabinet Médical	26	t
331	FS_0331	CABINET MEDICAL LA LUMIERE DE DIEU	Cabinet Médical	26	t
332	FS_0332	Cabinet Médical le Bon SAMARITAIN	Cabinet Médical	26	t
333	FS_0333	Cabinet Medical Le Refuge	Cabinet Médical	26	t
334	FS_0334	Cabinet Médical Ma Santé	Cabinet Médical	26	t
335	FS_0335	Cabinet Medical MARIE Uriel	Cabinet Médical	26	t
336	FS_0336	Cabinet Medical Mon Sauveur	Cabinet Médical	26	t
337	FS_0337	Cabinet Médical Mon Trésor	Cabinet Médical	26	t
338	FS_0338	Cabinet médical Rosaldine	Cabinet Médical	26	t
339	FS_0339	Cabinet Medical Sacre-Coeur	Cabinet Médical	26	t
340	FS_0340	Cabinet Secours Medical Gracia	Cabinet Médical	26	t
341	FS_0341	CABINET ZAFANAT PALENAX	Cabinet Médical	26	t
342	FS_0342	Centre de Sante Adakpame	Centre de Santé	26	t
343	FS_0343	Clinique Autel D'Elie	Clinique	26	t
344	FS_0344	Clinique Barruet	Clinique	26	t
345	FS_0345	Clinique Bel Air	Clinique	26	t
346	FS_0346	Clinique Flore light	Clinique	26	t
347	FS_0347	CLINIQUE LA GRACE DE DIEU	Clinique	26	t
348	FS_0348	Clinique Lamese	Clinique	26	t
349	FS_0349	Clinique Médicale ''St Antoine de Padoue''	Clinique	26	t
350	FS_0350	Clinique Notre Dame de La Misericorde	Clinique	26	t
351	FS_0351	Clinique Obstetricale La Vie	Clinique	26	t
352	FS_0352	Clinique St Bernardin	Clinique	26	t
353	FS_0353	CLINIQUE ST PIERRE ALCANTARA	Clinique	26	t
354	FS_0354	CM DU ROCHER	Autre	26	t
355	FS_0355	CM MAWUENYIGAN	Autre	26	t
356	FS_0356	CM MAWULOLO	Autre	26	t
357	FS_0357	CM Meilleure Sante	Autre	26	t
359	FS_0359	CMA MARINE	Autre	26	t
360	FS_0360	CMS DZIDZO de SID'ESPOIR (ONG CRIPS-TOGO)	CMS	26	t
361	FS_0361	CMS Gbenyedji	CMS	26	t
362	FS_0362	CMS Hosanna (Horizon Nouvel)	CMS	26	t
363	FS_0363	CMS Kangnikopé	CMS	26	t
364	FS_0364	CMS Katanga	CMS	26	t
365	FS_0365	CMS la Grace	CMS	26	t
366	FS_0366	CMS Le Messie	CMS	26	t
367	FS_0367	CMS Port	CMS	26	t
368	FS_0368	CMS SANTE BETHESDA	CMS	26	t
369	FS_0369	CRIPS(CMS Dzidzo)	CMS	26	t
370	FS_0370	CS St Camille de Lellis	Autre	26	t
371	FS_0371	DAMA-CLINIC	Autre	26	t
372	FS_0372	DEO GRATIAS	Autre	26	t
373	FS_0373	Flore light	Autre	26	t
374	FS_0374	Grace A Dieu	Autre	26	t
375	FS_0375	HD Be Kpota	Autre	26	t
376	FS_0376	Hopital de Be	Hôpital	26	t
377	FS_0377	Infirmerie CRETFP Maritime	Autre	26	t
378	FS_0378	Infirmerie de Lycée de Gbenyedji	Autre	26	t
379	FS_0379	Infirmerie Mère-Thérèsa	Autre	26	t
380	FS_0380	ONG Asdes	Autre	26	t
381	FS_0381	POST MEDICAL ST CHARBEL	Autre	26	t
382	FS_0382	S.M. Ave Maria	Autre	26	t
383	FS_0383	Secour Médical EBENEZER	Autre	26	t
384	FS_0384	Secour Medical Unité de Soins Saint BEDE	Autre	26	t
385	FS_0385	Secours Médical Grâce de Dieu	Autre	26	t
386	FS_0386	Secours Medical Jehovah Rapha	Autre	26	t
387	FS_0387	Secours Médical La Providence	Autre	26	t
388	FS_0388	Secours Médical le Réconfort	Autre	26	t
389	FS_0389	Secours Médical Le SALUT	Autre	26	t
390	FS_0390	Secours Médical Lève-toi	Autre	26	t
391	FS_0391	Secours Médical SITSOPE	Autre	26	t
392	FS_0392	Seropositifs En Action	Autre	26	t
393	FS_0393	SM LA GLOIRE DE DIEU	Autre	26	t
394	FS_0394	Source Et Vie	Autre	26	t
395	FS_0395	St Archange	Autre	26	t
396	FS_0396	UMS du Centre Communautaire de Be	Centre de Santé	26	t
397	FS_0397	Unité de Soins Saint BEDE	Autre	26	t
398	FS_0398	Vision Sans Frontiere ONG de Developpement	Autre	26	t
399	FS_0399	Wonderful Jesus	Autre	26	t
400	FS_0400	Cabinet d'Assistant Médical Bon Berger	Cabinet Médical	27	t
401	FS_0401	CABINET MEDICAL DIEU DONNE	Cabinet Médical	27	t
402	FS_0402	Cabinet Médical Saint Victor	Cabinet Médical	27	t
403	FS_0403	Cabinet Vision-Explo	Cabinet Médical	27	t
404	FS_0404	Cappef	Autre	27	t
405	FS_0405	Centre de Sante Jae Hyun	Centre de Santé	27	t
406	FS_0406	Centre de Santé JAE HYUN de Hédzranawoé	Centre de Santé	27	t
407	FS_0407	Centre de Santé Secours Médical Eternel est Mon berger	Centre de Santé	27	t
408	FS_0408	Centre de Soins Polyvalent à vocation Humanitaire (ATES)	Centre de Santé	27	t
409	FS_0409	Clinique de L'aeroprt	Clinique	27	t
410	FS_0410	Clinique Dr MOTTE	Clinique	27	t
411	FS_0411	Clinique ELIKE	Clinique	27	t
412	FS_0412	Clinique FAFA	Clinique	27	t
413	FS_0413	Clinique Gynécoloque Elle	Clinique	27	t
414	FS_0414	CLINIQUE MONT SINAÏ	Clinique	27	t
415	FS_0415	Clinique Novissi	Clinique	27	t
416	FS_0416	Clinique Orient	Clinique	27	t
417	FS_0417	Clinique Polyvalente de L'esperance	Clinique	27	t
418	FS_0418	Clinique Saint Bernard	Clinique	27	t
419	FS_0419	Clinique Saint Esprit	Clinique	27	t
420	FS_0420	Clinique Sante Pour Tous	Clinique	27	t
421	FS_0421	Clinique sous le Roc	Clinique	27	t
422	FS_0422	CM GOD IS GOD	Autre	27	t
423	FS_0423	CMA BTL/CETAP	Autre	27	t
424	FS_0424	CMS APEDO DVA	CMS	27	t
425	FS_0425	CMS APHAD LA GRACE	CMS	27	t
426	FS_0426	CMS Awoudja	CMS	27	t
427	FS_0427	CMS El Shadaï	CMS	27	t
428	FS_0428	CMS Jesus Christ Rapha	CMS	27	t
429	FS_0429	CMS La Gloire	CMS	27	t
430	FS_0430	CMS La Merveille	CMS	27	t
431	FS_0431	CMS Maison du HADJ	CMS	27	t
432	FS_0432	CMS Miséricorde et compassion	CMS	27	t
433	FS_0433	CMS Police	CMS	27	t
434	FS_0434	CMS Sacre Coeur Junior	CMS	27	t
435	FS_0435	CMS Saint Clement - EFRATA	CMS	27	t
436	FS_0436	CMS SALAM	CMS	27	t
437	FS_0437	CMS Shilo	CMS	27	t
438	FS_0438	CMS SOS Village d'Enfants	CMS	27	t
439	FS_0439	CMS Vita	CMS	27	t
440	FS_0440	CMS YAWE RAPHA	CMS	27	t
441	FS_0441	Cs N'kafu	Autre	27	t
442	FS_0442	CS polyvalent a vocation humanitaire	Autre	27	t
443	FS_0443	Csm Paul Louis Renee	Autre	27	t
444	FS_0444	Dispensaire Du Saint Esprit	USP	27	t
445	FS_0445	Groupe d'Action pour Alimentation Infantile au Togo	Autre	27	t
446	FS_0446	Infirmerie Collège st Joseph	Autre	27	t
447	FS_0447	Infirmerie de l'ANAC	Autre	27	t
448	FS_0448	Infirmerie du Grand Marché de HEDZRANAWE	Autre	27	t
449	FS_0449	Infirmerie du Lycée Technique d'Attiégou	Autre	27	t
450	FS_0450	Laboratoire BAUME DE GALAAD 7	Autre	27	t
451	FS_0451	Maison de la Sage-Femme	Autre	27	t
452	FS_0452	ONG Asdes Dieu merci	Autre	27	t
453	FS_0453	ONG Vb Afrique	Autre	27	t
454	FS_0454	ONG Vih Soutien Les Anges	Autre	27	t
455	FS_0455	Petite Sœur à Sœur	Autre	27	t
456	FS_0456	Polyclinique Le Coeur	Clinique	27	t
457	FS_0457	Polyclinique St Joseph	Clinique	27	t
458	FS_0458	Recherche Action Prévention Accompagnement des Addiction	Autre	27	t
459	FS_0459	Roc de Dieu	Autre	27	t
460	FS_0460	SM Eternel est mon berger	Autre	27	t
461	FS_0461	SM Mon Abri	Autre	27	t
462	FS_0462	Cabinet Dentaire PDG	Cabinet Médical	28	t
463	FS_0463	CABINET MEDICAL Dr GABA	Cabinet Médical	28	t
464	FS_0464	Cabinet Medical LE Bretlle	Cabinet Médical	28	t
465	FS_0465	Cabinet Medical Le Rosaire	Cabinet Médical	28	t
466	FS_0466	Cabinet Medical Ledji	Cabinet Médical	28	t
467	FS_0467	Cabinet Medical St Kisito	Cabinet Médical	28	t
468	FS_0468	Cabinet Médicale le PATIO	Cabinet Médical	28	t
469	FS_0469	Cabinet Pediatrique La Vie	Cabinet Médical	28	t
470	FS_0470	CAPS Jean Paul II	Autre	28	t
471	FS_0471	CHAL	Autre	28	t
472	FS_0472	CHR Lome Commune	CHR	28	t
473	FS_0473	CHU Campus	CHU	28	t
474	FS_0474	Clinique ATBEF Lome	Clinique	28	t
475	FS_0475	Clinique Centre Culturel Islamique	Clinique	28	t
476	FS_0476	Clinique Printemps	Clinique	28	t
477	FS_0477	Clinique Taamba	Clinique	28	t
478	FS_0478	CMA RCGP	Autre	28	t
479	FS_0479	CMF/FAT	Autre	28	t
480	FS_0480	CMS Doumassesse	CMS	28	t
481	FS_0481	CMS Jirehe	CMS	28	t
482	FS_0482	CMS POLICE NATIONALE	CMS	28	t
483	FS_0483	CMS Tokoin Elavagnon	CMS	28	t
484	FS_0484	CMS UL	CMS	28	t
485	FS_0485	CNRSD	Autre	28	t
486	FS_0486	CNTS de Lome	Autre	28	t
487	FS_0487	COJP2	Autre	28	t
488	FS_0488	Infirmerie de Lycée de Tokoin II	Autre	28	t
489	FS_0489	Infirmerie Lycée de TOKOIN 1	Autre	28	t
490	FS_0490	Infirmerie St Vincent de Paul	Autre	28	t
491	FS_0491	Infirmerie Village Du Benin	Autre	28	t
492	FS_0492	Maison Medicale Elenad	Autre	28	t
493	FS_0493	MEN S	Autre	28	t
494	FS_0494	ONG Horizon Développement	Autre	28	t
495	FS_0495	ONG Jeunesse et Avenir Togo	Autre	28	t
496	FS_0496	ONG Medes(Mere Et Enfant)	Autre	28	t
497	FS_0497	Secours Medical GRACIA	Autre	28	t
498	FS_0498	Secours Médical LE BON SAMARITAIN	Autre	28	t
499	FS_0499	Action-Genre-Identite et Responsabilite (AGIR)	Autre	29	t
500	FS_0500	AJMB	Autre	29	t
501	FS_0501	ARBITRE POUR LA CITOYENNETE	Autre	29	t
502	FS_0502	Association des Volontaires pour la promotion des Jeunes	Autre	29	t
503	FS_0503	Association pour la Promotion de l’education a la Base	Autre	29	t
504	FS_0504	Cabinet Dentaire Eclat	Cabinet Médical	29	t
505	FS_0505	Cabinet Medical Agboli	Cabinet Médical	29	t
506	FS_0506	Cabinet Medical D'Ophtamologie Maison D'Itali	Cabinet Médical	29	t
507	FS_0507	Cabinet Médical Dieu Guéri	Cabinet Médical	29	t
508	FS_0508	Cabinet medical Dr PAKU	Cabinet Médical	29	t
509	FS_0509	Cabinet Medical La Paix	Cabinet Médical	29	t
510	FS_0510	Cabinet Medical Le Lys	Cabinet Médical	29	t
511	FS_0511	CABINET MEDICAL MAIN DE DIEU	Cabinet Médical	29	t
512	FS_0512	Cabinet Medicale D'Amoutive	Cabinet Médical	29	t
513	FS_0513	CADPHEF	Autre	29	t
1045	FS_1045	CMS 3m	CMS	15	t
514	FS_0514	Centre de Sante de Kodjoviakope	Centre de Santé	29	t
515	FS_0515	Centre de Sante Lome	Centre de Santé	29	t
516	FS_0516	Centre de Sante Mesa	Centre de Santé	29	t
517	FS_0517	Centre Medical Cataluya Crt	Centre de Santé	29	t
518	FS_0518	CEPIAK	Autre	29	t
519	FS_0519	CFLS	Autre	29	t
520	FS_0520	CHU Sylvanus Olympio	CHU	29	t
521	FS_0521	Clinique Adjamgba	Clinique	29	t
522	FS_0522	Clinique Alodo-Tay	Clinique	29	t
523	FS_0523	Clinique Alpia	Clinique	29	t
524	FS_0524	Clinique Biasa	Clinique	29	t
525	FS_0525	Clinique Bon Pasteur	Clinique	29	t
526	FS_0526	Clinique Bon Secours	Clinique	29	t
527	FS_0527	Clinique Des Cocotiers	Clinique	29	t
528	FS_0528	Clinique Des Etoiles	Clinique	29	t
529	FS_0529	Clinique Des Meres	Clinique	29	t
530	FS_0530	Clinique la Confiance	Clinique	29	t
531	FS_0531	Clinique Les Anges	Clinique	29	t
532	FS_0532	Clinique Mont Carmel	Clinique	29	t
533	FS_0533	Clinique Myoren	Clinique	29	t
534	FS_0534	Clinique Saint Antoine	Clinique	29	t
535	FS_0535	Clinique Saint Augustin	Clinique	29	t
536	FS_0536	Clinique Saint Helene	Clinique	29	t
537	FS_0537	Clinique St Louis Scrosoppi	Clinique	29	t
538	FS_0538	Clinique Ste Marie Reine	Clinique	29	t
539	FS_0539	CMA CSP	Autre	29	t
540	FS_0540	CMA ESSAL	Autre	29	t
541	FS_0541	CMS Adawlato	CMS	29	t
542	FS_0542	CMS Amoutive	CMS	29	t
543	FS_0543	CMS Be Attikoume	CMS	29	t
544	FS_0544	CMS Gendarmerie	CMS	29	t
545	FS_0545	CMS Mere Alphonse Cavin	CMS	29	t
546	FS_0546	CMS Nyekonakpoe	CMS	29	t
547	FS_0547	CMS Sainte Anne	CMS	29	t
548	FS_0548	CMS Temple Du Calvaire	CMS	29	t
549	FS_0549	CMS UTB Circulaire	CMS	29	t
550	FS_0550	CNAO	Autre	29	t
551	FS_0551	Cropesdi	Autre	29	t
552	FS_0552	Development For All (DFA)	Autre	29	t
553	FS_0553	Eureka Plus	Autre	29	t
554	FS_0554	I2DA	Autre	29	t
555	FS_0555	Infirmerie CEG Atikpa Kagoura	Autre	29	t
556	FS_0556	Infirmerie Collège Protestant	Autre	29	t
557	FS_0557	Infirmerie de L'Eglise Evangelique	Autre	29	t
558	FS_0558	Infirmerie de l'Institut Technique Notre Dame de l'Eglise (IITNDE)	Autre	29	t
559	FS_0559	Infirmerie de La Ceet	Autre	29	t
560	FS_0560	Infirmerie de La Dst Voirie	Autre	29	t
561	FS_0561	Infirmerie de La Presidence	Autre	29	t
562	FS_0562	Infirmerie Du Casef	Autre	29	t
563	FS_0563	Infirmerie EDITOGO	Autre	29	t
564	FS_0564	Infirmerie ENA	Autre	29	t
565	FS_0565	Infirmerie Infpp	Autre	29	t
566	FS_0566	Infirmerie La Foi	Autre	29	t
567	FS_0567	INFIRMERIE LEBENE	Autre	29	t
568	FS_0568	Infirmerie Marché le TOGO	Autre	29	t
569	FS_0569	Infirmerie NDA	Autre	29	t
570	FS_0570	Infirmerie Notre Dame de L'esperance	Autre	29	t
571	FS_0571	Infirmerie Notre Dame Du Sacre Coeur	Autre	29	t
572	FS_0572	Infirmerie Prison Lome	Autre	29	t
573	FS_0573	Institut National d'Hygiene (INH)	Autre	29	t
574	FS_0574	Jade Pour La Vie	Autre	29	t
575	FS_0575	ONG Asi-Togo	Autre	29	t
576	FS_0576	ONG MEDES	Autre	29	t
577	FS_0577	Polyclinique de Lome	Clinique	29	t
578	FS_0578	Poste controle sanitaire Kodjoviakope	Autre	29	t
579	FS_0579	SNSJA	Autre	29	t
580	FS_0580	Ste Bakhita	Autre	29	t
581	FS_0581	Unidial	Autre	29	t
582	FS_0582	Union Chretienne des Jeunes Gens (UCJG)	CHR	29	t
583	FS_0583	Unite d'Information / SA de Kodjoviakope	Autre	29	t
584	FS_0584	Afrique Arc-En-Ciel	Autre	30	t
585	FS_0585	Aide Et Reconfort (AIDER)	Autre	30	t
586	FS_0586	Aides Sanitaires, Actions Sociales(AS2)	Autre	30	t
587	FS_0587	Aidss	Autre	30	t
588	FS_0588	Alliance Chretienne pour le Développement Integral (ACDI)	CHR	30	t
589	FS_0589	ASDEF	Autre	30	t
590	FS_0590	Asmene	Autre	30	t
591	FS_0591	Asprofem	Autre	30	t
592	FS_0592	Association pour les Femmes Africaines Face au SIDA (SWAA)	Autre	30	t
593	FS_0593	Bayor1	Autre	30	t
594	FS_0594	Cabinet Medical d'exploration SPECIALISE	Cabinet Médical	30	t
595	FS_0595	Cabinet Medical Dar-As-Salam	Cabinet Médical	30	t
596	FS_0596	Cabinet Medical Dr Kuzeawu	Cabinet Médical	30	t
597	FS_0597	Cabinet Medical GAMESU	Cabinet Médical	30	t
598	FS_0598	Cabinet Medical Le Sauveur	Cabinet Médical	30	t
599	FS_0599	Cabinet Medical Peace Clinic	Cabinet Médical	30	t
600	FS_0600	Cabinet Medical Saint Michel	Cabinet Médical	30	t
601	FS_0601	Cabinet Medical St Michel	Cabinet Médical	30	t
602	FS_0602	CABINET MEDICAL WOXOSE ADEWO	Cabinet Médical	30	t
603	FS_0603	Centre Des Jeunes de Lome	Centre de Santé	30	t
604	FS_0604	Centre International de Cancérologie de Lomé	Centre de Santé	30	t
605	FS_0605	Centre Medico Chirurgical Source de Vie	Centre de Santé	30	t
606	FS_0606	Centre Obstetrical La Redemption	Centre de Santé	30	t
607	FS_0607	Clinique Bethesda	Clinique	30	t
608	FS_0608	CLINIQUE BIEN-ETRE	Clinique	30	t
609	FS_0609	Clinique Chirurgicale de Lome	Clinique	30	t
610	FS_0610	CLINIQUE DE L'ALLIANCE	Clinique	30	t
611	FS_0611	Clinique de Totsi	Clinique	30	t
612	FS_0612	Clinique El-Elyon	Clinique	30	t
613	FS_0613	CLINIQUE EMMADIL	Clinique	30	t
614	FS_0614	Clinique Internationale Dr Kodom	Clinique	30	t
615	FS_0615	Clinique ISIS	Clinique	30	t
616	FS_0616	Clinique La Providence	Clinique	30	t
617	FS_0617	Clinique La Victoire	Clinique	30	t
618	FS_0618	Clinique Laennec	Clinique	30	t
619	FS_0619	Clinique Le Sauveur	Clinique	30	t
620	FS_0620	Clinique les P'tits Anges	Clinique	30	t
621	FS_0621	Clinique Lumiere	Clinique	30	t
622	FS_0622	Clinique Medico Chirurgical Martin Luter King	Clinique	30	t
623	FS_0623	Clinique Medico Chirurgicale Mawubedzro	Clinique	30	t
624	FS_0624	Clinique Mere Et Enfant L'etoile	Clinique	30	t
625	FS_0625	Clinique Ophtalmologique Lumière Divine	Clinique	30	t
626	FS_0626	Clinique Saint Raphael	Clinique	30	t
627	FS_0627	Clinique St Raphael (Dr Kotor)	Clinique	30	t
628	FS_0628	Club des 7 Jours	Autre	30	t
629	FS_0629	Club Initie pour la Lutte contre le SIDA	Autre	30	t
630	FS_0630	CMA 2eme RI	Autre	30	t
631	FS_0631	CMS Adidogome	CMS	30	t
632	FS_0632	CMS Avopras Sante	CMS	30	t
633	FS_0633	CMS Bio Sante	CMS	30	t
634	FS_0634	CMS Bonne Sante	CMS	30	t
635	FS_0635	CMS Djidjole	CMS	30	t
636	FS_0636	CMS Eben Ezer	CMS	30	t
637	FS_0637	CMS Jerusalem	CMS	30	t
638	FS_0638	CMS Kekeli	CMS	30	t
639	FS_0639	CMS Lucia (ANCIEN Evt)	CMS	30	t
640	FS_0640	CMS Notre Dame de Fatima d'Avedji	CMS	30	t
641	FS_0641	CMS Notre Dame de La Trinite	CMS	30	t
642	FS_0642	CMS Regina Pacis	CMS	30	t
643	FS_0643	Dispensaire St Paul D'avenou	USP	30	t
644	FS_0644	Espoir Vie Vue	Autre	30	t
645	FS_0645	Espoir Vie-Togo	Autre	30	t
646	FS_0646	Fafa Clinique Medico-Chirurgicale	Clinique	30	t
647	FS_0647	Infirmerie Bnce	Autre	30	t
648	FS_0648	Infirmerie Collège KOUVAHEY	Autre	30	t
649	FS_0649	Infirmerie Collège Protestant Agbalépédo	Autre	30	t
650	FS_0650	Infirmerie du Lycée du 2 Février	Autre	30	t
651	FS_0651	Infirmerie marché de Totsi	Autre	30	t
652	FS_0652	Lycee Technique Adidogome	Autre	30	t
653	FS_0653	MUSA CSTT	Autre	30	t
654	FS_0654	ONG ACDT	Autre	30	t
655	FS_0655	ONG FAMME	Autre	30	t
656	FS_0656	ONG HORIZON NOUVEL	Autre	30	t
657	FS_0657	ONG JAD	Autre	30	t
658	FS_0658	ONG Medical Challenge Togo - MCT	Autre	30	t
659	FS_0659	ONG Réseau Cupidon	Autre	30	t
660	FS_0660	Polyclinelle Wussinu Et Gbogbo	Autre	30	t
661	FS_0661	Polyclinique Melia	Clinique	30	t
662	FS_0662	RAS +	Autre	30	t
663	FS_0663	Réseau des Associations personnes vivant avec le VIH au Togo (RAS+ Togo)	Autre	30	t
664	FS_0664	St Loisel	Autre	30	t
665	FS_0665	SWAA-TOGO	Autre	30	t
666	FS_0666	UJADIS	Autre	30	t
667	FS_0667	AMACACH	Autre	31	t
668	FS_0668	ASDEB (Action Solidaire Pour Un Developpement Entr)	Autre	31	t
669	FS_0669	ATFA	Autre	31	t
670	FS_0670	Cabinet médical de dermatologie ELISABETH	Cabinet Médical	31	t
671	FS_0671	Cabinet Medical Shalom	Cabinet Médical	31	t
672	FS_0672	Cabinet Medicale Polyvalent	Cabinet Médical	31	t
673	FS_0673	Casa Speranza Padre Pio	Autre	31	t
674	FS_0674	Centre Medico Social Avenir	Centre de Santé	31	t
675	FS_0675	Clinique Bella Vita	Clinique	31	t
676	FS_0676	Clinique Cyntia	Clinique	31	t
677	FS_0677	CLINIQUE LUMEN	Clinique	31	t
678	FS_0678	Clinique Medico Chirurgicale Rocher D'horeb	Clinique	31	t
679	FS_0679	CLINIQUE RABBOUNI	Clinique	31	t
680	FS_0680	Clinique Sainte Therese	Clinique	31	t
681	FS_0681	Clinique Shilo	Clinique	31	t
682	FS_0682	CMS Adamavo	CMS	31	t
683	FS_0683	CMS Apedo	CMS	31	t
684	FS_0684	CMS Avepozo	CMS	31	t
685	FS_0685	CMS Baguida	CMS	31	t
686	FS_0686	CMS Eleos	CMS	31	t
687	FS_0687	CMS Gbetsogbe	CMS	31	t
688	FS_0688	CMS ONG AST Baguida	CMS	31	t
689	FS_0689	CMS Solidarite ONG ADA Togo	CMS	31	t
690	FS_0690	CMS Strebler	CMS	31	t
691	FS_0691	CS Heureux de Dieu	Autre	31	t
692	FS_0692	CS Mgr de Marion Bresilac	Autre	31	t
693	FS_0693	God Is God	Autre	31	t
694	FS_0694	Le responsable	Autre	31	t
695	FS_0695	Millenium Friends	Autre	31	t
696	FS_0696	ONG AC	Autre	31	t
697	FS_0697	ONG ESSOR-AFRIKA	Autre	31	t
698	FS_0698	ONG JAAR	Autre	31	t
699	FS_0699	ONG REICID	Autre	31	t
700	FS_0700	ONG RTESS	Autre	31	t
701	FS_0701	Polyclinique Providence du Golfe	Clinique	31	t
702	FS_0702	Polyclinique Saint Denis	Clinique	31	t
703	FS_0703	Polyclinique Saint Denis1	Clinique	31	t
704	FS_0704	Recherche et Action pour le Developpement Social (RADS)	Autre	31	t
705	FS_0705	St Christian	CHR	31	t
706	FS_0706	USP Devego	USP	31	t
707	FS_0707	USP Lediagnostic	USP	31	t
708	FS_0708	USP Saint Jean	USP	31	t
709	FS_0709	Cabinet Medical AFIA	Cabinet Médical	32	t
710	FS_0710	Clinique ESPERENDIEU	Clinique	32	t
711	FS_0711	Clinique les Arcades	Clinique	32	t
712	FS_0712	CLINIQUE LES MARRONS	Clinique	32	t
713	FS_0713	Clinique Sainte Cecile	Clinique	32	t
714	FS_0714	CM Espace Sante Actuelle	Autre	32	t
715	FS_0715	CMS Alpha Omega	CMS	32	t
716	FS_0716	CMS Don de la Vie	CMS	32	t
717	FS_0717	CMS Edzodzinam	CMS	32	t
718	FS_0718	CMS EWOEVO	CMS	32	t
719	FS_0719	CMS Gadh	CMS	32	t
720	FS_0720	CMS Gratia	CMS	32	t
721	FS_0721	CMS IBAWI ILERA	CMS	32	t
722	FS_0722	CMS La Confiance	CMS	32	t
723	FS_0723	CMS Laetus	CMS	32	t
724	FS_0724	CMS Salut Et Vie	CMS	32	t
725	FS_0725	CMS Santé Intégrale	CMS	32	t
726	FS_0726	CMS Segbe	CMS	32	t
727	FS_0727	CMS Soeur Pura Pagani	CMS	32	t
728	FS_0728	CS ONG GCCST	Autre	32	t
729	FS_0729	LAETUS	Autre	32	t
730	FS_0730	Le Bon Berger	Autre	32	t
731	FS_0731	Lotus	Autre	32	t
732	FS_0732	Lycee Moderne Adidogome	Autre	32	t
733	FS_0733	Lycee Moderne Adidogome II	Autre	32	t
734	FS_0734	ONG DEO GRATIAS	Autre	32	t
735	FS_0735	ONG JMAH	Autre	32	t
736	FS_0736	Secours Medical La Grace	Autre	32	t
737	FS_0737	AED Bafilo	Autre	80	t
738	FS_0738	CHP Bafilo	Autre	80	t
739	FS_0739	CMS Alafia	CMS	80	t
740	FS_0740	USP Boulade	USP	80	t
741	FS_0741	USP Dacko	USP	80	t
742	FS_0742	USP Efolo	USP	80	t
743	FS_0743	USP El Houda	USP	80	t
744	FS_0744	USP Kayali	USP	80	t
745	FS_0745	USP Koudjoudoulou	USP	80	t
746	FS_0746	Centre Vie Et Sante Aledjo	Centre de Santé	81	t
747	FS_0747	USP Aledjo	USP	81	t
748	FS_0748	USP Koumonde	USP	81	t
749	FS_0749	USP Tagbade	USP	81	t
750	FS_0750	USP Agbandaoude - Assoli	USP	82	t
751	FS_0751	USP Gande	USP	82	t
752	FS_0752	USP Gninguelia	USP	82	t
753	FS_0753	USP Soudou	USP	82	t
754	FS_0754	AVLS Bassar	Autre	87	t
755	FS_0755	Centre Hospitalier Prefectoral de Bassar	Centre de Santé	87	t
756	FS_0756	CMS Sainte Famille de Bikpassiba	CMS	87	t
757	FS_0757	Infirmerie de la Prison Civile de Bassar	Autre	87	t
758	FS_0758	USP Agbabou	USP	87	t
759	FS_0759	USP Baghan	USP	87	t
760	FS_0760	USP Binaparba	USP	87	t
761	FS_0761	USP Bougabou	USP	87	t
762	FS_0762	USP Dantchessi	USP	87	t
763	FS_0763	USP Gmasdjoune	USP	87	t
764	FS_0764	USP Kalanga	USP	87	t
765	FS_0765	USP Nangbani	USP	87	t
766	FS_0766	USP Tchatchaminade	USP	87	t
767	FS_0767	USP Yakedji	USP	87	t
768	FS_0768	CMS Bangeli	CMS	88	t
769	FS_0769	USP Binadjoube	USP	88	t
770	FS_0770	USP Bitchabe	USP	88	t
771	FS_0771	USP Byakpabe	USP	88	t
772	FS_0772	USP Dimori	USP	88	t
773	FS_0773	USP Kountoum	USP	88	t
774	FS_0774	USP Natchamba	USP	88	t
775	FS_0775	USP Sansale	USP	88	t
776	FS_0776	CMS Kabou	CMS	89	t
777	FS_0777	USP Kabou-Sara	USP	89	t
778	FS_0778	USP Lakpatime	USP	89	t
779	FS_0779	USP Manga	USP	89	t
780	FS_0780	CMS Sanda Kagbanda	CMS	90	t
781	FS_0781	USP Koundoum	USP	90	t
782	FS_0782	USP Sanda Afohou	USP	90	t
783	FS_0783	AFSEPA	Autre	100	t
784	FS_0784	CHP Pagouda	Autre	100	t
785	FS_0785	CMS Farende	CMS	100	t
786	FS_0786	SAR-AFRIQUE Binah	Autre	100	t
787	FS_0787	USP Assere	USP	100	t
788	FS_0788	USP Banware	USP	100	t
789	FS_0789	USP Binah-Noh	USP	100	t
790	FS_0790	USP Boufale	USP	100	t
791	FS_0791	USP Confess	USP	100	t
792	FS_0792	USP Kagnigada	USP	100	t
793	FS_0793	USP Kagnissi	USP	100	t
794	FS_0794	USP Kouyoria	USP	100	t
795	FS_0795	USP Pessare	USP	100	t
796	FS_0796	USP Solla	USP	100	t
797	FS_0797	USP Somde	USP	100	t
798	FS_0798	USP Tanfarou	USP	100	t
799	FS_0799	USP Tchikawa	USP	100	t
800	FS_0800	CABINET DE SOINS INFIRMIERS LA GRACE DE DIEU	Cabinet Médical	101	t
801	FS_0801	CMS Ketao	CMS	101	t
802	FS_0802	PMI Saint-Martin	Autre	101	t
803	FS_0803	USP Kemerida	USP	101	t
804	FS_0804	USP N'djei	USP	101	t
805	FS_0805	USP Sirka	USP	101	t
806	FS_0806	USP Tcholougou	USP	101	t
807	FS_0807	ADEFE	Autre	91	t
808	FS_0808	CHP Guerin-Kouka	Autre	91	t
809	FS_0809	COMINTES	Autre	91	t
810	FS_0810	USP Kadogou	USP	91	t
811	FS_0811	USP Katchamba	USP	91	t
812	FS_0812	USP Koulfiekou	USP	91	t
813	FS_0813	USP Mere Regina Nampoch	USP	91	t
814	FS_0814	USP Namab	USP	91	t
815	FS_0815	USP Solidarite	USP	91	t
816	FS_0816	CMS Namon	CMS	92	t
817	FS_0817	USP Koutchetcheou	USP	92	t
818	FS_0818	USP Koutiere	USP	92	t
819	FS_0819	USP Natchibore	USP	92	t
820	FS_0820	USP Natchitikpi	USP	92	t
821	FS_0821	CMS Saint Kisito de Kpatchile	CMS	93	t
822	FS_0822	USP Bapure	USP	93	t
823	FS_0823	USP DJEMPIL	USP	93	t
824	FS_0824	USP Kidjaboun	USP	93	t
825	FS_0825	USP Koubouabou	USP	93	t
826	FS_0826	USP Kpetab	USP	93	t
827	FS_0827	USP Nandouta	USP	93	t
828	FS_0828	USP Naware	USP	93	t
829	FS_0829	USP Possao	USP	93	t
830	FS_0830	ASSOCIATION SANTE BAGA	Autre	94	t
831	FS_0831	BC Niamtougou	Autre	94	t
832	FS_0832	CHP Niamtougou	Autre	94	t
833	FS_0833	CMS Baga	CMS	94	t
834	FS_0834	CMS Siou	CMS	94	t
835	FS_0835	Construire Ensemble (CE)	Autre	94	t
836	FS_0836	PMI-Yaka	Autre	94	t
837	FS_0837	USP Agbande	USP	94	t
838	FS_0838	USP Bontigah	USP	94	t
839	FS_0839	USP Jean Paul II	USP	94	t
840	FS_0840	USP Kawa Bas	USP	94	t
841	FS_0841	USP Konfaga	USP	94	t
842	FS_0842	USP Massedena	USP	94	t
843	FS_0843	USP Pouda	USP	94	t
844	FS_0844	USP Tenega	USP	94	t
845	FS_0845	CMS Defale	CMS	95	t
846	FS_0846	CRN Hulmen	Autre	95	t
847	FS_0847	USP Anima	USP	95	t
848	FS_0848	USP Animade	USP	95	t
849	FS_0849	USP Kpaha	USP	95	t
850	FS_0850	CMS Broukou	CMS	96	t
851	FS_0851	CRN Broukou	Autre	96	t
852	FS_0852	USP Agbassa	USP	96	t
853	FS_0853	USP Agounde	USP	96	t
854	FS_0854	USP Alloum	USP	96	t
855	FS_0855	USP Kadjalla	USP	96	t
856	FS_0856	USP Leon	USP	96	t
857	FS_0857	USP Tchore	USP	96	t
858	FS_0858	AED Kante	Autre	97	t
859	FS_0859	ARADD	Autre	97	t
860	FS_0860	Dispensaire Ate-Kante	USP	97	t
861	FS_0861	Hopital de District de Kante	Hôpital	97	t
862	FS_0862	Infirmerie de la Prison Civile Kante	Autre	97	t
863	FS_0863	Pediatrie esperance Kante	Autre	97	t
864	FS_0864	USP Goulbi	USP	97	t
865	FS_0865	USP Kokou-Temberma	USP	97	t
866	FS_0866	USP Kpesside	USP	97	t
867	FS_0867	USP Naboulgou	USP	97	t
868	FS_0868	USP Natiponi	USP	97	t
869	FS_0869	CMS Helota	CMS	98	t
870	FS_0870	USP Atalote	USP	98	t
871	FS_0871	USP Nioucira	USP	98	t
872	FS_0872	USP Ossacre	USP	98	t
873	FS_0873	USP Pangouda	USP	98	t
874	FS_0874	USP Koutougou	USP	99	t
875	FS_0875	USP Nadoba	USP	99	t
876	FS_0876	USP Pimini	USP	99	t
877	FS_0877	USP Tapounte	USP	99	t
878	FS_0878	USP Warengo	USP	99	t
879	FS_0879	AC Kozah (Arbitre pour la Citoyenneté de la Kozah)	Autre	83	t
880	FS_0880	AIESEC KARA	Autre	83	t
881	FS_0881	Association Espoir de demain-Aed Lidao	Autre	83	t
882	FS_0882	Cabinet Maman	Cabinet Médical	83	t
883	FS_0883	Cabinet Medical Hippocrate de Kara	Cabinet Médical	83	t
884	FS_0884	Cabinet Medical La Fraternite	Cabinet Médical	83	t
885	FS_0885	Cabinet Medical Ma Vie Kara	Cabinet Médical	83	t
886	FS_0886	Centre des jeunes de Kara	Centre de Santé	83	t
887	FS_0887	CHR Kara	CHR	83	t
888	FS_0888	CHU Kara	CHU	83	t
889	FS_0889	Clinique ATBEF Kara	Clinique	83	t
890	FS_0890	Clinique Mère Régina	Clinique	83	t
891	FS_0891	Clinique Mère Régina1	Clinique	83	t
892	FS_0892	Clinique Saint Sauveur	Clinique	83	t
893	FS_0893	Clinique Tout Est Grace	Clinique	83	t
894	FS_0894	CMA RPC	Autre	83	t
895	FS_0895	CMS Sar Afrique/USP TCHEYOU	USP	83	t
896	FS_0896	CMS Tchintchinda	CMS	83	t
897	FS_0897	CMS Universite de Kara	CMS	83	t
898	FS_0898	Crao Kara	Autre	83	t
899	FS_0899	CRT Kara	Autre	83	t
900	FS_0900	Dispensaire Maternite Saint Luc/USP Tchanade	USP	83	t
901	FS_0901	Dispensaire Sante Pour Tous/Don Bosco	USP	83	t
902	FS_0902	FAMME Kara	Autre	83	t
903	FS_0903	Forces en Action pour le Mieux Être de la Mère et de l'Enfant	Autre	83	t
904	FS_0904	Hopital Mere Et Enfant(Hme) Sos	Hôpital	83	t
905	FS_0905	Infirmerie College Adele	Autre	83	t
906	FS_0906	Infirmerie de La Prison Civile de Kara	Autre	83	t
907	FS_0907	JKSDS	Autre	83	t
908	FS_0908	ONG ATAREKAD	Autre	83	t
909	FS_0909	PMI Kara	Autre	83	t
910	FS_0910	Polyclinique Kara	Clinique	83	t
911	FS_0911	Sante Rurale en Afrique	Autre	83	t
912	FS_0912	USP Adabawere	USP	83	t
913	FS_0913	USP Kara Sud	USP	83	t
914	FS_0914	USP Lama Gnangbade	USP	83	t
915	FS_0915	USP Lama Sahoude	USP	83	t
916	FS_0916	USP Lama-Boo	USP	83	t
917	FS_0917	USP Lama-Djamde	USP	83	t
918	FS_0918	USP Lama-Kpedah	USP	83	t
919	FS_0919	USP Landa	USP	83	t
920	FS_0920	USP Lassa-Bas	USP	83	t
921	FS_0921	USP Lassa-Houde	USP	83	t
922	FS_0922	USP Lassa-Samala	USP	83	t
923	FS_0923	USP SAMALA BAS	USP	83	t
924	FS_0924	USP Soumdina Haut	USP	83	t
925	FS_0925	USP Soumdina-Bas	USP	83	t
926	FS_0926	CMA EFOFAT PYA	Autre	84	t
927	FS_0927	CMS Koumea	CMS	84	t
928	FS_0928	CMS Pya	CMS	84	t
929	FS_0929	CMS Pya Pittah	CMS	84	t
930	FS_0930	CMS Tchare	CMS	84	t
931	FS_0931	CMS Tchitchao	CMS	84	t
932	FS_0932	CMS Yade-Bohou	CMS	84	t
933	FS_0933	Infirmerie Du College Militaire de Tchitchao	Autre	84	t
934	FS_0934	Infirmerie Maman n'danida	Autre	84	t
935	FS_0935	Infirmerie Scolaire Cet de Pya	Autre	84	t
1046	FS_1046	CMS Anfoin	CMS	15	t
936	FS_0936	Infirmerie Scolaire Cretfp de Kara	Autre	84	t
937	FS_0937	USP Feouda-Laouda	USP	84	t
938	FS_0938	USP Piyo-Houde	USP	84	t
939	FS_0939	USP Pya-Hodo	USP	84	t
940	FS_0940	USP Sara	USP	84	t
941	FS_0941	USP Sarakawa	USP	84	t
942	FS_0942	USP Tchare Wiyamde	USP	84	t
943	FS_0943	USP Agbalossi	USP	85	t
944	FS_0944	USP Awandjelo	USP	85	t
945	FS_0945	USP Kpangbazibiyo	USP	85	t
946	FS_0946	USP Kpindi	USP	85	t
947	FS_0947	USP Kpinzinde	USP	85	t
948	FS_0948	USP Soumbou	USP	85	t
949	FS_0949	USP WELOU	USP	85	t
950	FS_0950	CMS Atchangbade	CMS	86	t
951	FS_0951	USP Bebeda	USP	86	t
952	FS_0952	USP Djamde	USP	86	t
953	FS_0953	USP Kawa	USP	86	t
954	FS_0954	USP Koudjoukada	USP	86	t
955	FS_0955	Case de sante EDZI	Autre	1	t
956	FS_0956	Clinique Bethel	Clinique	1	t
957	FS_0957	CMS Agakpe	CMS	1	t
958	FS_0958	CMS Dzolo	CMS	1	t
959	FS_0959	CMS Keve	CMS	1	t
960	FS_0960	Hopital Assahoun	Hôpital	1	t
961	FS_0961	USP Agbadzanake	USP	1	t
962	FS_0962	USP Anyron	USP	1	t
963	FS_0963	USP Atti-Atovou	USP	1	t
964	FS_0964	USP Batoume - Ave	USP	1	t
965	FS_0965	USP Gbenoukondji	USP	1	t
966	FS_0966	USP Hekpe	USP	1	t
967	FS_0967	USP Tovegan	USP	1	t
968	FS_0968	USP Yometchin	USP	1	t
969	FS_0969	USP Yope-Tsiviepe	USP	1	t
970	FS_0970	USP Zogbepime	USP	1	t
971	FS_0971	AVEDEC	Autre	2	t
972	FS_0972	Centre de Sante Jeunesse En Mission	Centre de Santé	2	t
973	FS_0973	Centre de Soins de Sante Akepe	Centre de Santé	2	t
974	FS_0974	CMS Akepe	CMS	2	t
975	FS_0975	CMS Bienheureux Luigi TEZZA	CMS	2	t
976	FS_0976	CMS Hemmes (ONG CRIPS-TOGO)	CMS	2	t
977	FS_0977	CMS LOLO VAVA	CMS	2	t
978	FS_0978	Maison Medicale Aformetrop	Autre	2	t
979	FS_0979	USP Badja	USP	2	t
980	FS_0980	USP Bagbe	USP	2	t
981	FS_0981	USP Noepe	USP	2	t
982	FS_0982	Association pour la Promotion de l’education a la Base	Autre	3	t
983	FS_0983	Club des Initiés pour les Jeunes	Autre	3	t
984	FS_0984	Groupe d'action contre le SIDA	Autre	3	t
985	FS_0985	Hopital Saint Jean de Dieu D'afagnan	Hôpital	3	t
986	FS_0986	Polyclinique Afagnan	Clinique	3	t
987	FS_0987	USP Agome Glozou	USP	3	t
988	FS_0988	USP Klikame	USP	3	t
989	FS_0989	USP Kpetsou	USP	3	t
990	FS_0990	CMS Attitogon	CMS	4	t
991	FS_0991	USP Agbetiko	USP	4	t
992	FS_0992	USP Agomeseva	USP	4	t
993	FS_0993	USP AVOUTOKPA-MAWOUSSI	USP	4	t
994	FS_0994	USP Batonou	USP	4	t
995	FS_0995	USP Hompou	USP	4	t
996	FS_0996	USP Logohome/Agbohome	USP	4	t
997	FS_0997	USP Masseda	USP	4	t
998	FS_0998	USP Sedokondji	USP	4	t
999	FS_0999	USP TANNOU	USP	4	t
1000	FS_1000	Association Nouvelle Vision (NOVISI)	Autre	12	t
1001	FS_1001	Association pour la Promotion de l’education a la Base	Autre	12	t
1002	FS_1002	Cas de Sante Hlande	Autre	12	t
1003	FS_1003	Centre Hospitalier Prefectoral Aneho	Centre de Santé	12	t
1004	FS_1004	Cercle d'Aide Femme-Enfant (CAFE)	Autre	12	t
1005	FS_1005	CFLS Sanvee Condji	Autre	12	t
1006	FS_1006	CMA 1er RI zowla	Autre	12	t
1007	FS_1007	CMS Fernado Giardinetti	CMS	12	t
1008	FS_1008	CMS HOUNSIAFA	CMS	12	t
1009	FS_1009	CMS Lanmesin	CMS	12	t
1010	FS_1010	CMS Zowla Don Source de Dieu	CMS	12	t
1011	FS_1011	EVT Aneho	Autre	12	t
1012	FS_1012	Groupe d'Action contre le SIDA(GAS)	Autre	12	t
1013	FS_1013	Hopital Psychiatrique de Zebe	Hôpital	12	t
1014	FS_1014	Infirmerie de la Prison Civile Aneho	Autre	12	t
1015	FS_1015	ONG 2AVIE	Autre	12	t
1016	FS_1016	Polyclinique Aneho	Clinique	12	t
1017	FS_1017	Unite d'Information/ SA Sanvee Condji	Autre	12	t
1018	FS_1018	USP Aziagba Condji	USP	12	t
1019	FS_1019	USP Fiokondji	USP	12	t
1020	FS_1020	USP Glidji	USP	12	t
1021	FS_1021	USP Zalive	USP	12	t
1022	FS_1022	USP Zowla	USP	12	t
1023	FS_1023	CMS Aklakou	CMS	13	t
1024	FS_1024	Dispensaire St Raphael D'avedji	USP	13	t
1025	FS_1025	USP Adame	USP	13	t
1026	FS_1026	USP Agbannakin	USP	13	t
1027	FS_1027	USP Agouegan	USP	13	t
1028	FS_1028	USP Atisso Condji	USP	13	t
1029	FS_1029	USP Atoueta	USP	13	t
1030	FS_1030	USP Aveve	USP	13	t
1031	FS_1031	USP Djeta	USP	13	t
1032	FS_1032	USP Seko	USP	13	t
1033	FS_1033	USP Sivame	USP	13	t
1034	FS_1034	CMS Agbodrafo	CMS	14	t
1035	FS_1035	CMS de Soins Primaire de Dague	CMS	14	t
1036	FS_1036	CMS Dieudonne	CMS	14	t
1037	FS_1037	CMS Donum Dei	CMS	14	t
1038	FS_1038	Infirmerie Snpt Kpeme	Autre	14	t
1039	FS_1039	USP Djasseme	USP	14	t
1040	FS_1040	USP Gbodjome	USP	14	t
1041	FS_1041	USP Goumou-Kope	USP	14	t
1042	FS_1042	USP Kpeme	USP	14	t
1043	FS_1043	USP Togokome	USP	14	t
1044	FS_1044	Centre de Sante de Tokpo	Centre de Santé	15	t
1047	FS_1047	Dispensaire St Gaetan de Fiata	USP	15	t
1048	FS_1048	USP D'avele	USP	15	t
1049	FS_1049	USP Ganave	USP	15	t
1050	FS_1050	USP Hangoume	USP	15	t
1051	FS_1051	USP Melly Djigbe	USP	15	t
1052	FS_1052	Action Solidaire des Femmes Chretiennes pour le Developpement Intégre (ASFECDI)	CHR	8	t
1053	FS_1053	Cabinet Medical Elinam	Cabinet Médical	8	t
1054	FS_1054	Case de Sante Hounlokoe	Autre	8	t
1055	FS_1055	Case de Sante Legbanou-Dzokope	Autre	8	t
1056	FS_1056	Centre medical ELINAM	Centre de Santé	8	t
1057	FS_1057	Centre Medical Rural de Pedakondji	Centre de Santé	8	t
1058	FS_1058	CHP Vogan	Autre	8	t
1059	FS_1059	Cs Dr Jack Mc Alister (USP Midawokope)	USP	8	t
1060	FS_1060	Infirmerie de la Prison Civile de Vogan	Autre	8	t
1061	FS_1061	Infirmerie Scolaire Lycee Vogan	Autre	8	t
1062	FS_1062	Polyclinique Vogan	Clinique	8	t
1063	FS_1063	USP Afidenyigba	USP	8	t
1064	FS_1064	USP Assan-Kondji	USP	8	t
1065	FS_1065	USP Atahonou	USP	8	t
1066	FS_1066	USP Boko	USP	8	t
1067	FS_1067	USP Djekotoe	USP	8	t
1068	FS_1068	USP Hedjegan	USP	8	t
1069	FS_1069	USP Légbanou-Djokopé	USP	8	t
1070	FS_1070	USP Masse-Kope	USP	8	t
1071	FS_1071	USP Sagada Kope	USP	8	t
1072	FS_1072	USP Vo-Koutime	USP	8	t
1073	FS_1073	USP Wogba	USP	8	t
1074	FS_1074	Vision-Inititives et Engagement pour la Sante (VIES)	Autre	8	t
1075	FS_1075	CMS Anyronkope	CMS	9	t
1076	FS_1076	USP Badougbe	USP	9	t
1077	FS_1077	USP Badougbé Lové	USP	9	t
1078	FS_1078	USP Ekpui	USP	9	t
1079	FS_1079	USP Keta Akoda	USP	9	t
1080	FS_1080	USP Keta-Agbantokope	USP	9	t
1081	FS_1081	USP Togoville	USP	9	t
1082	FS_1082	Case de Sante Agbedehonou	Autre	10	t
1083	FS_1083	Case de Sante Avegluidjigan	Autre	10	t
1084	FS_1084	Case de Sante Badjenope	Autre	10	t
1085	FS_1085	Centre Catholique Dagbe Neva de Soko Tomety	Centre de Santé	10	t
1086	FS_1086	Centre Miséricorde Saint Camille de Zooti	Centre de Santé	10	t
1087	FS_1087	CMS EBEN EZER Dzrekpo	CMS	10	t
1088	FS_1088	CMS Hotel-Dieu Mome Katihoe	CMS	10	t
1089	FS_1089	CMS Joseph Nascimbeni	CMS	10	t
1090	FS_1090	USP Dagbati	USP	10	t
1091	FS_1091	USP Dzrekpo	USP	10	t
1092	FS_1092	USP Dzrekpo-Hagou	USP	10	t
1093	FS_1093	USP Klologo	USP	10	t
1094	FS_1094	USP Mome Hounkpati	USP	10	t
1095	FS_1095	USP Vo-Attive	USP	10	t
1096	FS_1096	USP Zooti Centre	USP	10	t
1097	FS_1097	Case de santé Asso	Autre	11	t
1098	FS_1098	Case de Sante Asso-Apegan	Autre	11	t
1099	FS_1099	Case de Sante Gnita	Autre	11	t
1100	FS_1100	Case de santé Séva-Tonou	Autre	11	t
1101	FS_1101	Case de Sante Tchideme	Autre	11	t
1102	FS_1102	Case de santé Tigoe	Autre	11	t
1103	FS_1103	Case de Sante Vodze	Autre	11	t
1104	FS_1104	CMS Akoumape	CMS	11	t
1105	FS_1105	Dispensaire Communautaire de Koveto	USP	11	t
1106	FS_1106	HOPITAL BAPTISTE LA GRACE	Hôpital	11	t
1107	FS_1107	Infirmerie Snpt Hahotoe	Autre	11	t
1108	FS_1108	USP Gnita	USP	11	t
1109	FS_1109	USP Hahotoe	USP	11	t
1110	FS_1110	USP Sevagan	USP	11	t
1111	FS_1111	USP Vodze	USP	11	t
1112	FS_1112	Association pour la Promotion de l’education a la Base	Autre	5	t
1113	FS_1113	Cabinet Medical WACEM	Cabinet Médical	5	t
1114	FS_1114	Clinique d'accouchements eutociques la victoire	Clinique	5	t
1115	FS_1115	Clinique Mont Des Oliviers	Clinique	5	t
1116	FS_1116	CMS Kouve	CMS	5	t
1117	FS_1117	Hopital de Tabligbo	Hôpital	5	t
1118	FS_1118	Hopital Soeurs de La Providence de Kouve	Hôpital	5	t
1119	FS_1119	JVS (JOURDAIN Vie Sante)	Autre	5	t
1120	FS_1120	ONG SWAA Togo	Autre	5	t
1121	FS_1121	USP Amédzrovikondji	USP	5	t
1122	FS_1122	USP Amoussime	USP	5	t
1123	FS_1123	USP Gabadjin	USP	5	t
1124	FS_1124	USP Kinikondji	USP	5	t
1125	FS_1125	USP Tanou	USP	5	t
1126	FS_1126	USP Tonakondji	USP	5	t
1127	FS_1127	CMS Ahepe	CMS	6	t
1128	FS_1128	USP Esse Nadjezogbedji	USP	6	t
1129	FS_1129	USP Esse Zogbedji Nadje	USP	6	t
1130	FS_1130	USP Tchekpo Dedekpoe	USP	6	t
1131	FS_1131	USP Tchekpo Deve	USP	6	t
1132	FS_1132	USP Yotokope	USP	6	t
1133	FS_1133	USP Zafi	USP	6	t
1134	FS_1134	CMS Eau vive de zouvi	CMS	7	t
1135	FS_1135	USP Abossehoe	USP	7	t
1136	FS_1136	USP Afikou-Kondji	USP	7	t
1137	FS_1137	USP Akladjènou	USP	7	t
1138	FS_1138	USP Eau Vive de Zouvi	USP	7	t
1139	FS_1139	USP Esse Ana	USP	7	t
1140	FS_1140	USP Gboto Assigame	USP	7	t
1141	FS_1141	USP Gboto Kossidame	USP	7	t
1142	FS_1142	USP Gboto Vodoupe	USP	7	t
1143	FS_1143	USP Gboto Zeve	USP	7	t
1144	FS_1144	USP Godjinmé	USP	7	t
1145	FS_1145	USP Tokpli	USP	7	t
1146	FS_1146	USP Tomety Kondji	USP	7	t
1147	FS_1147	Action Santé pour Tous Djagblé	Autre	16	t
1148	FS_1148	Actions Initiatives pour le Developpement Social-Sanitaire	Autre	16	t
1149	FS_1149	Aidss Secours Cdea	Autre	16	t
1150	FS_1150	AMC Tsevie	Autre	16	t
1151	FS_1151	Association pour la Promotion de l’education a la Base	Autre	16	t
1152	FS_1152	Cabinet Grace Deî	Cabinet Médical	16	t
1153	FS_1153	Cabinet Medical Ma vie - Zio	Cabinet Médical	16	t
1154	FS_1154	CAPPF	Autre	16	t
1155	FS_1155	Case de Sante de Atsave	Autre	16	t
1156	FS_1156	CHR Tsevie	CHR	16	t
1157	FS_1157	Clinique ATBEF de la commune de Zio 1	Clinique	16	t
1158	FS_1158	Clinique de Gynecologie ISIS	Clinique	16	t
1159	FS_1159	Clinique Djadjavognon	Clinique	16	t
1160	FS_1160	Clinique Mercy House	Clinique	16	t
1161	FS_1161	Clinique Millenium	Clinique	16	t
1162	FS_1162	CMA 2ème RI	Autre	16	t
1163	FS_1163	CMS Ast- Solidarite	CMS	16	t
1164	FS_1164	CMS Eternel Notre Guide	CMS	16	t
1165	FS_1165	CMS La Renaissanse	CMS	16	t
1166	FS_1166	CMS Le Paysan	CMS	16	t
1167	FS_1167	CMS les Merveilles de Dieu	CMS	16	t
1168	FS_1168	CMS Ma vie Lilikope	CMS	16	t
1169	FS_1169	CMS Moderne Saint-Joseph	CMS	16	t
1170	FS_1170	CMS Perseverance	CMS	16	t
1171	FS_1171	CMS Vie Espoir	CMS	16	t
1172	FS_1172	CMS Vie Et Sante	CMS	16	t
1173	FS_1173	Dispensaire Saint Etienne	USP	16	t
1174	FS_1174	Infirmerie de La Prison Civile de Tsévié	Autre	16	t
1175	FS_1175	Infirmerie scolaire CEG la paix de Tsevie	Autre	16	t
1176	FS_1176	Maison medicale	Autre	16	t
1177	FS_1177	ONG ACA	Autre	16	t
1178	FS_1178	ONG Espoir De Vie_Zio (EDV_Zio)	Autre	16	t
1179	FS_1179	ONG Jourdain Vie et Sante	Autre	16	t
1180	FS_1180	Polyclinique Tsevie	Clinique	16	t
1181	FS_1181	USP Abobo	USP	16	t
1182	FS_1182	USP Adangbe	USP	16	t
1183	FS_1183	USP Adjoguidji	USP	16	t
1184	FS_1184	USP Assomé	USP	16	t
1185	FS_1185	USP Dalave	USP	16	t
1186	FS_1186	USP Davie	USP	16	t
1187	FS_1187	USP Djagble	USP	16	t
1188	FS_1188	USP Donon	USP	16	t
1189	FS_1189	USP Gati	USP	16	t
1190	FS_1190	USP Gbatope	USP	16	t
1191	FS_1191	USP Gblainvié Dzogbédji	USP	16	t
1192	FS_1192	USP Have	USP	16	t
1193	FS_1193	USP Kpome Akadjame	USP	16	t
1194	FS_1194	USP Kpome Apeyeme	USP	16	t
1195	FS_1195	USP Lebe	USP	16	t
1196	FS_1196	USP Lilikopé	USP	16	t
1197	FS_1197	USP Sewové	USP	16	t
1198	FS_1198	USP Yobo Sédjro	USP	16	t
1199	FS_1199	Case de Sante Klokpoe	Autre	17	t
1200	FS_1200	Clinique Médicale SEMANOU	Clinique	17	t
1201	FS_1201	USP Alokoegbe	USP	17	t
1202	FS_1202	USP Atinve	USP	17	t
1203	FS_1203	USP Djemekey	USP	17	t
1204	FS_1204	USP Goka Kopé	USP	17	t
1205	FS_1205	USP Klokpoé	USP	17	t
1206	FS_1206	USP Kovie	USP	17	t
1207	FS_1207	USP Mission Tove	USP	17	t
1208	FS_1208	Usp Wli Mivakpo	USP	17	t
1209	FS_1209	USP Wli-Centre	USP	17	t
1210	FS_1210	Case de Sante de Kotchokope	Autre	18	t
1211	FS_1211	CMS Agbelouve	CMS	18	t
1212	FS_1212	CMS Compassion d'Agbélouvé	CMS	18	t
1213	FS_1213	JARDIN DE LA RESURRECTION	Autre	18	t
1214	FS_1214	ONG JVS Lilicope	Autre	18	t
1215	FS_1215	USP Avedje_Zio	USP	18	t
1216	FS_1216	USP Ayakope	USP	18	t
1217	FS_1217	USP Game Seva	USP	18	t
1218	FS_1218	USP Gamefokpe	USP	18	t
1219	FS_1219	USP Gamelili	USP	18	t
1220	FS_1220	USP Kotso Kope	USP	18	t
1221	FS_1221	Centre Ophtalmique la Croyance	Centre de Santé	19	t
1222	FS_1222	CMS ST Paul d'Atchanve	CMS	19	t
1223	FS_1223	USP Gape Aloyi	USP	19	t
1224	FS_1224	USP Gape Avegan	USP	19	t
1225	FS_1225	USP Gape Centre	USP	19	t
1226	FS_1226	USP Gape Dzatikpo	USP	19	t
1227	FS_1227	USP Gape Guindji	USP	19	t
1228	FS_1228	USP Gape Kpedji	USP	19	t
1229	FS_1229	USP Gape Kpodji	USP	19	t
1230	FS_1230	USP Gape Nyassive	USP	19	t
1231	FS_1231	USP Wonougba	USP	19	t
1232	FS_1232	Dispensaire Notre Dame Des Apotres	USP	40	t
1233	FS_1233	Hopital Bethesda D'Agou Nyogbo	Hôpital	40	t
1234	FS_1234	Hopital Prefectoral D'Agou Gare	Hôpital	40	t
1235	FS_1235	USP Agbave	USP	40	t
1236	FS_1236	USP Agoe Gadza	USP	40	t
1237	FS_1237	USP Agou Avedze	USP	40	t
1238	FS_1238	USP Akplolo	USP	40	t
1239	FS_1239	USP Apegame	USP	40	t
1240	FS_1240	USP Assahun-Fiagbe	USP	40	t
1241	FS_1241	USP Avetonou	USP	40	t
1242	FS_1242	USP Blakpa Petsi	USP	40	t
1243	FS_1243	USP Dogbadji	USP	40	t
1244	FS_1244	USP Gadjagan	USP	40	t
1245	FS_1245	USP Gadza Wukpe	USP	40	t
1246	FS_1246	USP Kati	USP	40	t
1247	FS_1247	USP Kebo Djigbe	USP	40	t
1248	FS_1248	USP Kebo Kpeta	USP	40	t
1249	FS_1249	USP Kebo Toe	USP	40	t
1250	FS_1250	USP Klonou	USP	40	t
1251	FS_1251	USP Kologan	USP	40	t
1252	FS_1252	USP Missiobe	USP	40	t
1253	FS_1253	USP Nyogbo	USP	40	t
1254	FS_1254	USP Tomegbe	USP	40	t
1255	FS_1255	USP Zozokondji	USP	40	t
1256	FS_1256	CMS NDA Amoussou Kope	CMS	41	t
1257	FS_1257	USP Adzakpa	USP	41	t
1258	FS_1258	USP Agotime Adame	USP	41	t
1259	FS_1259	USP Agoudouvou	USP	41	t
1260	FS_1260	USP Amoussou Kope	USP	41	t
1261	FS_1261	USP Doglobo	USP	41	t
1262	FS_1262	USP Glekope	USP	41	t
1263	FS_1263	USP Nyitoe	USP	41	t
1264	FS_1264	USP Nyitoe Zukpe	USP	41	t
1265	FS_1265	USP Wonougba-Seva	USP	41	t
1266	FS_1266	CMS Djon-Kotora	CMS	44	t
1267	FS_1267	EDV AKEBOU	Autre	44	t
1268	FS_1268	HD Kougnohou	Autre	44	t
1269	FS_1269	ONG PAHCS	Autre	44	t
1270	FS_1270	TETELESTAÏ AKEBOU	Autre	44	t
1271	FS_1271	USP Brounfou	USP	44	t
1272	FS_1272	USP Gbende	USP	44	t
1273	FS_1273	USP Lonfoloko	USP	44	t
1274	FS_1274	USP Veh Etitiwui	USP	44	t
1275	FS_1275	USP Veh N'kougna	USP	44	t
1276	FS_1276	USP Yalla	USP	44	t
1277	FS_1277	CMA CETTOC	Autre	45	t
1278	FS_1278	USP Ayagba	USP	45	t
1279	FS_1279	USP Danyigan	USP	45	t
1280	FS_1280	USP Kabagni	USP	45	t
1281	FS_1281	USP Kamina (Akebu)	USP	45	t
1282	FS_1282	USP Seregbene	USP	45	t
1283	FS_1283	USP Wodagni	USP	45	t
1284	FS_1284	CHP Amlame	Autre	55	t
1285	FS_1285	CMS Sante Et Vie	CMS	55	t
1286	FS_1286	GRASE POPULATION AMLAME	Autre	55	t
1287	FS_1287	Hopital de Dedome	Hôpital	55	t
1288	FS_1288	Hopital Notre Dame D'Ayome	Hôpital	55	t
1289	FS_1289	PAHCS	Autre	55	t
1290	FS_1290	USP Adiva	USP	55	t
1291	FS_1291	USP Agadji Todji	USP	55	t
1292	FS_1292	USP Ezime	USP	55	t
1293	FS_1293	USP Ketogna-Cope	USP	55	t
1294	FS_1294	USP Koutoukpa	USP	55	t
1295	FS_1295	CMS Amou-Oblo	CMS	56	t
1296	FS_1296	CMS Sodo	CMS	56	t
1297	FS_1297	USP Adogli	USP	56	t
1298	FS_1298	USP Basse	USP	56	t
1299	FS_1299	USP Idokope	USP	56	t
1300	FS_1300	USP Kpategan	USP	56	t
1301	FS_1301	USP Nyile	USP	56	t
1302	FS_1302	USP Patatoukou	USP	56	t
1303	FS_1303	CMA 3ème RI Temedja	Autre	57	t
1304	FS_1304	CMS Hiheatro	CMS	57	t
1305	FS_1305	CMS Temedja	CMS	57	t
1306	FS_1306	Dispensaire de Sevia	USP	57	t
1307	FS_1307	USP Avedje_Amou	USP	57	t
1308	FS_1308	USP Bato	USP	57	t
1309	FS_1309	USP Demadeli Eketo	USP	57	t
1310	FS_1310	USP Didokpo	USP	57	t
1311	FS_1311	USP Evou-Apegame	USP	57	t
1312	FS_1312	USP Game	USP	57	t
1313	FS_1313	USP Iwassi	USP	57	t
1314	FS_1314	USP Oga	USP	57	t
1315	FS_1315	USP Okama	USP	57	t
1316	FS_1316	USP Okpahoue	USP	57	t
1317	FS_1317	USP Otadi	USP	57	t
1318	FS_1318	USP Wakpa	USP	57	t
1319	FS_1319	VEF	Autre	57	t
1320	FS_1320	Association des Jeunes Engages pour l'Action Humanitaire (AJEAH)	Autre	33	t
1321	FS_1321	CMS Atakpa	CMS	33	t
1322	FS_1322	CMS Bethel Anie	CMS	33	t
1323	FS_1323	CMS La Paix	CMS	33	t
1324	FS_1324	Hopital Anie	Hôpital	33	t
1325	FS_1325	USP Agodjololo	USP	33	t
1326	FS_1326	USP Akaba	USP	33	t
1327	FS_1327	USP Kolo Cope	USP	33	t
1328	FS_1328	USP Kpendele	USP	33	t
1329	FS_1329	USP Pallakoko	USP	33	t
1330	FS_1330	Case de Sante Wanou-Cope	Autre	34	t
1331	FS_1331	CMS Ayore	CMS	34	t
1332	FS_1332	USP Adogbenou	USP	34	t
1333	FS_1333	USP Afole	USP	34	t
1334	FS_1334	USP Atchinedji	USP	34	t
1335	FS_1335	USP Foukote-Vossa	USP	34	t
1336	FS_1336	USP Gbagbadjakou	USP	34	t
1337	FS_1337	USP Glitto	USP	34	t
1338	FS_1338	USP Kave	USP	34	t
1339	FS_1339	USP Tchagri Tchakpa	USP	34	t
1340	FS_1340	Case de Sante SOLEIL	Autre	42	t
1341	FS_1341	CHP Apeyeme	Autre	42	t
1342	FS_1342	Dispensaire Dzogbegan	USP	42	t
1343	FS_1343	SILD	Autre	42	t
1344	FS_1344	USP Danyi-Atigba	USP	42	t
1345	FS_1345	USP Koudzragan	USP	42	t
1346	FS_1346	USP Kpeve	USP	42	t
1347	FS_1347	USP N'digbe	USP	42	t
1348	FS_1348	USP Tétébè	USP	42	t
1349	FS_1349	USP Tsadome	USP	42	t
1350	FS_1350	USP Yikpa	USP	42	t
1351	FS_1351	CMS Elavanyo	CMS	43	t
1352	FS_1352	USP Ahlon-Bogo	USP	43	t
1353	FS_1353	USP Danyimé	USP	43	t
1354	FS_1354	USP Denou	USP	43	t
1355	FS_1355	USP Kpeto	USP	43	t
1356	FS_1356	USP Sassanou	USP	43	t
1357	FS_1357	AFVA	Autre	35	t
1358	FS_1358	Cs Sebou-Cope	Autre	35	t
1359	FS_1359	Hopital de L'Ordre Souverain de Malte	Hôpital	35	t
1360	FS_1360	Nouvelle Elite	Autre	35	t
1361	FS_1361	Polyclinique Elavagnon	Clinique	35	t
1362	FS_1362	USP Awayo	USP	35	t
1363	FS_1363	USP Gbadjahe	USP	35	t
1364	FS_1364	USP Ogou-Kolide	USP	35	t
1365	FS_1365	CMS Moretan	CMS	36	t
1366	FS_1366	USP Afodji	USP	36	t
1367	FS_1367	USP Badin Cope	USP	36	t
1368	FS_1368	USP Djouka	USP	36	t
1369	FS_1369	USP Igboloudja	USP	36	t
1370	FS_1370	USP Issati	USP	36	t
1371	FS_1371	USP Kamina (E. Mono)	USP	36	t
1372	FS_1372	USP Modokoute	USP	36	t
1373	FS_1373	USP Ogou-Kinko	USP	36	t
1374	FS_1374	USP Tchekita	USP	36	t
1375	FS_1375	USP Yanda	USP	36	t
1376	FS_1376	USP Yebou-Yebou	USP	36	t
1377	FS_1377	CMS Nyamassila	CMS	37	t
1378	FS_1378	USP Akakpo-Cope	USP	37	t
1379	FS_1379	USP Atikpai	USP	37	t
1380	FS_1380	USP Kpessi	USP	37	t
1381	FS_1381	ADAC	Autre	61	t
1382	FS_1382	Belle Porte	Autre	61	t
1383	FS_1383	Centre de Santé la Grâce	Centre de Santé	61	t
1384	FS_1384	CHP Notse	Autre	61	t
1385	FS_1385	CMS Atchavé	CMS	61	t
1386	FS_1386	CMS Bonté Plus	CMS	61	t
1387	FS_1387	CMS Le Bien Etre Notse	CMS	61	t
1388	FS_1388	CPECUS NOTSE	Autre	61	t
1389	FS_1389	Espoir	Autre	61	t
1390	FS_1390	Infimerie Cuori Grandi	Autre	61	t
1391	FS_1391	Infirmerie de la Prison Civile Notse	Autre	61	t
1392	FS_1392	Jourdin Vie et Santé	Autre	61	t
1393	FS_1393	Notre Dame de la Sante (NDS)	Autre	61	t
1394	FS_1394	OHDS-Togo	Autre	61	t
1395	FS_1395	USP AGOTO	USP	61	t
1396	FS_1396	USP Amakpape	USP	61	t
1397	FS_1397	USP Batoume - Haho	USP	61	t
1398	FS_1398	USP Dalia	USP	61	t
1399	FS_1399	USP Hahomegbe	USP	61	t
1400	FS_1400	USP Kloegname	USP	61	t
1401	FS_1401	USP Kpegadje	USP	61	t
1402	FS_1402	Centre de santé Jésus est la solution_Kpove	Centre de Santé	62	t
1403	FS_1403	CMS Asrama	CMS	62	t
1404	FS_1404	CMS Kame	CMS	62	t
1405	FS_1405	USP Gbowlé	USP	62	t
1406	FS_1406	USP Kponou	USP	62	t
1407	FS_1407	USP Kpove	USP	62	t
1408	FS_1408	USP Tetetou	USP	62	t
1409	FS_1409	USP Agbati	USP	63	t
1410	FS_1410	USP Akpakpakpe	USP	63	t
1411	FS_1411	USP Avassikpe	USP	63	t
1412	FS_1412	USP Azakpé	USP	63	t
1413	FS_1413	USP Kpédiké	USP	63	t
1414	FS_1414	USP Tsinigan	USP	63	t
1415	FS_1415	Cabinet de Soins Infirmiers Espérance Vie	Cabinet Médical	64	t
1416	FS_1416	CMS Wahala	CMS	64	t
1417	FS_1417	USP Bayacopé	USP	64	t
1418	FS_1418	USP Dindou	USP	64	t
1419	FS_1419	USP Haito	USP	64	t
1420	FS_1420	USP Huilehoe	USP	64	t
1421	FS_1421	USP Kpegnon-Adja	USP	64	t
1422	FS_1422	ACDIC	Autre	48	t
1423	FS_1423	Alter Togo	Autre	48	t
1424	FS_1424	Association Femmes Solidaires – Togo (AFES – TOGO )	Autre	48	t
1425	FS_1425	Cabinet MEDICAL FRATERNITE	Cabinet Médical	48	t
1426	FS_1426	CENTRE MNT Kpalimé	Centre de Santé	48	t
1427	FS_1427	CHP Kpalime	Autre	48	t
1428	FS_1428	Clinique Bethel de Kpalimé	Clinique	48	t
1429	FS_1429	Clinique des Plateaux	Clinique	48	t
1430	FS_1430	Clinique Jesus Sauve	Clinique	48	t
1431	FS_1431	CMS Agir Pour La Sante	CMS	48	t
1432	FS_1432	CMS Amitie	CMS	48	t
1433	FS_1433	CMS Anna Maria Kpalimé	CMS	48	t
1434	FS_1434	CMS CPECUS Kpalimé	CMS	48	t
1435	FS_1435	CMS Kpadape	CMS	48	t
1436	FS_1436	CMS Kpogadzi	CMS	48	t
1437	FS_1437	CMS LA GRACE	CMS	48	t
1438	FS_1438	CMS La Lumiere	CMS	48	t
1439	FS_1439	CMS La Renaissance	CMS	48	t
1440	FS_1440	CMS Nogo	CMS	48	t
1441	FS_1441	CMS ODEAH	CMS	48	t
1442	FS_1442	CMS Rophe	CMS	48	t
1443	FS_1443	CMS Santé Solidaire	CMS	48	t
1444	FS_1444	CMS Sauver La Vie	CMS	48	t
1445	FS_1445	CMS Solidarite	CMS	48	t
1446	FS_1446	CMS Union	CMS	48	t
1447	FS_1447	EDV Kloto	Autre	48	t
1448	FS_1448	Espoir de Vie (EDV)	Autre	48	t
1449	FS_1449	Espoir de vie_Kloto (EDV_Kloto)	Autre	48	t
1450	FS_1450	Infirmerie Contaction	Autre	48	t
1451	FS_1451	Infirmerie Cretfp Kpalime	Autre	48	t
1452	FS_1452	Infirmerie de la Prison Civile Kpalime	Autre	48	t
1453	FS_1453	Infirmerie ESCADRON GN Kpalimé	Autre	48	t
1454	FS_1454	Infirmerie Infa Tove	Autre	48	t
1455	FS_1455	Infirmerie Lycee de Kpodzi	Autre	48	t
1456	FS_1456	ONG AMC Kpalime	Autre	48	t
1457	FS_1457	ONG APMED	Autre	48	t
1458	FS_1458	ONG ASTERADHD	Autre	48	t
1459	FS_1459	ONG CAPLAD	Autre	48	t
1460	FS_1460	ONG CPIBE-VISION 2000	Autre	48	t
1461	FS_1461	ONG ODEAH	Autre	48	t
1462	FS_1462	ONG SILD	Autre	48	t
1463	FS_1463	Polyclinique Kpalime	Clinique	48	t
1464	FS_1464	SA Kpalime	Autre	48	t
1465	FS_1465	Solidarite et Aide par le Volontariat International pour la Restriction (SAVOIR)	Autre	48	t
1466	FS_1466	USP Agrippa-Todzi	USP	48	t
1467	FS_1467	USP Atchave	USP	48	t
1468	FS_1468	USP Babakodzi	USP	48	t
1469	FS_1469	USP Gbalave	USP	48	t
1470	FS_1470	USP Hanyigba-Todzi	USP	48	t
1471	FS_1471	USP Klomayondi	USP	48	t
1472	FS_1472	USP Ocdi/Tsihinu	USP	48	t
1473	FS_1473	USP Saint Augustin	USP	48	t
1474	FS_1474	USP St ARNOLD JANSSEN	USP	48	t
1475	FS_1475	USP Tome	USP	48	t
1476	FS_1476	USP Tove	USP	48	t
1477	FS_1477	USP Wome	USP	48	t
1478	FS_1478	USP Yokele	USP	48	t
1479	FS_1479	CMS KLOTO 2	CMS	49	t
1480	FS_1480	CMS Vie En Abondance	CMS	49	t
1481	FS_1481	USP Agotime-Kope	USP	49	t
1482	FS_1482	USP Blifou	USP	49	t
1483	FS_1483	USP Kpime	USP	49	t
1484	FS_1484	USP Lavie	USP	49	t
1485	FS_1485	USP Lavie Agouiepe	USP	49	t
1486	FS_1486	CMS Avenir Meilleur	CMS	50	t
1487	FS_1487	CMS N.D. Misericorde	CMS	50	t
1488	FS_1488	ONG CADR	Autre	50	t
1489	FS_1489	USP Agome Tomegbe	USP	50	t
1490	FS_1490	USP Agome Yoh	USP	50	t
1491	FS_1491	USP Kuma Adame	USP	50	t
1492	FS_1492	USP Kuma Apoti	USP	50	t
1493	FS_1493	USP Kuma Dunyo	USP	50	t
1494	FS_1494	USP Kuma Konda	USP	50	t
1495	FS_1495	Association Le Meilleurs Amis(ALMA)	Autre	46	t
1496	FS_1496	Cabinet Cristal	Cabinet Médical	46	t
1497	FS_1497	CHP Adeta	Autre	46	t
1498	FS_1498	CMS Jehovah Jire	CMS	46	t
1499	FS_1499	Cs Guebakui	Autre	46	t
1500	FS_1500	Dispensaire Gloire A Dieu-Afad	USP	46	t
1501	FS_1501	GRASE Population	Autre	46	t
1502	FS_1502	Hopital Baptiste Biblique Tsiko	Hôpital	46	t
1503	FS_1503	USP Akata Agame	USP	46	t
1504	FS_1504	USP Akata Dzokpe	USP	46	t
1505	FS_1505	USP Bodze	USP	46	t
1506	FS_1506	USP Govié - Akpato	USP	46	t
1507	FS_1507	USP Kpekpeta	USP	46	t
1508	FS_1508	USP Tutu	USP	46	t
1509	FS_1509	USP Zionou	USP	46	t
1510	FS_1510	CMS Asg-Afad/Eleme	CMS	47	t
1511	FS_1511	CMS Goudeve	CMS	47	t
1512	FS_1512	CMS Kpele Ele	CMS	47	t
1513	FS_1513	Cs Afad/Dzeibo	Autre	47	t
1514	FS_1514	USP Kpeglo	USP	47	t
1515	FS_1515	USP Kpele Agave	USP	47	t
1516	FS_1516	USP Kpélé Dafo	USP	47	t
1517	FS_1517	USP Mamakope	USP	47	t
1518	FS_1518	USP Tchadomé	USP	47	t
1519	FS_1519	Belle Porte	Autre	38	t
1520	FS_1520	CHP Tohoun	Autre	38	t
1521	FS_1521	USP Ahassome	USP	38	t
1522	FS_1522	USP Gbogbo	USP	38	t
1523	FS_1523	USP Lonmey azahoe	USP	38	t
1524	FS_1524	USP Tado	USP	38	t
1525	FS_1525	CMS de Kativou	CMS	39	t
1526	FS_1526	IAU - Togo	Autre	39	t
1527	FS_1527	USP DETOKPO	USP	39	t
1528	FS_1528	USP Katome	USP	39	t
1529	FS_1529	USP Kpekpleme	USP	39	t
1530	FS_1530	USP Saligbe	USP	39	t
1531	FS_1531	ACDEP	Autre	51	t
1532	FS_1532	AFOLSI	Autre	51	t
1533	FS_1533	APAS	Autre	51	t
1534	FS_1534	ATPDC	Autre	51	t
1535	FS_1535	Cabinet Medical Adn	Cabinet Médical	51	t
1536	FS_1536	Cabinet Medical Piscine de Siloe	Cabinet Médical	51	t
1537	FS_1537	Cabinet Medical St Jude	Cabinet Médical	51	t
1538	FS_1538	CAMPAGNE DES FEMMES	Autre	51	t
1539	FS_1539	Cercle de Réflexion pour l’Emergence des Jeunes	Autre	51	t
1540	FS_1540	CHR Atakpame	CHR	51	t
1541	FS_1541	Clinique ATBEF Atakpame	Clinique	51	t
1542	FS_1542	CLINIQUE ESPERENCE 22	Clinique	51	t
1543	FS_1543	CMS Anna Maria - Atakpame	CMS	51	t
1544	FS_1544	CMS Bon Secours	CMS	51	t
1545	FS_1545	CMS Jean Baptiste	CMS	51	t
1546	FS_1546	CMS LA TRINITE	CMS	51	t
1547	FS_1547	CMS MIDOUDOU	CMS	51	t
1548	FS_1548	CMS Mon Berger	CMS	51	t
1549	FS_1549	CMS Notre Dame de La Consolation	CMS	51	t
1550	FS_1550	CRAO Atakpame	Autre	51	t
1551	FS_1551	Infirmerie de la Prison Civile Atakpame	Autre	51	t
1552	FS_1552	ODIAE	Autre	51	t
1553	FS_1553	ODJOUGBO	Autre	51	t
1554	FS_1554	ONG ACDIC	Autre	51	t
1555	FS_1555	ONG Akarale	Autre	51	t
1556	FS_1556	ONG BOYARDD-Afrique	Autre	51	t
1557	FS_1557	ONG CDF	Autre	51	t
1558	FS_1558	ONG CREJe	Autre	51	t
1559	FS_1559	ONG ODHI	Autre	51	t
1560	FS_1560	Polyclinique Atakpame	Clinique	51	t
1561	FS_1561	SANTE ESPOIR TOGO	Autre	51	t
1562	FS_1562	SOS VITA TOGO	Autre	51	t
1563	FS_1563	USP ADOUGBELAN	USP	51	t
1564	FS_1564	USP Agbonou	USP	51	t
1565	FS_1565	USP Agbonou Campement	USP	51	t
1566	FS_1566	USP Awagome	USP	51	t
1567	FS_1567	USP Bocco	USP	51	t
1568	FS_1568	USP Oké-Ekpa	USP	51	t
1569	FS_1569	USP Sada (AT)	USP	51	t
1570	FS_1570	Case de Sante Ilama	Autre	52	t
1571	FS_1571	CMS AVETE	CMS	52	t
1572	FS_1572	CMS Sainte Marie Ilama	CMS	52	t
1573	FS_1573	Hopital Saint Joseph	Hôpital	52	t
1574	FS_1574	USP Akpare	USP	52	t
1575	FS_1575	USP Datcha	USP	52	t
1576	FS_1576	USP Kelekpe	USP	52	t
1577	FS_1577	USP Kpakpo	USP	52	t
1578	FS_1578	Centre Hospitalier Ophtalmologique de Glei	Centre de Santé	53	t
1579	FS_1579	CMS Bien Etre Glei	CMS	53	t
1580	FS_1580	CMS Glei	CMS	53	t
1581	FS_1581	CMS Le Salut	CMS	53	t
1582	FS_1582	USP ATAKPARA	USP	53	t
1583	FS_1583	USP Madjamakou	USP	53	t
1584	FS_1584	USP Medjegni	USP	53	t
1585	FS_1585	Poste de Secours La Fraternite	Autre	54	t
1586	FS_1586	USP Atchakoe-Carrefour	USP	54	t
1587	FS_1587	USP Homagan	USP	54	t
1588	FS_1588	USP Ountivou	USP	54	t
1589	FS_1589	Centre Ophtalmologie Havilolo st Jean XXIII de Babou	Centre de Santé	58	t
1590	FS_1590	CHP Badou	Autre	58	t
1591	FS_1591	CMS Kpete Maflo	CMS	58	t
1592	FS_1592	CMS Notre Dame de Lourdes	CMS	58	t
1593	FS_1593	EDV-WAWA	Autre	58	t
1594	FS_1594	TETELESTAI TOGO	Autre	58	t
358	FS_0358	CM Veritas	Autre	26	t
1595	FS_1595	USP Akloa Tomegbe	USP	58	t
1596	FS_1596	USP Anonoe	USP	58	t
1597	FS_1597	USP Badou Djindji	USP	58	t
1598	FS_1598	USP Kessibo-Abrewankor	USP	58	t
1599	FS_1599	USP Kessibo-Wawa	USP	58	t
1600	FS_1600	USP Kpete-Bena	USP	58	t
1601	FS_1601	USP Mangoassi	USP	58	t
1602	FS_1602	CMS Ona	CMS	59	t
1603	FS_1603	USP Adomi Plateau	USP	59	t
1604	FS_1604	USP Agbo-Kope	USP	59	t
1605	FS_1605	USP Gbadi N'kougna	USP	59	t
1606	FS_1606	USP Gobe	USP	59	t
1607	FS_1607	CMS Todome	CMS	60	t
1608	FS_1608	USP Bena Plateau	USP	60	t
1609	FS_1609	USP Benali	USP	60	t
1610	FS_1610	USP Doume	USP	60	t
1611	FS_1611	USP Imoussa-Oudje	USP	60	t
1612	FS_1612	USP Klabe Apegame	USP	60	t
1613	FS_1613	USP Klabe-Efoukpa	USP	60	t
1614	FS_1614	USP Okou	USP	60	t
1615	FS_1615	USP Ounabe	USP	60	t
1616	FS_1616	USP Zogbegan	USP	60	t
1617	FS_1617	Cabinet Medical Wende Panga	Cabinet Médical	102	t
1618	FS_1618	Clinique HACHIMYA	Clinique	102	t
1619	FS_1619	CMS la Grace	CMS	102	t
1620	FS_1620	Hopital de Cinkasse	Hôpital	102	t
1621	FS_1621	USP Boade	USP	102	t
1622	FS_1622	USP Kodizoaga	USP	102	t
1623	FS_1623	CMS Timbou	CMS	103	t
1624	FS_1624	Hopital Braun de Cinkasse	Hôpital	103	t
1625	FS_1625	USP Biankouri	USP	103	t
1626	FS_1626	USP Nadjoundi	USP	103	t
1627	FS_1627	USP Safobé 2	USP	103	t
1628	FS_1628	USP Sam-Naba	USP	103	t
1629	FS_1629	USP Tabi	USP	103	t
1630	FS_1630	Case de Sante Ogaro	Autre	108	t
1631	FS_1631	CHP Mandouri	Autre	108	t
1632	FS_1632	USP Bagre	USP	108	t
1633	FS_1633	USP Koundjoare	USP	108	t
1634	FS_1634	USP Pansieri	USP	108	t
1635	FS_1635	USP Sanloaga	USP	108	t
1636	FS_1636	USP Borgou	USP	109	t
1637	FS_1637	USP Gbantchal	USP	109	t
1638	FS_1638	CHP Naki-Est	Autre	110	t
1639	FS_1639	CMS Nayega	CMS	110	t
1640	FS_1640	USP Ogaro	USP	110	t
1641	FS_1641	USP Ogaro Centre	USP	110	t
1642	FS_1642	USP TAMATOUGOU	USP	110	t
1643	FS_1643	CMS Galle	CMS	111	t
1644	FS_1644	CMS Namoundjoga	CMS	111	t
1645	FS_1645	USP Djignandjoaga	USP	111	t
1646	FS_1646	USP Kwampit-Bong	USP	111	t
1647	FS_1647	USP Malgbangou	USP	111	t
1648	FS_1648	USP Papri	USP	111	t
1649	FS_1649	USP Pognon	USP	111	t
1650	FS_1650	USP Tambonga	USP	111	t
1651	FS_1651	USP Tchimouri	USP	111	t
1652	FS_1652	AIDSS MANGO	Autre	112	t
1653	FS_1653	CCEJ - Mango - Centre Convivial et d'Ecoute des Jeunes de Mango	Centre de Santé	112	t
1654	FS_1654	CHP Mango	Autre	112	t
1655	FS_1655	CMA 25ème BB Mango	Autre	112	t
1656	FS_1656	CMS MANGO	CMS	112	t
1657	FS_1657	FED	Autre	112	t
1658	FS_1658	Hopital de L Esperance	Hôpital	112	t
1659	FS_1659	Infirmerie de la prison - Mango	Autre	112	t
1660	FS_1660	Infirmerie Scolaire	Autre	112	t
1661	FS_1661	ONG AJIS(Mango)	Autre	112	t
1662	FS_1662	USP Fare	USP	112	t
1663	FS_1663	USP Koumongoukan	USP	112	t
1664	FS_1664	USP Mantche	USP	112	t
1665	FS_1665	USP Sadori	USP	112	t
1666	FS_1666	USP Saint Dominique	USP	112	t
1667	FS_1667	Case de Sante Gbebonga	Autre	113	t
1668	FS_1668	CMS Barkoissi	CMS	113	t
1669	FS_1669	CMS Providence Divine	CMS	113	t
1670	FS_1670	USP Galangashie	USP	113	t
1671	FS_1671	USP Kadjitiéré	USP	113	t
1672	FS_1672	USP Kampoate	USP	113	t
1673	FS_1673	USP Kankangou	USP	113	t
1674	FS_1674	USP Kerekete	USP	113	t
1675	FS_1675	USP Loko Nassongue	USP	113	t
1676	FS_1676	USP Nagbeni	USP	113	t
1677	FS_1677	USP Tchanaga	USP	113	t
1678	FS_1678	CHP Gando	Autre	114	t
1679	FS_1679	CMS Gando	CMS	114	t
1680	FS_1680	USP Baoule	USP	114	t
1681	FS_1681	USP Kpokou	USP	114	t
1682	FS_1682	USP Mogou	USP	114	t
1683	FS_1683	USP N'Gambi	USP	114	t
1684	FS_1684	USP Sagbiebou	USP	114	t
1685	FS_1685	USP Takpapieni	USP	114	t
1686	FS_1686	USP Tchamonga	USP	114	t
1687	FS_1687	USP Tontondi	USP	114	t
1688	FS_1688	USP Kangounou	USP	115	t
1689	FS_1689	USP Koumongou	USP	115	t
1690	FS_1690	USP Kountoire	USP	115	t
1691	FS_1691	USP N'Foutchè	USP	115	t
1692	FS_1692	USP Nali	USP	115	t
1693	FS_1693	USP Takpamba	USP	115	t
1694	FS_1694	Centre Medico Chirurgical Louis Orione Bombouaka	Centre de Santé	116	t
1695	FS_1695	CHP Tandjoare	Autre	116	t
1696	FS_1696	CMS Bogou	CMS	116	t
1697	FS_1697	CMS Bombouaka	CMS	116	t
1698	FS_1698	CMS St Joseph de Bogou	CMS	116	t
1699	FS_1699	Code Utile AFRIQUE Tandjoare	Autre	116	t
1700	FS_1700	USP Goundoga	USP	116	t
1701	FS_1701	USP Loko	USP	116	t
1702	FS_1702	USP Nassongue	USP	116	t
1703	FS_1703	USP Natigou	USP	116	t
1704	FS_1704	USP Nayergou	USP	116	t
1705	FS_1705	USP Pligou	USP	116	t
1706	FS_1706	USP Sounsouri	USP	116	t
1707	FS_1707	USP Tanabe	USP	116	t
1708	FS_1708	USP Yembour	USP	116	t
1709	FS_1709	CMS Nano	CMS	117	t
1710	FS_1710	USP Bagou	USP	117	t
1711	FS_1711	USP Djaringue	USP	117	t
1712	FS_1712	USP Doukpelou	USP	117	t
1713	FS_1713	USP Kpiérik	USP	117	t
1714	FS_1714	USP Lokpano	USP	117	t
1715	FS_1715	USP Mamprougou	USP	117	t
1716	FS_1716	USP Nadongue	USP	117	t
1717	FS_1717	USP Sissiak	USP	117	t
1718	FS_1718	USP Tampialim	USP	117	t
1719	FS_1719	3ASC	Autre	104	t
1720	FS_1720	Aide Sanitaire Action Action Sociale (ASAS_dapaong)	Autre	104	t
1721	FS_1721	ARC EN CIEL Dapaong	Autre	104	t
1722	FS_1722	Cabinet LAAFIA NAAG	Cabinet Médical	104	t
1723	FS_1723	Cabinet Marie Misericorde	Cabinet Médical	104	t
1724	FS_1724	Cabinet Medical Graziella Med	Cabinet Médical	104	t
1725	FS_1725	Cabinet Migbare	Cabinet Médical	104	t
1726	FS_1726	CDD	Autre	104	t
1727	FS_1727	Centre de Sante Mentale	Centre de Santé	104	t
1728	FS_1728	CHR Dapaong	CHR	104	t
1729	FS_1729	Clinique Mère Enfant( CME)	Clinique	104	t
1730	FS_1730	Clinique Vision valide de Dapaong	Clinique	104	t
1731	FS_1731	Clinique Win'pang	Clinique	104	t
1732	FS_1732	Clinique Yendouboame	Clinique	104	t
1733	FS_1733	CMA 2ème BIR Dapaong	Autre	104	t
1734	FS_1734	CMS Dalwak	CMS	104	t
1735	FS_1735	CMS Dapankpergou	CMS	104	t
1736	FS_1736	CMS Kountongbong	CMS	104	t
1737	FS_1737	CMS Le Bon Secours	CMS	104	t
1738	FS_1738	CMS Maguy	CMS	104	t
1739	FS_1739	CMS MECAP-FR	CMS	104	t
1740	FS_1740	CMS Saint Luc	CMS	104	t
1741	FS_1741	CMS Sepharah	CMS	104	t
1742	FS_1742	CMS SOS Dapaong	CMS	104	t
1743	FS_1743	CMS Source de Vie	CMS	104	t
1744	FS_1744	CRAO Dapaong	Autre	104	t
1745	FS_1745	CRT Savanes	Autre	104	t
1746	FS_1746	FAJ	Autre	104	t
1747	FS_1747	Hopital D'enfant Yendube	Hôpital	104	t
1748	FS_1748	Infirmerie CEG Ville 2	Autre	104	t
1749	FS_1749	Infirmerie CRETFP Dapaong	Autre	104	t
1750	FS_1750	Infirmerie de La Gendarmerie	Autre	104	t
1751	FS_1751	Infirmerie de la prison - Dapaong	Autre	104	t
1752	FS_1752	Infirmerie ENI	Autre	104	t
1753	FS_1753	Infirmerie Lynada	Autre	104	t
1754	FS_1754	Infirmerie St Paul Apôtre des Nations	Autre	104	t
1755	FS_1755	JADIS	Autre	104	t
1756	FS_1756	MECAP-FR	Autre	104	t
1757	FS_1757	Polyclinique Dapaong	Clinique	104	t
1758	FS_1758	RAFIA	Autre	104	t
1759	FS_1759	Reseau Regional des Clubs des Meres des Savanes - 2RCMS	CMS	104	t
1760	FS_1760	SAC SANTE	Autre	104	t
1761	FS_1761	Solidarite pour l’Autopromotion Communautaire en Sante	Autre	104	t
1762	FS_1762	USP Bidjenga	USP	104	t
1763	FS_1763	USP Bougou	USP	104	t
1764	FS_1764	USP Dampiong	USP	104	t
1765	FS_1765	USP El Sahaba	USP	104	t
1766	FS_1766	USP Kourientre	USP	104	t
1767	FS_1767	USP Margba	USP	104	t
1768	FS_1768	USP Pana	USP	104	t
1769	FS_1769	USP Pana-Bagou	USP	104	t
1770	FS_1770	USP Poissongui	USP	104	t
1771	FS_1771	USP Tangbaré	USP	104	t
1772	FS_1772	USP Tanikagou	USP	104	t
1773	FS_1773	USP Tchiegle	USP	104	t
1774	FS_1774	USP Yendong	USP	104	t
1775	FS_1775	CMS Naki-Ouest	CMS	105	t
1776	FS_1776	USP Datoudjina	USP	105	t
1777	FS_1777	USP Namare	USP	105	t
1778	FS_1778	USP Nanergou	USP	105	t
1779	FS_1779	Infirmerie CMA (NIOUKPOURMA)	Autre	106	t
1780	FS_1780	USP Lotogou	USP	106	t
1781	FS_1781	USP Makou	USP	106	t
1782	FS_1782	USP Nioukpourma	USP	106	t
1783	FS_1783	USP Tami	USP	106	t
1784	FS_1784	USP Warkambou	USP	106	t
1785	FS_1785	ADS	Autre	107	t
1786	FS_1786	CMS Korbongou	CMS	107	t
1787	FS_1787	CMS Yendube Korbongou	CMS	107	t
1788	FS_1788	USP Idondjoag	USP	107	t
1789	FS_1789	USP Kantindi	USP	107	t
1790	FS_1790	USP LOUANGA	USP	107	t
1791	FS_1791	USP Sanfatoute	USP	107	t
1792	FS_1792	USP Tankomonte	USP	107	t
1793	FS_1793	USP Yemboate	USP	107	t
\.


--
-- TOC entry 5141 (class 0 OID 17230)
-- Dependencies: 244
-- Data for Name: historique_affectations_superviseurs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historique_affectations_superviseurs (id, formation_sanitaire_id, ancien_superviseur_id, nouveau_superviseur_id, administrateur_id, action, date_operation) FROM stdin;
2	283	\N	14	9	affectation_initiale	2026-11-02 19:55:42.489976+00
3	912	\N	15	9	affectation_initiale	2026-11-02 19:59:42.667074+00
\.


--
-- TOC entry 5131 (class 0 OID 17092)
-- Dependencies: 234
-- Data for Name: historique_modifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historique_modifications (id, fiche_id, utilisateur_id, date_operation, ancienne_version, nouvelle_version, changements, operation) FROM stdin;
\.


--
-- TOC entry 5133 (class 0 OID 17112)
-- Dependencies: 236
-- Data for Name: historique_permutations_affectations; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historique_permutations_affectations (id, agent_a_id, agent_b_id, administrateur_id, ancienne_fs_a_id, nouvelle_fs_a_id, ancienne_fs_b_id, nouvelle_fs_b_id, date_operation) FROM stdin;
\.


--
-- TOC entry 5137 (class 0 OID 17180)
-- Dependencies: 240
-- Data for Name: historique_supervision; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.historique_supervision (id, demande_id, utilisateur_id, evenement, details, cree_le) FROM stdin;
\.


--
-- TOC entry 5129 (class 0 OID 17075)
-- Dependencies: 232
-- Data for Name: journal_synchronisation; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.journal_synchronisation (id, fiche_id, utilisateur_id, operation_id, statut, message, cree_le) FROM stdin;
\.


--
-- TOC entry 5143 (class 0 OID 17262)
-- Dependencies: 246
-- Data for Name: livraisons_notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.livraisons_notifications (id, notification_id, fiche_id, canal, destinataire, contenu, statut, tentatives, prochaine_tentative, derniere_erreur, cree_le, envoye_le) FROM stdin;
\.


--
-- TOC entry 5139 (class 0 OID 17208)
-- Dependencies: 242
-- Data for Name: notifications; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.notifications (id, utilisateur_id, type, titre, message, fiche_id, cree_le, lue_le) FROM stdin;
\.


--
-- TOC entry 5120 (class 0 OID 16962)
-- Dependencies: 223
-- Data for Name: prefectures; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.prefectures (id, code, libelle, region_id) FROM stdin;
1	PREF_GOLFE	Golfe	1
2	PREF_AGOE_NYIVE	Agoè-Nyivé	1
3	PREF_ZIO	Zio	1
4	PREF_YOTO	Yoto	1
5	PREF_BAS_MONO	Bas-Mono	1
6	PREF_LACS	Lacs	1
7	PREF_VO	Vo	1
8	PREF_AVE	Avé	1
9	PREF_OGOU	Ogou	2
10	PREF_MOYEN_MONO	Moyen-Mono	2
11	PREF_HAHO	Haho	2
12	PREF_AGOU	Agou	2
13	PREF_KLOTO	Kloto	2
14	PREF_KPELE	Kpélé	2
15	PREF_DANYI	Danyi	2
16	PREF_WAWA	Wawa	2
17	PREF_AKEBOU	Akébou	2
18	PREF_AMOU	Amou	2
19	PREF_ANIE	Anié	2
20	PREF_EST_MONO	Est-Mono	2
21	PREF_TCHAOUDJO	Tchaoudjo	3
22	PREF_TCHAMBA	Tchamba	3
23	PREF_BLITTA	Blitta	3
24	PREF_SOTOUBOUA	Sotouboua	3
25	PREF_MO	Mô	3
26	PREF_KOZAH	Kozah	4
27	PREF_ASSOLI	Assoli	4
28	PREF_BASSAR	Bassar	4
29	PREF_DANKPEN	Dankpen	4
30	PREF_KERAN	Kéran	4
31	PREF_DOUFELGOU	Doufelgou	4
32	PREF_BINAH	Binah	4
33	PREF_TONE	Tône	5
34	PREF_CINKASSE	Cinkassé	5
35	PREF_KPENDJAL_OUEST	Kpendjal-Ouest	5
36	PREF_KPENDJAL	Kpendjal	5
37	PREF_OTI_SUD	Oti-Sud	5
38	PREF_OTI	Oti	5
39	PREF_TANDJOARE	Tandjoaré	5
\.


--
-- TOC entry 5116 (class 0 OID 16944)
-- Dependencies: 219
-- Data for Name: regions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.regions (id, code, libelle) FROM stdin;
1	MAR	Maritime
2	PLA	Plateaux
3	CEN	Centrale
4	KAR	Kara
5	SAV	Savanes
\.


--
-- TOC entry 5118 (class 0 OID 16953)
-- Dependencies: 221
-- Data for Name: types_tdr; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.types_tdr (id, code, libelle, actif) FROM stdin;
1	TDR_PALUDISME	TDR paludisme	t
\.


--
-- TOC entry 5126 (class 0 OID 17008)
-- Dependencies: 229
-- Data for Name: utilisateurs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.utilisateurs (id, nom, prenom, email, password_hash, fonction, role, formation_sanitaire_id, commune_id, prefecture_id, region_id, actif, cree_le, telephone) FROM stdin;
10	ASSIH	Paul	paul@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$IDIEkFUna9YILOHeTLPsSg$2qda/DqB47sLr0f6n04QJMvcFRglBb4kOf9i6PzKcFM	Agent FS	agent_fs	912	83	26	4	t	2026-11-02 18:28:26.24332+00	+22893494537
9	KADJADO	Pascal	kadjadopascal81@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$UTYWiSJs5UpB5LYZX1nOSQ$iEmN36YBQuSzMLJtCjMwfB5VxXKa7w1X92z/w2qBzwE	Administrateur	administrateur_national	\N	\N	\N	\N	t	2026-11-02 17:27:30.257291+00	+22893494560
12	PALI	salomon	salomon@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$Q1uiCf/jzhQVrk/5a9XyaQ$4FjoQKbqPdqx72F2gwJCJTL2lvIbP/ICbBLi8RInjkk	Agent FS	agent_fs	283	22	2	1	t	2026-11-02 18:41:40.033236+00	+22893484560
14	DJESSI	Komla	komla@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$AyzO+yE7mGKGIf4fCXEgzg$vqTi6842QkIxOzvZOthGjOOj4cUq/A5xHxHn8fBv5jo	Superviseur	superviseur	283	\N	\N	\N	t	2026-11-02 19:55:42.48553+00	+22893494562
15	OURO	Alassani	ouro@gmail.com	$argon2id$v=19$m=65536,t=3,p=4$8+Ag4lGMIehip2q1NbdSXQ$ojp1A+UQioyF2qVKAip3q+ji2RGLi5YlJoyHBq37nUk	Superviseur	superviseur	912	\N	\N	\N	t	2026-11-02 19:59:42.664103+00	+22893494563
\.


--
-- TOC entry 5166 (class 0 OID 0)
-- Dependencies: 247
-- Name: appareils_push_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.appareils_push_id_seq', 8, true);


--
-- TOC entry 5167 (class 0 OID 0)
-- Dependencies: 224
-- Name: communes_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.communes_id_seq', 117, true);


--
-- TOC entry 5168 (class 0 OID 0)
-- Dependencies: 237
-- Name: demandes_correction_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.demandes_correction_id_seq', 1, false);


--
-- TOC entry 5169 (class 0 OID 0)
-- Dependencies: 226
-- Name: formations_sanitaires_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.formations_sanitaires_id_seq', 245, true);


--
-- TOC entry 5170 (class 0 OID 0)
-- Dependencies: 243
-- Name: historique_affectations_superviseurs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historique_affectations_superviseurs_id_seq', 3, true);


--
-- TOC entry 5171 (class 0 OID 0)
-- Dependencies: 233
-- Name: historique_modifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historique_modifications_id_seq', 3, true);


--
-- TOC entry 5172 (class 0 OID 0)
-- Dependencies: 235
-- Name: historique_permutations_affectations_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historique_permutations_affectations_id_seq', 2, true);


--
-- TOC entry 5173 (class 0 OID 0)
-- Dependencies: 239
-- Name: historique_supervision_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.historique_supervision_id_seq', 1, false);


--
-- TOC entry 5174 (class 0 OID 0)
-- Dependencies: 231
-- Name: journal_synchronisation_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.journal_synchronisation_id_seq', 1, false);


--
-- TOC entry 5175 (class 0 OID 0)
-- Dependencies: 245
-- Name: livraisons_notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.livraisons_notifications_id_seq', 3, true);


--
-- TOC entry 5176 (class 0 OID 0)
-- Dependencies: 241
-- Name: notifications_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.notifications_id_seq', 7, true);


--
-- TOC entry 5177 (class 0 OID 0)
-- Dependencies: 222
-- Name: prefectures_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.prefectures_id_seq', 39, true);


--
-- TOC entry 5178 (class 0 OID 0)
-- Dependencies: 218
-- Name: regions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.regions_id_seq', 5, true);


--
-- TOC entry 5179 (class 0 OID 0)
-- Dependencies: 220
-- Name: types_tdr_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.types_tdr_id_seq', 1, true);


--
-- TOC entry 5180 (class 0 OID 0)
-- Dependencies: 228
-- Name: utilisateurs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.utilisateurs_id_seq', 15, true);


--
-- TOC entry 4856 (class 2606 OID 16942)
-- Name: alembic_version alembic_version_pkc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.alembic_version
    ADD CONSTRAINT alembic_version_pkc PRIMARY KEY (version_num);


--
-- TOC entry 4931 (class 2606 OID 17300)
-- Name: appareils_push appareils_push_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appareils_push
    ADD CONSTRAINT appareils_push_pkey PRIMARY KEY (id);


--
-- TOC entry 4871 (class 2606 OID 16984)
-- Name: communes communes_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communes
    ADD CONSTRAINT communes_code_key UNIQUE (code);


--
-- TOC entry 4873 (class 2606 OID 16982)
-- Name: communes communes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communes
    ADD CONSTRAINT communes_pkey PRIMARY KEY (id);


--
-- TOC entry 4910 (class 2606 OID 17165)
-- Name: demandes_correction demandes_correction_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_correction
    ADD CONSTRAINT demandes_correction_pkey PRIMARY KEY (id);


--
-- TOC entry 4888 (class 2606 OID 17055)
-- Name: fiches_paludisme fiches_paludisme_numero_fiche_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fiches_paludisme
    ADD CONSTRAINT fiches_paludisme_numero_fiche_key UNIQUE (numero_fiche);


--
-- TOC entry 4890 (class 2606 OID 17051)
-- Name: fiches_paludisme fiches_paludisme_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fiches_paludisme
    ADD CONSTRAINT fiches_paludisme_pkey PRIMARY KEY (id);


--
-- TOC entry 4876 (class 2606 OID 17000)
-- Name: formations_sanitaires formations_sanitaires_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formations_sanitaires
    ADD CONSTRAINT formations_sanitaires_code_key UNIQUE (code);


--
-- TOC entry 4878 (class 2606 OID 16998)
-- Name: formations_sanitaires formations_sanitaires_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formations_sanitaires
    ADD CONSTRAINT formations_sanitaires_pkey PRIMARY KEY (id);


--
-- TOC entry 4923 (class 2606 OID 17236)
-- Name: historique_affectations_superviseurs historique_affectations_superviseurs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_affectations_superviseurs
    ADD CONSTRAINT historique_affectations_superviseurs_pkey PRIMARY KEY (id);


--
-- TOC entry 4902 (class 2606 OID 17099)
-- Name: historique_modifications historique_modifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_modifications
    ADD CONSTRAINT historique_modifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4905 (class 2606 OID 17117)
-- Name: historique_permutations_affectations historique_permutations_affectations_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_permutations_affectations
    ADD CONSTRAINT historique_permutations_affectations_pkey PRIMARY KEY (id);


--
-- TOC entry 4915 (class 2606 OID 17187)
-- Name: historique_supervision historique_supervision_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_supervision
    ADD CONSTRAINT historique_supervision_pkey PRIMARY KEY (id);


--
-- TOC entry 4898 (class 2606 OID 17084)
-- Name: journal_synchronisation journal_synchronisation_operation_id_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_synchronisation
    ADD CONSTRAINT journal_synchronisation_operation_id_key UNIQUE (operation_id);


--
-- TOC entry 4900 (class 2606 OID 17082)
-- Name: journal_synchronisation journal_synchronisation_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_synchronisation
    ADD CONSTRAINT journal_synchronisation_pkey PRIMARY KEY (id);


--
-- TOC entry 4929 (class 2606 OID 17275)
-- Name: livraisons_notifications livraisons_notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.livraisons_notifications
    ADD CONSTRAINT livraisons_notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4921 (class 2606 OID 17215)
-- Name: notifications notifications_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT notifications_pkey PRIMARY KEY (id);


--
-- TOC entry 4867 (class 2606 OID 16969)
-- Name: prefectures prefectures_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prefectures
    ADD CONSTRAINT prefectures_code_key UNIQUE (code);


--
-- TOC entry 4869 (class 2606 OID 16967)
-- Name: prefectures prefectures_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prefectures
    ADD CONSTRAINT prefectures_pkey PRIMARY KEY (id);


--
-- TOC entry 4858 (class 2606 OID 16951)
-- Name: regions regions_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_code_key UNIQUE (code);


--
-- TOC entry 4860 (class 2606 OID 16949)
-- Name: regions regions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.regions
    ADD CONSTRAINT regions_pkey PRIMARY KEY (id);


--
-- TOC entry 4862 (class 2606 OID 16960)
-- Name: types_tdr types_tdr_code_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.types_tdr
    ADD CONSTRAINT types_tdr_code_key UNIQUE (code);


--
-- TOC entry 4864 (class 2606 OID 16958)
-- Name: types_tdr types_tdr_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.types_tdr
    ADD CONSTRAINT types_tdr_pkey PRIMARY KEY (id);


--
-- TOC entry 4934 (class 2606 OID 17302)
-- Name: appareils_push uq_appareils_push_jeton; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appareils_push
    ADD CONSTRAINT uq_appareils_push_jeton UNIQUE (jeton);


--
-- TOC entry 4895 (class 2606 OID 17053)
-- Name: fiches_paludisme uq_fiche_fs_date_numoc; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fiches_paludisme
    ADD CONSTRAINT uq_fiche_fs_date_numoc UNIQUE (formation_sanitaire_id, date_consultation, num_oc);


--
-- TOC entry 4882 (class 2606 OID 17260)
-- Name: utilisateurs uq_utilisateur_telephone; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT uq_utilisateur_telephone UNIQUE (telephone);


--
-- TOC entry 4884 (class 2606 OID 17018)
-- Name: utilisateurs utilisateurs_email_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_email_key UNIQUE (email);


--
-- TOC entry 4886 (class 2606 OID 17016)
-- Name: utilisateurs utilisateurs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_pkey PRIMARY KEY (id);


--
-- TOC entry 4932 (class 1259 OID 17308)
-- Name: ix_appareils_push_utilisateur_actif; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_appareils_push_utilisateur_actif ON public.appareils_push USING btree (utilisateur_id, actif);


--
-- TOC entry 4874 (class 1259 OID 16990)
-- Name: ix_communes_prefecture_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_communes_prefecture_id ON public.communes USING btree (prefecture_id);


--
-- TOC entry 4911 (class 1259 OID 17176)
-- Name: ix_demande_correction_fiche_statut; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_demande_correction_fiche_statut ON public.demandes_correction USING btree (fiche_id, statut);


--
-- TOC entry 4912 (class 1259 OID 17177)
-- Name: ix_demandes_correction_fiche_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_demandes_correction_fiche_id ON public.demandes_correction USING btree (fiche_id);


--
-- TOC entry 4913 (class 1259 OID 17178)
-- Name: ix_demandes_correction_superviseur_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_demandes_correction_superviseur_id ON public.demandes_correction USING btree (superviseur_id);


--
-- TOC entry 4891 (class 1259 OID 17071)
-- Name: ix_fiche_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_fiche_date ON public.fiches_paludisme USING btree (date_consultation);


--
-- TOC entry 4892 (class 1259 OID 17072)
-- Name: ix_fiche_fs_date; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_fiche_fs_date ON public.fiches_paludisme USING btree (formation_sanitaire_id, date_consultation);


--
-- TOC entry 4893 (class 1259 OID 17073)
-- Name: ix_fiches_paludisme_formation_sanitaire_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_fiches_paludisme_formation_sanitaire_id ON public.fiches_paludisme USING btree (formation_sanitaire_id);


--
-- TOC entry 4879 (class 1259 OID 17006)
-- Name: ix_formations_sanitaires_commune_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_formations_sanitaires_commune_id ON public.formations_sanitaires USING btree (commune_id);


--
-- TOC entry 4924 (class 1259 OID 17258)
-- Name: ix_historique_affectations_superviseurs_administrateur_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_historique_affectations_superviseurs_administrateur_id ON public.historique_affectations_superviseurs USING btree (administrateur_id);


--
-- TOC entry 4925 (class 1259 OID 17257)
-- Name: ix_historique_affectations_superviseurs_formation_sanitaire_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_historique_affectations_superviseurs_formation_sanitaire_id ON public.historique_affectations_superviseurs USING btree (formation_sanitaire_id);


--
-- TOC entry 4903 (class 1259 OID 17110)
-- Name: ix_historique_modifications_fiche_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_historique_modifications_fiche_id ON public.historique_modifications USING btree (fiche_id);


--
-- TOC entry 4906 (class 1259 OID 17153)
-- Name: ix_historique_permutations_affectations_administrateur_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_historique_permutations_affectations_administrateur_id ON public.historique_permutations_affectations USING btree (administrateur_id);


--
-- TOC entry 4907 (class 1259 OID 17154)
-- Name: ix_historique_permutations_affectations_agent_a_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_historique_permutations_affectations_agent_a_id ON public.historique_permutations_affectations USING btree (agent_a_id);


--
-- TOC entry 4908 (class 1259 OID 17155)
-- Name: ix_historique_permutations_affectations_agent_b_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_historique_permutations_affectations_agent_b_id ON public.historique_permutations_affectations USING btree (agent_b_id);


--
-- TOC entry 4916 (class 1259 OID 17198)
-- Name: ix_historique_supervision_demande_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_historique_supervision_demande_id ON public.historique_supervision USING btree (demande_id);


--
-- TOC entry 4917 (class 1259 OID 17199)
-- Name: ix_historique_supervision_utilisateur_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_historique_supervision_utilisateur_id ON public.historique_supervision USING btree (utilisateur_id);


--
-- TOC entry 4896 (class 1259 OID 17090)
-- Name: ix_journal_synchronisation_fiche_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_journal_synchronisation_fiche_id ON public.journal_synchronisation USING btree (fiche_id);


--
-- TOC entry 4926 (class 1259 OID 17286)
-- Name: ix_livraisons_notifications_a_traiter; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_livraisons_notifications_a_traiter ON public.livraisons_notifications USING btree (statut, prochaine_tentative);


--
-- TOC entry 4927 (class 1259 OID 17287)
-- Name: ix_livraisons_notifications_fiche; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_livraisons_notifications_fiche ON public.livraisons_notifications USING btree (fiche_id);


--
-- TOC entry 4918 (class 1259 OID 17227)
-- Name: ix_notifications_fiche_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_notifications_fiche_id ON public.notifications USING btree (fiche_id);


--
-- TOC entry 4919 (class 1259 OID 17226)
-- Name: ix_notifications_utilisateur_lue_cree; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_notifications_utilisateur_lue_cree ON public.notifications USING btree (utilisateur_id, lue_le, cree_le);


--
-- TOC entry 4865 (class 1259 OID 16975)
-- Name: ix_prefectures_region_id; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX ix_prefectures_region_id ON public.prefectures USING btree (region_id);


--
-- TOC entry 4880 (class 1259 OID 17228)
-- Name: uq_utilisateur_superviseur_fs_actif; Type: INDEX; Schema: public; Owner: postgres
--

CREATE UNIQUE INDEX uq_utilisateur_superviseur_fs_actif ON public.utilisateurs USING btree (formation_sanitaire_id) WHERE (((role)::text = 'superviseur'::text) AND (actif IS TRUE));


--
-- TOC entry 4968 (class 2606 OID 17303)
-- Name: appareils_push appareils_push_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.appareils_push
    ADD CONSTRAINT appareils_push_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id) ON DELETE CASCADE;


--
-- TOC entry 4936 (class 2606 OID 16985)
-- Name: communes communes_prefecture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.communes
    ADD CONSTRAINT communes_prefecture_id_fkey FOREIGN KEY (prefecture_id) REFERENCES public.prefectures(id);


--
-- TOC entry 4956 (class 2606 OID 17166)
-- Name: demandes_correction demandes_correction_fiche_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_correction
    ADD CONSTRAINT demandes_correction_fiche_id_fkey FOREIGN KEY (fiche_id) REFERENCES public.fiches_paludisme(id);


--
-- TOC entry 4957 (class 2606 OID 17171)
-- Name: demandes_correction demandes_correction_superviseur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.demandes_correction
    ADD CONSTRAINT demandes_correction_superviseur_id_fkey FOREIGN KEY (superviseur_id) REFERENCES public.utilisateurs(id);


--
-- TOC entry 4942 (class 2606 OID 17056)
-- Name: fiches_paludisme fiches_paludisme_agent_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fiches_paludisme
    ADD CONSTRAINT fiches_paludisme_agent_id_fkey FOREIGN KEY (agent_id) REFERENCES public.utilisateurs(id);


--
-- TOC entry 4943 (class 2606 OID 17061)
-- Name: fiches_paludisme fiches_paludisme_formation_sanitaire_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fiches_paludisme
    ADD CONSTRAINT fiches_paludisme_formation_sanitaire_id_fkey FOREIGN KEY (formation_sanitaire_id) REFERENCES public.formations_sanitaires(id);


--
-- TOC entry 4944 (class 2606 OID 17066)
-- Name: fiches_paludisme fiches_paludisme_type_tdr_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fiches_paludisme
    ADD CONSTRAINT fiches_paludisme_type_tdr_id_fkey FOREIGN KEY (type_tdr_id) REFERENCES public.types_tdr(id);


--
-- TOC entry 4945 (class 2606 OID 17200)
-- Name: fiches_paludisme fk_fiches_paludisme_validee_par_id_utilisateurs; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.fiches_paludisme
    ADD CONSTRAINT fk_fiches_paludisme_validee_par_id_utilisateurs FOREIGN KEY (validee_par_id) REFERENCES public.utilisateurs(id);


--
-- TOC entry 4960 (class 2606 OID 17221)
-- Name: notifications fk_notifications_fiche_id_fiches_paludisme; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_notifications_fiche_id_fiches_paludisme FOREIGN KEY (fiche_id) REFERENCES public.fiches_paludisme(id);


--
-- TOC entry 4961 (class 2606 OID 17216)
-- Name: notifications fk_notifications_utilisateur_id_utilisateurs; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.notifications
    ADD CONSTRAINT fk_notifications_utilisateur_id_utilisateurs FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id);


--
-- TOC entry 4937 (class 2606 OID 17001)
-- Name: formations_sanitaires formations_sanitaires_commune_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.formations_sanitaires
    ADD CONSTRAINT formations_sanitaires_commune_id_fkey FOREIGN KEY (commune_id) REFERENCES public.communes(id);


--
-- TOC entry 4962 (class 2606 OID 17237)
-- Name: historique_affectations_superviseurs historique_affectations_superviseur_formation_sanitaire_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_affectations_superviseurs
    ADD CONSTRAINT historique_affectations_superviseur_formation_sanitaire_id_fkey FOREIGN KEY (formation_sanitaire_id) REFERENCES public.formations_sanitaires(id);


--
-- TOC entry 4963 (class 2606 OID 17247)
-- Name: historique_affectations_superviseurs historique_affectations_superviseur_nouveau_superviseur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_affectations_superviseurs
    ADD CONSTRAINT historique_affectations_superviseur_nouveau_superviseur_id_fkey FOREIGN KEY (nouveau_superviseur_id) REFERENCES public.utilisateurs(id);


--
-- TOC entry 4964 (class 2606 OID 17252)
-- Name: historique_affectations_superviseurs historique_affectations_superviseurs_administrateur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_affectations_superviseurs
    ADD CONSTRAINT historique_affectations_superviseurs_administrateur_id_fkey FOREIGN KEY (administrateur_id) REFERENCES public.utilisateurs(id);


--
-- TOC entry 4965 (class 2606 OID 17242)
-- Name: historique_affectations_superviseurs historique_affectations_superviseurs_ancien_superviseur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_affectations_superviseurs
    ADD CONSTRAINT historique_affectations_superviseurs_ancien_superviseur_id_fkey FOREIGN KEY (ancien_superviseur_id) REFERENCES public.utilisateurs(id);


--
-- TOC entry 4947 (class 2606 OID 17100)
-- Name: historique_modifications historique_modifications_fiche_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_modifications
    ADD CONSTRAINT historique_modifications_fiche_id_fkey FOREIGN KEY (fiche_id) REFERENCES public.fiches_paludisme(id);


--
-- TOC entry 4948 (class 2606 OID 17105)
-- Name: historique_modifications historique_modifications_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_modifications
    ADD CONSTRAINT historique_modifications_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id);


--
-- TOC entry 4949 (class 2606 OID 17118)
-- Name: historique_permutations_affectations historique_permutations_affectations_administrateur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_permutations_affectations
    ADD CONSTRAINT historique_permutations_affectations_administrateur_id_fkey FOREIGN KEY (administrateur_id) REFERENCES public.utilisateurs(id);


--
-- TOC entry 4950 (class 2606 OID 17123)
-- Name: historique_permutations_affectations historique_permutations_affectations_agent_a_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_permutations_affectations
    ADD CONSTRAINT historique_permutations_affectations_agent_a_id_fkey FOREIGN KEY (agent_a_id) REFERENCES public.utilisateurs(id);


--
-- TOC entry 4951 (class 2606 OID 17128)
-- Name: historique_permutations_affectations historique_permutations_affectations_agent_b_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_permutations_affectations
    ADD CONSTRAINT historique_permutations_affectations_agent_b_id_fkey FOREIGN KEY (agent_b_id) REFERENCES public.utilisateurs(id);


--
-- TOC entry 4952 (class 2606 OID 17133)
-- Name: historique_permutations_affectations historique_permutations_affectations_ancienne_fs_a_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_permutations_affectations
    ADD CONSTRAINT historique_permutations_affectations_ancienne_fs_a_id_fkey FOREIGN KEY (ancienne_fs_a_id) REFERENCES public.formations_sanitaires(id);


--
-- TOC entry 4953 (class 2606 OID 17138)
-- Name: historique_permutations_affectations historique_permutations_affectations_ancienne_fs_b_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_permutations_affectations
    ADD CONSTRAINT historique_permutations_affectations_ancienne_fs_b_id_fkey FOREIGN KEY (ancienne_fs_b_id) REFERENCES public.formations_sanitaires(id);


--
-- TOC entry 4954 (class 2606 OID 17143)
-- Name: historique_permutations_affectations historique_permutations_affectations_nouvelle_fs_a_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_permutations_affectations
    ADD CONSTRAINT historique_permutations_affectations_nouvelle_fs_a_id_fkey FOREIGN KEY (nouvelle_fs_a_id) REFERENCES public.formations_sanitaires(id);


--
-- TOC entry 4955 (class 2606 OID 17148)
-- Name: historique_permutations_affectations historique_permutations_affectations_nouvelle_fs_b_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_permutations_affectations
    ADD CONSTRAINT historique_permutations_affectations_nouvelle_fs_b_id_fkey FOREIGN KEY (nouvelle_fs_b_id) REFERENCES public.formations_sanitaires(id);


--
-- TOC entry 4958 (class 2606 OID 17188)
-- Name: historique_supervision historique_supervision_demande_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_supervision
    ADD CONSTRAINT historique_supervision_demande_id_fkey FOREIGN KEY (demande_id) REFERENCES public.demandes_correction(id);


--
-- TOC entry 4959 (class 2606 OID 17193)
-- Name: historique_supervision historique_supervision_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.historique_supervision
    ADD CONSTRAINT historique_supervision_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id);


--
-- TOC entry 4946 (class 2606 OID 17085)
-- Name: journal_synchronisation journal_synchronisation_utilisateur_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.journal_synchronisation
    ADD CONSTRAINT journal_synchronisation_utilisateur_id_fkey FOREIGN KEY (utilisateur_id) REFERENCES public.utilisateurs(id);


--
-- TOC entry 4966 (class 2606 OID 17281)
-- Name: livraisons_notifications livraisons_notifications_fiche_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.livraisons_notifications
    ADD CONSTRAINT livraisons_notifications_fiche_id_fkey FOREIGN KEY (fiche_id) REFERENCES public.fiches_paludisme(id) ON DELETE SET NULL;


--
-- TOC entry 4967 (class 2606 OID 17276)
-- Name: livraisons_notifications livraisons_notifications_notification_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.livraisons_notifications
    ADD CONSTRAINT livraisons_notifications_notification_id_fkey FOREIGN KEY (notification_id) REFERENCES public.notifications(id) ON DELETE SET NULL;


--
-- TOC entry 4935 (class 2606 OID 16970)
-- Name: prefectures prefectures_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.prefectures
    ADD CONSTRAINT prefectures_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id);


--
-- TOC entry 4938 (class 2606 OID 17019)
-- Name: utilisateurs utilisateurs_commune_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_commune_id_fkey FOREIGN KEY (commune_id) REFERENCES public.communes(id);


--
-- TOC entry 4939 (class 2606 OID 17024)
-- Name: utilisateurs utilisateurs_formation_sanitaire_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_formation_sanitaire_id_fkey FOREIGN KEY (formation_sanitaire_id) REFERENCES public.formations_sanitaires(id);


--
-- TOC entry 4940 (class 2606 OID 17029)
-- Name: utilisateurs utilisateurs_prefecture_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_prefecture_id_fkey FOREIGN KEY (prefecture_id) REFERENCES public.prefectures(id);


--
-- TOC entry 4941 (class 2606 OID 17034)
-- Name: utilisateurs utilisateurs_region_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.utilisateurs
    ADD CONSTRAINT utilisateurs_region_id_fkey FOREIGN KEY (region_id) REFERENCES public.regions(id);


-- Completed on 2026-11-03 06:43:01

--
-- PostgreSQL database dump complete
--

\unrestrict mnmcBfPJAUKd0VbAhyVyrhHRkENcR1sSzZKCHWuWKC54qZW5zbWPaI7CCpeUurX

