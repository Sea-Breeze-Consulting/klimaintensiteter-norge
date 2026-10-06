# Klimaintensiteter Norge

En åpen, søkbar faktoroversikt for norske virksomheter, publisert av Sea Breeze Electrical Consulting AS. Nettstedet kobler DFØs utslippsfaktorer til norsk standard kontoplan.

## Publisering

Nettstedet er ren HTML, CSS og JavaScript. GitHub Pages publiserer direkte fra roten av `main`; prosjektet bruker ingen GitHub Actions-workflow eller byggetrinn.

## Data

- `data/public/dfo/2026/factors.csv` er den publiserte 2026 interim-utgivelsen.
- Innkjøpsfaktorer har 2022 som dataår, ble revidert av DFØ i 2025 og er KPI-justert til 2026M08.
- Aktivitetsbaserte faktorer beholder sine fysiske enheter og er ikke KPI-justert.
- Den historiske 2025-endepunkten ligger fortsatt urørt der dagens nettside leser den.

Kilde: [DFØ – Utslippsfaktorer for statlige innkjøp](https://www.anskaffelser.no/data-statistikk-og-analyse/utslippsfaktorer-statlige-innkjop).

## Lokal forhåndsvisning

Fordi nettlesere begrenser `fetch()` fra lokale filer, start en enkel lokal webserver i denne mappen, for eksempel `python -m http.server 8000`, og åpne `http://localhost:8000`.

## Lisenser

Programkoden er MIT-lisensiert. Det bearbeidede datasettet er lisensiert under [CC BY 4.0](DATA_LICENSE.md). Kildedata kan ha egne vilkår; DFØ skal krediteres som opprinnelig kilde.
