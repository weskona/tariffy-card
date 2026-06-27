# Tariffy Card

[![HACS Custom](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://hacs.xyz)
[![Version](https://img.shields.io/github/v/release/weskona/tariffy-card)](https://github.com/weskona/tariffy-card/releases)

Lovelace Card für die [Tariffy Integration](https://github.com/weskona/tariffy). Zeigt Verträge kompakt oder detailliert an — sparten-abhängig mit allen relevanten Sensoren.

---

## 🇩🇪 Deutsch

### Features

- **Zwei Modi:** Kompakt (Kachel) und Detail — per Klick umschaltbar
- **Sparten-abhängig:** Strom, Gas, Wasser, Internet, Mobilfunk, Versicherung, Sonstiges
- **Gas:** zeigt m³, kWh, Brennwert und Zustandszahl
- **Energie:** zeigt Arbeitspreis, Grundpreis, geschätzte Jahreskosten, Abrechnungsprognose
- **Kündigungs-Warnung** wird farblich hervorgehoben
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
# configuration.yaml
lovelace:
  resources:
    - url: /local/tariffy-card.js
      type: module
```

### Konfiguration

#### Variante A – automatisch per `device_id`

Die einfachste Methode: `device_id` aus den Entwicklertools kopieren.

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
  anbieter: sensor.strom_haus_anbieter
  tarif: sensor.strom_haus_tarif
  monatliche_kosten: sensor.strom_haus_monatliche_kosten
  jahreskosten: sensor.strom_haus_jahreskosten_abschlag
  geschaetzte_jahreskosten: sensor.strom_haus_geschatzte_jahreskosten
  arbeitspreis: sensor.strom_haus_arbeitspreis
  grundpreis: sensor.strom_haus_grundpreis
  prognose: sensor.strom_haus_abrechnungsprognose
  restlaufzeit: sensor.strom_haus_restlaufzeit
  ende: sensor.strom_haus_vertragsende
  kuendigung_erinnerung: sensor.strom_haus_kundigungs_erinnerung
  naechster_wechsel: sensor.strom_haus_nachster_wechsel
  kundennummer: sensor.strom_haus_kundennummer
  zaehlernummer: sensor.strom_haus_zahlernummer
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

**Kompakt** — eine Zeile mit Icon, Name, Anbieter, Kosten und Restlaufzeit. Kündigungswarnung als Badge.

**Detail** — vollständige Ansicht mit Kosten-Kacheln, Preisen, Verbrauch (Gas: m³ + kWh + Brennwert), Restlaufzeit, Kundennummer und Zählernummer.

Per Klick auf die Card zwischen den Modi wechseln.

---

## 🇬🇧 English

### Features

- **Two modes:** Compact (tile) and detail — toggle by clicking
- **Category-dependent:** Electricity, Gas, Water, Internet, Mobile, Insurance, Other
- **Gas:** shows m³, kWh, calorific value and state number
- **Energy:** shows unit price, base price, estimated annual costs, billing forecast
- **Cancellation warning** highlighted in color
- **Tariff switch** displayed when stored
- Automatic category detection via `device_id`

### Installation via HACS

1. HACS → Frontend → ⋮ → **Custom repositories**
2. URL: `https://github.com/weskona/tariffy-card` – Category: **Lovelace**
3. Install Tariffy Card
4. Reload page

### Configuration

#### Option A – automatic via `device_id`

```yaml
type: custom:tariffy-card
device_id: abc123def456
mode: compact
```

#### Option B – manual via `entities`

```yaml
type: custom:tariffy-card
name: Electricity House
sparte: strom
entities:
  anbieter: sensor.electricity_house_provider
  monatliche_kosten: sensor.electricity_house_monthly_cost
  # ... etc
```

---

## Lizenz / License

MIT © [weskona](https://github.com/weskona)
