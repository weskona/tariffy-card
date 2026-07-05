# Tariffy Card

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://hacs.xyz)
[![Version](https://img.shields.io/github/v/release/weskona/tariffy-card)](https://github.com/weskona/tariffy-card/releases)

Lovelace Card for the [Tariffy Integration](https://github.com/weskona/tariffy). Displays contracts in compact or detail mode — category-specific with all relevant sensors.

**[🇩🇪 Deutsche Version weiter unten](#-deutsch)**

---

## 🇬🇧 English

### Features

- **Two modes:** Compact (tile) and detail — toggle by clicking the card
- **Category-specific layouts:** Electricity, Gas, Water, Internet, Mobile, Insurance, Other
- **Electricity:** unit price, base price, night rate, tiered effective price, feed-in tariff, cost (contract period), cost (so far), real billing forecast
- **Gas:** m³, kWh, calorific value, state number, consumption since contract start
- **Water:** fresh water price, wastewater, combined price, base price, consumption since contract start
- **Real consumption tracking:** consumption so far + projected annual consumption (requires meter sensor in Tariffy)
- **Real billing forecast:** credit or surcharge based on actual usage
- **Last period consumption + recommended payment:** displayed after tariff switch
- **Cancellation warning** highlighted as badge
- **Tariff switch** shown when stored
- Automatic category detection via `device_id`

### Installation via HACS

1. HACS → Frontend → ⋮ → **Custom repositories**
2. URL: `https://github.com/weskona/tariffy-card` – Category: **Lovelace**
3. Install Tariffy Card
4. Reload page

### Manual installation

Copy `tariffy-card.js` to `/config/www/` and register as resource:

```yaml
lovelace:
  resources:
    - url: /local/tariffy-card.js
      type: module
```

### Configuration

#### Option A – automatic via `device_id` (recommended)

```yaml
type: custom:tariffy-card
device_id: abc123def456
mode: compact  # compact (default) or detail
```

#### Option B – manual via `entities`

```yaml
type: custom:tariffy-card
name: Electricity House
sparte: strom
entities:
  anbieter: sensor.electricity_provider
  tarif: sensor.electricity_tariff
  abschlag: sensor.electricity_monthly_payment
  jahreskosten: sensor.electricity_contract_period_cost
  kosten_bisher: sensor.electricity_cost_so_far
  empfohlener_abschlag: sensor.electricity_recommended_payment
  arbeitspreis: sensor.electricity_unit_price
  grundpreis: sensor.electricity_base_price
  einspeiseverguetung: sensor.electricity_feed_in_tariff
  verbrauch_bisher: sensor.electricity_consumption_so_far
  verbrauch_hochgerechnet: sensor.electricity_projected_annual
  verbrauch_letzte_laufzeit: sensor.electricity_consumption_last_period
  prognose_real: sensor.electricity_billing_forecast
  restlaufzeit: sensor.electricity_remaining_term
  beginn: sensor.electricity_contract_start
  ende: sensor.electricity_contract_end
  kuendigung_erinnerung: sensor.electricity_cancellation_reminder
  naechster_wechsel: sensor.electricity_next_switch
  kundennummer: sensor.electricity_customer_number
  zaehlernummer: sensor.electricity_meter_number
```

### Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `device_id` | string | – | Tariffy device ID (recommended) |
| `entities` | object | – | Manual entity mapping |
| `name` | string | device name | Display name |
| `sparte` | string | auto | `strom`, `gas`, `wasser`, `internet`, `mobilfunk`, `versicherung`, `sonstiges` |
| `mode` | string | `compact` | Start mode: `compact` or `detail` |

### Modes

**Compact** — one row: icon, name, provider, monthly payment, remaining days. Cancellation warning as badge.

**Detail** — full view with cost tiles (monthly, annual, billing forecast), price grid (category-specific), real consumption, contract dates, customer/meter number.

Click the card to toggle between modes.

### Requirements

- [Tariffy Integration](https://github.com/weskona/tariffy) v1.11.0+
- Home Assistant 2026.6+

---

## 🇩🇪 Deutsch

### Features

- **Zwei Modi:** Kompakt (Kachel) und Detail — per Klick umschaltbar
- **Sparten-spezifische Layouts:** Strom, Gas, Wasser, Internet, Mobilfunk, Versicherung, Sonstiges
- **Strom:** Arbeitspreis, Grundpreis, Nachttarif, effektiver Staffelpreis, Einspeisevergütung, Kosten (Vertragslaufzeit), Kosten (Bisher), Abrechnungsprognose (real)
- **Gas:** m³, kWh, Brennwert, Zustandszahl, Verbrauch seit Vertragsbeginn
- **Wasser:** Frischwasserpreis, Abwasser, Gesamtpreis, Grundpreis, Verbrauch seit Vertragsbeginn
- **Echte Verbrauchsmessung:** Verbrauch bisher + hochgerechneter Jahresverbrauch (erfordert Verbrauchssensor in Tariffy)
- **Abrechnungsprognose (real):** Guthaben oder Nachzahlung auf Basis des echten Verbrauchs
- **Verbrauch letzte Laufzeit + empfohlener Abschlag:** wird nach Tarifwechsel angezeigt
- **Kündigungs-Warnung** als Badge hervorgehoben
- **Tarifwechsel** wird angezeigt wenn hinterlegt
- Automatische Sparten-Erkennung per `device_id`

### Installation via HACS

1. HACS → Frontend → ⋮ → **Benutzerdefinierte Repositories**
2. URL: `https://github.com/weskona/tariffy-card` – Kategorie: **Lovelace**
3. Tariffy Card installieren
4. Seite neu laden

### Manuelle Installation

`tariffy-card.js` in `/config/www/` kopieren und als Ressource registrieren:

```yaml
lovelace:
  resources:
    - url: /local/tariffy-card.js
      type: module
```

### Konfiguration

#### Variante A – automatisch per `device_id` (empfohlen)

```yaml
type: custom:tariffy-card
device_id: abc123def456
mode: compact  # compact (Standard) oder detail
```

#### Variante B – manuell per `entities`

```yaml
type: custom:tariffy-card
name: Strom Haus
sparte: strom
entities:
  anbieter: sensor.strom_anbieter
  tarif: sensor.strom_tarif
  abschlag: sensor.strom_abschlag
  jahreskosten: sensor.strom_kosten_vertragslaufzeit
  kosten_bisher: sensor.strom_kosten_bisher
  empfohlener_abschlag: sensor.strom_abschlag_empfohlen
  arbeitspreis: sensor.strom_arbeitspreis
  grundpreis: sensor.strom_grundpreis
  einspeiseverguetung: sensor.strom_einspeisevergutung
  verbrauch_bisher: sensor.strom_verbrauch_bisher
  verbrauch_hochgerechnet: sensor.strom_jahresverbrauch_hochgerechnet
  verbrauch_letzte_laufzeit: sensor.strom_verbrauch_letzte_laufzeit
  prognose_real: sensor.strom_prognose_real
  restlaufzeit: sensor.strom_restlaufzeit
  beginn: sensor.strom_vertragsbeginn
  ende: sensor.strom_vertragsende
  kuendigung_erinnerung: sensor.strom_kundigungs_erinnerung
  naechster_wechsel: sensor.strom_nachster_wechsel
  kundennummer: sensor.strom_kundennummer
  zaehlernummer: sensor.strom_zahlernummer
```

### Optionen

| Option | Typ | Standard | Beschreibung |
|--------|-----|---------|-------------|
| `device_id` | string | – | Tariffy-Gerät ID (empfohlen) |
| `entities` | object | – | Manuelle Entity-Zuweisung |
| `name` | string | Gerätename | Anzeigename |
| `sparte` | string | auto | `strom`, `gas`, `wasser`, `internet`, `mobilfunk`, `versicherung`, `sonstiges` |
| `mode` | string | `compact` | Startmodus: `compact` oder `detail` |

### Modi

**Kompakt** — eine Zeile: Icon, Name, Anbieter, Abschlag, Restlaufzeit. Kündigungswarnung als Badge.

**Detail** — vollständige Ansicht mit Kosten-Kacheln (monatlich, jährlich, Prognose), Preis-Grid (sparten-spezifisch), echtem Verbrauch, Vertragsdaten, Kundennummer und Zählernummer.

Per Klick auf die Card zwischen den Modi wechseln.

### Anforderungen

- [Tariffy Integration](https://github.com/weskona/tariffy) v1.11.0+
- Home Assistant 2026.6+

---

## Lizenz / License

MIT © [weskona](https://github.com/weskona)
