class TariffyCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static getConfigElement() {
    return document.createElement('tariffy-card-editor');
  }

  static getStubConfig() {
    return { device_id: '', mode: 'compact' };
  }

  setConfig(config) {
    if (!config.device_id && !config.entities) {
      throw new Error('device_id oder entities erforderlich');
    }
    this._config = config;
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _getEntities() {
    const hass = this._hass;
    const cfg = this._config;
    const result = {};

    if (cfg.entities) {
      return cfg.entities;
    }

    // Auto-discover by device_id
    const deviceId = cfg.device_id;
    Object.values(hass.entities || {}).forEach(e => {
      if (e.device_id !== deviceId) return;
      const id = e.entity_id;
      const s = hass.states[id];
      if (!s) return;
      const key = e.entity_id.split('.')[1];
      // Match by translation_key or entity_id suffix
      const tk = s.attributes.translation_key || '';
      if (tk === 'arbeitspreis' || id.includes('arbeitspreis')) result.arbeitspreis = id;
      else if (tk === 'grundpreis' || id.includes('grundpreis')) result.grundpreis = id;
      else if (tk === 'monatliche_kosten' || id.includes('monatliche_kosten')) result.monatliche_kosten = id;
      else if (tk === 'jahreskosten' || id.includes('jahreskosten') && !id.includes('geschaetzt')) result.jahreskosten = id;
      else if (tk === 'geschaetzte_jahreskosten' || id.includes('geschaetzte')) result.geschaetzte_jahreskosten = id;
      else if (tk === 'verbrauch_kwh' || id.includes('verbrauch_kwh')) result.verbrauch_kwh = id;
      else if (tk === 'prognose' || id.includes('prognose')) result.prognose = id;
      else if (tk === 'restlaufzeit' || id.includes('restlaufzeit')) result.restlaufzeit = id;
      else if (tk === 'ende' || (id.includes('vertragsende') || id.includes('_ende'))) result.ende = id;
      else if (tk === 'anbieter' || id.includes('anbieter')) result.anbieter = id;
      else if (tk === 'tarif' || id.includes('_tarif')) result.tarif = id;
      else if (tk === 'kundennummer' || id.includes('kundennummer')) result.kundennummer = id;
      else if (tk === 'zaehlernummer' || id.includes('zaehlernummer')) result.zaehlernummer = id;
      else if (tk === 'naechster_wechsel' || id.includes('wechsel')) result.naechster_wechsel = id;
      else if (tk === 'kuendigung_erinnerung' || id.includes('kuendigung')) result.kuendigung_erinnerung = id;
    });

    return result;
  }

  _state(entityId) {
    if (!entityId || !this._hass) return null;
    return this._hass.states[entityId] || null;
  }

  _val(entityId) {
    const s = this._state(entityId);
    return s ? s.state : null;
  }

  _attr(entityId, attr) {
    const s = this._state(entityId);
    return s ? s.attributes[attr] : null;
  }

  _fmt(val, decimals = 2) {
    const n = parseFloat(val);
    if (isNaN(n)) return '—';
    return n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  _fmtDate(val) {
    if (!val || val === 'unknown' || val === 'unavailable') return '—';
    try {
      return new Date(val).toLocaleDateString('de-DE');
    } catch {
      return val;
    }
  }

  _sparte() {
    const ents = this._getEntities();
    const s = this._state(ents.anbieter);
    if (s) return (s.attributes.sparte || '').toLowerCase();
    // Try arbeitspreis attributes
    const a = this._state(ents.arbeitspreis);
    if (a) return (a.attributes.sparte || '').toLowerCase();
    return this._config.sparte || '';
  }

  _sparteIcon(sparte) {
    const icons = {
      strom: '⚡',
      gas: '🔥',
      wasser: '💧',
      internet: '📶',
      mobilfunk: '📱',
      versicherung: '🛡️',
      sonstiges: '📄',
    };
    return icons[sparte] || '📄';
  }

  _sparteColor(sparte) {
    const colors = {
      strom: 'var(--warning-color, #f59e0b)',
      gas: 'var(--error-color, #ef4444)',
      wasser: 'var(--success-color, #10b981)',
      internet: 'var(--info-color, #6366f1)',
      mobilfunk: 'var(--info-color, #8b5cf6)',
      versicherung: '#0ea5e9',
      sonstiges: 'var(--secondary-text-color)',
    };
    return colors[sparte] || 'var(--primary-color)';
  }

  _kuendigungAktiv(ents) {
    const s = this._state(ents.kuendigung_erinnerung);
    if (!s) return false;
    const attr = s.attributes || {};
    return attr.aktiv === true;
  }

  _kuendigungDatum(ents) {
    return this._val(ents.ende);
  }

  _renderCompact(ents, sparte, name) {
    const icon = this._sparteIcon(sparte);
    const color = this._sparteColor(sparte);
    const anbieter = this._val(ents.anbieter) || '—';
    const tarif = this._val(ents.tarif) || '';
    const kosten = this._val(ents.monatliche_kosten);
    const restlaufzeit = this._val(ents.restlaufzeit);
    const kuendigungAktiv = this._kuendigungAktiv(ents);
    const endeDatum = this._fmtDate(this._kuendigungDatum(ents));
    const erinnerungDatum = this._fmtDate(this._val(ents.kuendigung_erinnerung));

    return `
      <div class="card compact" @click="${() => this._toggleMode()}">
        <div class="compact-icon" style="background:${color}22;color:${color}">${icon}</div>
        <div class="compact-info">
          <div class="name">${name}</div>
          <div class="sub">${anbieter}${tarif ? ' · ' + tarif : ''}</div>
        </div>
        <div class="compact-right">
          ${kosten && kosten !== 'unknown' ? `<div class="cost">${this._fmt(kosten, 0)} €/Mo</div>` : ''}
          ${restlaufzeit && restlaufzeit !== 'unknown' ? `<div class="sub">${parseInt(restlaufzeit)} T verbleibend</div>` : ''}
        </div>
        ${kuendigungAktiv
          ? `<div class="chip warn">⚠ Kündigung ${erinnerungDatum !== '—' ? erinnerungDatum : endeDatum}</div>`
          : `<div class="chip ok">Aktiv</div>`
        }
      </div>`;
  }

  _renderDetail(ents, sparte, name) {
    const icon = this._sparteIcon(sparte);
    const color = this._sparteColor(sparte);
    const anbieter = this._val(ents.anbieter) || '—';
    const tarif = this._val(ents.tarif) || '';
    const kuendigungAktiv = this._kuendigungAktiv(ents);
    const endeDatum = this._fmtDate(this._kuendigungDatum(ents));
    const erinnerungDatum = this._fmtDate(this._val(ents.kuendigung_erinnerung));

    const kosten = this._val(ents.monatliche_kosten);
    const jahreskosten = this._val(ents.jahreskosten);
    const prognose = this._val(ents.prognose);
    const progNeg = prognose && parseFloat(prognose) < 0;
    const arbeitspreis = this._val(ents.arbeitspreis);
    const grundpreis = this._val(ents.grundpreis);
    const restlaufzeit = this._val(ents.restlaufzeit);
    const ende = this._fmtDate(this._val(ents.ende));
    const kundennummer = this._val(ents.kundennummer);
    const zaehlernummer = this._val(ents.zaehlernummer);
    const wechsel = this._fmtDate(this._val(ents.naechster_wechsel));

    const istEnergie = ['strom', 'gas', 'wasser'].includes(sparte);
    const istGas = sparte === 'gas';

    const verbrauchKwh = this._val(ents.verbrauch_kwh);
    const geschaetzte = this._val(ents.geschaetzte_jahreskosten);
    const brennwert = this._attr(ents.verbrauch_kwh, 'brennwert');
    const zustandszahl = this._attr(ents.verbrauch_kwh, 'zustandszahl');
    const verbrauchM3 = this._attr(ents.verbrauch_kwh, 'jahresverbrauch_m3');
    const oekostrom = this._attr(ents.arbeitspreis, 'oekostrom');

    const unit = this._attr(ents.arbeitspreis, 'unit_of_measurement') || '€/kWh';

    return `
      <div class="card detail">
        <div class="detail-header">
          <div class="header-left">
            <div class="icon-wrap" style="background:${color}22;color:${color}">${icon}</div>
            <div>
              <div class="name">${name}</div>
              <div class="sub">${anbieter}${tarif ? ' · ' + tarif : ''}${oekostrom === true ? ' · <span class="green">Ökostrom</span>' : ''}</div>
            </div>
          </div>
          ${kuendigungAktiv
            ? `<div class="chip warn">⚠ Kündigung ${erinnerungDatum !== '—' ? erinnerungDatum : endeDatum}</div>`
            : `<div class="chip ok">Aktiv</div>`
          }
        </div>

        <div class="metrics">
          <div class="metric">
            <div class="mlabel">Abschlag</div>
            <div class="mval">${kosten && kosten !== 'unknown' ? this._fmt(kosten, 0) + ' €' : '—'}</div>
            <div class="msub">/Monat</div>
          </div>
          <div class="metric">
            <div class="mlabel">Jahreskosten</div>
            <div class="mval">${jahreskosten && jahreskosten !== 'unknown' ? this._fmt(jahreskosten, 0) + ' €' : '—'}</div>
            <div class="msub">/Jahr</div>
          </div>
          ${istEnergie && prognose && prognose !== 'unknown' ? `
          <div class="metric">
            <div class="mlabel">Prognose</div>
            <div class="mval ${progNeg ? 'neg' : 'pos'}">${this._fmt(prognose, 0)} €</div>
            <div class="msub ${progNeg ? 'neg' : 'pos'}">${progNeg ? 'Nachzahlung' : 'Guthaben'}</div>
          </div>` : ''}
        </div>

        <div class="divider"></div>

        <div class="grid2">
          ${istEnergie && arbeitspreis && arbeitspreis !== 'unknown' ? `
          <div><div class="dlabel">Arbeitspreis</div><div class="dval">${this._fmt(arbeitspreis, 4)} ${unit}</div></div>` : ''}
          ${istEnergie && grundpreis && grundpreis !== 'unknown' ? `
          <div><div class="dlabel">Grundpreis</div><div class="dval">${this._fmt(grundpreis, 2)} €/Mo</div></div>` : ''}
          ${istGas && verbrauchM3 ? `
          <div><div class="dlabel">Verbrauch (m³)</div><div class="dval">${this._fmt(verbrauchM3, 0)} m³</div></div>` : ''}
          ${istGas && verbrauchKwh && verbrauchKwh !== 'unknown' ? `
          <div><div class="dlabel">Verbrauch (kWh)</div><div class="dval">${this._fmt(verbrauchKwh, 0)} kWh</div></div>` : ''}
          ${istGas && brennwert ? `
          <div><div class="dlabel">Brennwert</div><div class="dval">${this._fmt(brennwert, 3)} kWh/m³</div></div>` : ''}
          ${istGas && zustandszahl ? `
          <div><div class="dlabel">Zustandszahl</div><div class="dval">${this._fmt(zustandszahl, 4)}</div></div>` : ''}
          ${!istGas && istEnergie && geschaetzte && geschaetzte !== 'unknown' ? `
          <div><div class="dlabel">Gesch. Jahreskosten</div><div class="dval">${this._fmt(geschaetzte, 0)} €</div></div>` : ''}
        </div>

        <div class="divider"></div>

        <div class="rows">
          ${ende !== '—' ? `<div class="row"><span class="rlabel">Vertragsende</span><span class="rval">${ende}</span></div>` : ''}
          ${restlaufzeit && restlaufzeit !== 'unknown' ? `<div class="row"><span class="rlabel">Restlaufzeit</span><span class="rval">${parseInt(restlaufzeit)} Tage</span></div>` : ''}
          ${wechsel !== '—' ? `<div class="row"><span class="rlabel">Nächster Wechsel</span><span class="rval accent">${wechsel}</span></div>` : ''}
          ${kundennummer && kundennummer !== 'unknown' ? `<div class="row"><span class="rlabel">Kundennummer</span><span class="rval muted">${kundennummer}</span></div>` : ''}
          ${zaehlernummer && zaehlernummer !== 'unknown' ? `<div class="row"><span class="rlabel">Zählernummer</span><span class="rval muted">${zaehlernummer}</span></div>` : ''}
        </div>
      </div>`;
  }

  _toggleMode() {
    this._mode = this._mode === 'detail' ? 'compact' : 'detail';
    this._render();
  }

  _getDeviceName() {
    const cfg = this._config;
    if (cfg.name) return cfg.name;
    const deviceId = cfg.device_id;
    if (!deviceId || !this._hass) return 'Tariffy';
    const device = (this._hass.devices || {})[deviceId];
    return device ? device.name : 'Tariffy';
  }

  _render() {
    if (!this._hass || !this._config) return;

    if (this._mode === undefined) {
      this._mode = this._config.mode || 'compact';
    }

    const ents = this._getEntities();
    const sparte = this._sparte();
    const name = this._getDeviceName();

    const html = this._mode === 'detail'
      ? this._renderDetail(ents, sparte, name)
      : this._renderCompact(ents, sparte, name);

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        .card {
          background: var(--ha-card-background, var(--card-background-color, #fff));
          border-radius: var(--ha-card-border-radius, 12px);
          border: 1px solid var(--divider-color, rgba(0,0,0,.12));
          font-family: var(--paper-font-body1_-_font-family, sans-serif);
          color: var(--primary-text-color);
          overflow: hidden;
        }
        .compact {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          cursor: pointer;
        }
        .compact-icon, .icon-wrap {
          width: 38px; height: 38px;
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 20px; flex-shrink: 0;
        }
        .compact-info { flex: 1; min-width: 0; }
        .compact-right { text-align: right; flex-shrink: 0; }
        .name { font-size: 14px; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
        .sub { font-size: 12px; color: var(--secondary-text-color); }
        .cost { font-size: 14px; font-weight: 500; }
        .chip {
          font-size: 11px; font-weight: 500;
          padding: 3px 8px; border-radius: 6px;
          white-space: nowrap; flex-shrink: 0;
        }
        .warn { background: rgba(245,158,11,.15); color: #b45309; }
        .ok { background: rgba(16,185,129,.15); color: #047857; }
        .detail { padding: 14px 16px; }
        .detail-header { display: flex; align-items: center; justify-content: space-between; gap: 10px; margin-bottom: 14px; }
        .header-left { display: flex; align-items: center; gap: 10px; flex: 1; min-width: 0; }
        .icon-wrap { width: 40px; height: 40px; font-size: 20px; flex-shrink: 0; }
        .green { color: #047857; }
        .metrics { display: grid; grid-template-columns: repeat(auto-fit, minmax(80px, 1fr)); gap: 10px; margin-bottom: 14px; }
        .metric { background: var(--secondary-background-color, rgba(0,0,0,.04)); border-radius: 8px; padding: 10px 12px; }
        .mlabel { font-size: 11px; color: var(--secondary-text-color); margin-bottom: 2px; }
        .mval { font-size: 20px; font-weight: 500; }
        .msub { font-size: 11px; color: var(--secondary-text-color); }
        .neg { color: var(--error-color, #ef4444); }
        .pos { color: var(--success-color, #10b981); }
        .divider { border: none; border-top: 1px solid var(--divider-color, rgba(0,0,0,.08)); margin: 12px 0; }
        .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px 16px; margin-bottom: 4px; }
        .dlabel { font-size: 11px; color: var(--secondary-text-color); margin-bottom: 2px; }
        .dval { font-size: 13px; font-weight: 500; }
        .rows { display: flex; flex-direction: column; }
        .row { display: flex; justify-content: space-between; align-items: center; padding: 6px 0; border-top: 1px solid var(--divider-color, rgba(0,0,0,.06)); }
        .row:first-child { border-top: none; }
        .rlabel { font-size: 13px; color: var(--secondary-text-color); }
        .rval { font-size: 13px; font-weight: 500; }
        .rval.muted { color: var(--secondary-text-color); font-weight: 400; }
        .rval.accent { color: var(--accent-color, #6366f1); }
      </style>
      ${html}
    `;

    // Click handler for compact toggle
    const card = this.shadowRoot.querySelector('.card');
    if (card) {
      card.addEventListener('click', () => this._toggleMode());
    }
  }

  getCardSize() {
    return this._mode === 'detail' ? 4 : 1;
  }
}

customElements.define('tariffy-card', TariffyCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'tariffy-card',
  name: 'Tariffy Card',
  description: 'Zeigt Tariffy-Verträge kompakt oder detailliert an.',
  preview: true,
});

class TariffyCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
  }

  setConfig(config) {
    this._config = { ...config };
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _devices() {
    if (!this._hass) return [];
    const devices = this._hass.devices || {};
    const entities = Object.values(this._hass.entities || {});
    const tariffyDevices = new Set();
    entities.forEach(e => {
      if (e.platform === 'tariffy' && e.device_id) {
        tariffyDevices.add(e.device_id);
      }
    });
    return [...tariffyDevices].map(id => ({
      id,
      name: devices[id] ? devices[id].name : id,
    })).sort((a, b) => a.name.localeCompare(b.name));
  }

  _fire(config) {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config },
      bubbles: true,
      composed: true,
    }));
  }

  _render() {
    const cfg = this._config;
    const devices = this._devices();

    this.shadowRoot.innerHTML = `
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        :host { display: block; padding: 16px; }
        .row { margin-bottom: 16px; }
        label { display: block; font-size: 12px; color: var(--secondary-text-color); margin-bottom: 4px; font-weight: 500; }
        select, input {
          width: 100%;
          height: 40px;
          padding: 0 12px;
          border: 1px solid var(--divider-color, rgba(0,0,0,.2));
          border-radius: 8px;
          background: var(--card-background-color, #fff);
          color: var(--primary-text-color);
          font-size: 14px;
          appearance: none;
        }
        select { cursor: pointer; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24'%3E%3Cpath fill='%23888' d='M7 10l5 5 5-5z'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 12px center; padding-right: 32px; }
        .hint { font-size: 11px; color: var(--secondary-text-color); margin-top: 4px; }
        .section { font-size: 11px; font-weight: 600; color: var(--secondary-text-color); text-transform: uppercase; letter-spacing: .04em; margin: 20px 0 12px; border-top: 1px solid var(--divider-color, rgba(0,0,0,.1)); padding-top: 16px; }
        .section:first-of-type { border-top: none; padding-top: 0; margin-top: 0; }
        .toggle-row { display: flex; align-items: center; justify-content: space-between; height: 40px; }
        .toggle-label { font-size: 14px; }
      </style>

      <div class="section">Gerät</div>

      <div class="row">
        <label>Tariffy-Gerät</label>
        <select id="device_id">
          <option value="">— Gerät wählen —</option>
          ${devices.map(d => `<option value="${d.id}" ${cfg.device_id === d.id ? 'selected' : ''}>${d.name}</option>`).join('')}
        </select>
        <div class="hint">Alle Tariffy-Geräte werden automatisch erkannt</div>
      </div>

      <div class="row">
        <label>Anzeigename (optional)</label>
        <input type="text" id="name" value="${cfg.name || ''}" placeholder="Leer = Gerätename">
      </div>

      <div class="section">Darstellung</div>

      <div class="row">
        <label>Startmodus</label>
        <select id="mode">
          <option value="compact" ${(cfg.mode || 'compact') === 'compact' ? 'selected' : ''}>Kompakt</option>
          <option value="detail" ${cfg.mode === 'detail' ? 'selected' : ''}>Detail</option>
        </select>
        <div class="hint">Per Klick auf die Card zwischen den Modi wechseln</div>
      </div>
    `;

    this.shadowRoot.querySelector('#device_id').addEventListener('change', e => {
      this._fire({ ...this._config, device_id: e.target.value });
    });
    this.shadowRoot.querySelector('#name').addEventListener('change', e => {
      const val = e.target.value.trim();
      const cfg = { ...this._config };
      if (val) cfg.name = val; else delete cfg.name;
      this._fire(cfg);
    });
    this.shadowRoot.querySelector('#mode').addEventListener('change', e => {
      this._fire({ ...this._config, mode: e.target.value });
    });
  }
}

customElements.define('tariffy-card-editor', TariffyCardEditor);
