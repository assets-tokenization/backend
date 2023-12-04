--
-- PostgreSQL database dump
--

-- Dumped from database version 12.16
-- Dumped by pg_dump version 12.16

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
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
-- Name: realestateobjects; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.realestateobjects (
    id bigint NOT NULL,
    title character varying(1024),
    tokenized boolean,
    description character varying(1024),
    photos bigint[],
    number character varying(1024),
    address character varying(256),
    type character varying(1024),
    lawdata character varying(1024),
    location real[],
    document character varying(1024),
    ownform character varying(1024),
    expdate character varying(1024),
    govregistrator character varying(1024),
    objectdescription character varying(1024),
    totalarea character varying(1024),
    livingarea character varying(1024),
    problems character varying(1024),
    createat timestamp without time zone,
    updateat timestamp without time zone,
    userid bigint,
    ether_contract text,
    user_ipn bigint,
    id_real_estate text,
    address_contract text,
    is_selected_p2p boolean
);


ALTER TABLE public.realestateobjects OWNER TO postgres;

--
-- Name: realestateobjects_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.realestateobjects_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.realestateobjects_id_seq OWNER TO postgres;

--
-- Name: realestateobjects_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.realestateobjects_id_seq OWNED BY public.realestateobjects.id;


--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.sessions (
    id bigint NOT NULL,
    ipn bigint NOT NULL,
    datetime timestamp with time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sessions_id_seq OWNER TO postgres;

--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.sessions_id_seq OWNED BY public.sessions.id;


--
-- Name: userprofiles; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.userprofiles (
    id bigint NOT NULL,
    ipn bigint NOT NULL,
    description text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    wallet text
);


ALTER TABLE public.userprofiles OWNER TO postgres;

--
-- Name: userprofiles_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.userprofiles_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.userprofiles_id_seq OWNER TO postgres;

--
-- Name: userprofiles_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.userprofiles_id_seq OWNED BY public.userprofiles.id;


--
-- Name: realestateobjects id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.realestateobjects ALTER COLUMN id SET DEFAULT nextval('public.realestateobjects_id_seq'::regclass);


--
-- Name: sessions id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions ALTER COLUMN id SET DEFAULT nextval('public.sessions_id_seq'::regclass);


--
-- Name: userprofiles id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userprofiles ALTER COLUMN id SET DEFAULT nextval('public.userprofiles_id_seq'::regclass);


--
-- Name: sessions sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: userprofiles userprofiles_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.userprofiles
    ADD CONSTRAINT userprofiles_pkey PRIMARY KEY (id);


--
-- PostgreSQL database dump complete
--

