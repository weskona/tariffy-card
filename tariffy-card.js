class TariffyCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  static getStubConfig() {
    return { device_id: '', mode: 'compact' };
  }

  static getConfigElement() {
    return document.createElement('tariffy-card-editor');
  }


  setConfig(config) {
    if (!config.device_id && !config.entity && !config.entities) {
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
    if (cfg.entities) return cfg.entities;
    let deviceId = cfg.device_id;
    if (!deviceId && cfg.entity && hass.entities) {
      const e = hass.entities[cfg.entity];
      if (e) deviceId = e.device_id;
    }
    Object.values(hass.entities || {}).forEach(e => {
      if (e.device_id !== deviceId) return;
      const id = e.entity_id;
      const s = hass.states[id];
      if (!s) return;
      // translation_key is in the entity registry entry (e), not in state.attributes
      const tk = e.translation_key || '';
      if      (tk === 'arbeitspreis'              || (!tk && id.includes('arbeitspreis') && !id.includes('nacht') && !id.includes('abwasser') && !id.includes('gesamt') && !id.includes('effektiv'))) result.arbeitspreis = id;
      else if (tk === 'arbeitspreis_nacht'         || (!tk && id.includes('arbeitspreis_nacht')))          result.arbeitspreis_nacht = id;
      else if (tk === 'effektiver_arbeitspreis'    || (!tk && id.includes('effektiver_arbeitspreis')))      result.effektiver_arbeitspreis = id;
      else if (tk === 'arbeitspreis_abwasser'      || (!tk && (id.includes('arbeitspreis_abwasser') || id.includes('abwasserpreis')))) result.arbeitspreis_abwasser = id;
      else if (tk === 'arbeitspreis_gesamt_wasser' || (!tk && (id.includes('arbeitspreis_gesamt_wasser') || id.includes('gesamtwasserpreis')))) result.arbeitspreis_gesamt_wasser = id;
      else if (tk === 'grundpreis'                || (!tk && id.includes('grundpreis')))                    result.grundpreis = id;
      else if (tk === 'abschlag_anpassung_empfohlen' || (!tk && id.includes('abschlag_anpassung_empfohlen'))) result.abschlag_anpassung_empfohlen = id;
      else if (tk === 'abschlag'          || (!tk && id.includes('abschlag')))            result.abschlag = id;
      else if (tk === 'jahreskosten'               || (!tk && id.includes('jahreskosten') && !id.includes('geschatzt'))) result.jahreskosten = id;
      else if (tk === 'verbrauch_kwh'              || (!tk && id.includes('verbrauch_kwh')))                result.verbrauch_kwh = id;
      else if (tk === 'verbrauch_hochgerechnet'    || (!tk && id.includes('hochgerechnet')))                result.verbrauch_hochgerechnet = id;
      else if (tk === 'verbrauch_bisher'           || (!tk && id.includes('verbrauch_bisher')))             result.verbrauch_bisher = id;
      else if (tk === 'guthaben_bisher'           || (!tk && id.includes('guthaben_bisher')))               result.guthaben_bisher = id;
      else if (tk === 'kosten_bisher'             || (!tk && id.includes('kosten_bisher')))                result.kosten_bisher = id;
      else if (tk === 'verbrauch_letzte_laufzeit' || (!tk && id.includes('letzte_laufzeit')))              result.verbrauch_letzte_laufzeit = id;
      else if (tk === 'empfohlener_abschlag'      || (!tk && id.includes('empfohlener_abschlag')))         result.empfohlener_abschlag = id;
      else if (tk === 'prognose_real'              || (!tk && id.includes('prognose_real')))                result.prognose_real = id;
      else if (tk === 'einspeiseverguetung'        || (!tk && id.includes('einspeiseverguetung')))          result.einspeiseverguetung = id;
      else if (tk === 'restlaufzeit'               || (!tk && id.includes('restlaufzeit')))                 result.restlaufzeit = id;
      else if (tk === 'beginn'                     || (!tk && id.includes('vertragsbeginn')))               result.beginn = id;
      else if (tk === 'ende'                       || (!tk && (id.includes('vertragsende') || id.includes('_ende')))) result.ende = id;
      else if (tk === 'anbieter'                   || (!tk && id.includes('anbieter')))                     result.anbieter = id;
      else if (tk === 'tarif'                      || (!tk && id.includes('_tarif')))                       result.tarif = id;
      else if (tk === 'kundennummer'               || (!tk && id.includes('kundennummer')))                 result.kundennummer = id;
      else if (tk === 'zaehlernummer'              || (!tk && (id.includes('zaehlernummer') || id.includes('zahlernummer')))) result.zaehlernummer = id;
      else if (tk === 'naechster_wechsel'          || (!tk && id.includes('wechsel')))                      result.naechster_wechsel = id;
      else if (tk === 'kuendigung_erinnerung'      || (!tk && id.includes('kuendigung')))                   result.kuendigung_erinnerung = id;
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

  _unit(entityId) {
    return this._attr(entityId, 'unit_of_measurement') || '';
  }

  _fmt(val, decimals = 2) {
    const n = parseFloat(val);
    if (isNaN(n)) return '—';
    return n.toLocaleString('de-DE', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  _fmtDate(val) {
    if (!val || val === 'unknown' || val === 'unavailable') return '—';
    // Dates are already formatted as dd.mm.yyyy by the integration
    if (/^\d{2}\.\d{2}\.\d{4}$/.test(val)) return val;
    try { return new Date(val).toLocaleDateString('de-DE'); } catch { return val; }
  }

  _ok(val) {
    return val && val !== 'unknown' && val !== 'unavailable';
  }

  _sparte() {
    const ents = this._getEntities();
    const a = this._state(ents.arbeitspreis);
    if (a) return (a.attributes.sparte || '').toLowerCase();
    const s = this._state(ents.anbieter);
    if (s) return (s.attributes.sparte || '').toLowerCase();
    return this._config.sparte || '';
  }

  _sparteIcon(sparte) {
    return {strom:'⚡',gas:'🔥',wasser:'💧',internet:'📶',mobilfunk:'📱',versicherung:'🛡️',sonstiges:'📄'}[sparte] || '📄';
  }

  _sparteColor(sparte) {
    return {strom:'var(--warning-color,#f59e0b)',gas:'var(--error-color,#ef4444)',wasser:'var(--success-color,#10b981)',internet:'var(--info-color,#6366f1)',mobilfunk:'#8b5cf6',versicherung:'#0ea5e9',sonstiges:'var(--secondary-text-color)'}[sparte] || 'var(--primary-color)';
  }

  _kuendigungAktiv(ents) {
    const s = this._state(ents.kuendigung_erinnerung);
    return s ? s.attributes.aktiv === true : false;
  }

  _renderCompact(ents, sparte, name) {
    const icon = this._sparteIcon(sparte);
    const color = this._sparteColor(sparte);
    const anbieter = this._val(ents.anbieter) || '—';
    const tarif = this._val(ents.tarif) || '';
    const kosten = this._val(ents.abschlag);
    const rest = this._val(ents.restlaufzeit);
    const aktiv = this._kuendigungAktiv(ents);
    const erinnerung = this._fmtDate(this._val(ents.kuendigung_erinnerung));
    const ende = this._fmtDate(this._val(ents.ende));
    const abschlagWarnung = this._attr(ents.prognose_real, 'abschlag_warnung_aktiv') === true;
    return `
      <div class="card compact">
        <div class="ci" style="background:${color}22;color:${color}">${icon}</div>
        <div class="ci-info">
          <div class="name">${name}</div>
          <div class="sub">${anbieter}${tarif ? ' · ' + tarif : ''}</div>
        </div>
        <div class="ci-right">
          ${this._ok(kosten) ? `<div class="cost">${this._fmt(kosten,0)} €/Mo</div>` : ''}
          ${this._ok(rest) ? `<div class="sub">${parseInt(rest)} T verbleibend</div>` : ''}
        </div>
        ${abschlagWarnung ? `<div class="chip warn" title="Abschlag zu niedrig">⚠ Abschlag</div>` : ''}
        ${aktiv ? `<div class="chip warn">⚠ ${erinnerung !== '—' ? erinnerung : ende}</div>` : `<div class="chip ok">Aktiv</div>`}
      </div>`;
  }

  _renderDetail(ents, sparte, name) {
    const icon = this._sparteIcon(sparte);
    const color = this._sparteColor(sparte);
    const anbieter = this._val(ents.anbieter) || '—';
    const tarif = this._val(ents.tarif) || '';
    const aktiv = this._kuendigungAktiv(ents);
    const erinnerung = this._fmtDate(this._val(ents.kuendigung_erinnerung));
    const beginn = this._fmtDate(this._val(ents.beginn));
    const ende = this._fmtDate(this._val(ents.ende));
    const kosten = this._val(ents.abschlag);
    const jahreskosten = this._val(ents.jahreskosten);
    const prognose = this._val(ents.prognose_real);
    const progNeg = prognose && parseFloat(prognose) < 0;
    const arbeitspreis = this._val(ents.arbeitspreis);
    const apUnit = this._unit(ents.arbeitspreis) || '€/kWh';
    const grundpreis = this._val(ents.grundpreis);
    const rest = this._val(ents.restlaufzeit);
    const kundennummer = this._val(ents.kundennummer);
    const zaehlernummer = this._val(ents.zaehlernummer);
    const wechsel = this._fmtDate(this._val(ents.naechster_wechsel));
    const kostenBisher = this._val(ents.kosten_bisher);
    const guthabenBisher = this._val(ents.guthaben_bisher);
    const guthabenBisherNeg = guthabenBisher && parseFloat(guthabenBisher) < 0;
    const verbrauchLetzte = this._val(ents.verbrauch_letzte_laufzeit);
    const verbrauchLetzteUnit = this._unit(ents.verbrauch_letzte_laufzeit);
    const empfohlenerAbschlag = this._val(ents.empfohlener_abschlag);
    const abschlagAnpassung = this._val(ents.abschlag_anpassung_empfohlen);
    const abschlagWarnung = this._attr(ents.prognose_real, 'abschlag_warnung_aktiv') === true;
    const istEnergie = ['strom','gas','wasser'].includes(sparte);
    const istGas = sparte === 'gas';
    const istWasser = sparte === 'wasser';
    const istStrom = sparte === 'strom';
    // Gas-Verbrauch
    const verbrauchKwh = this._val(ents.verbrauch_kwh);
    const brennwert = this._attr(ents.verbrauch_kwh, 'brennwert');
    const zustandszahl = this._attr(ents.verbrauch_kwh, 'zustandszahl');
    const verbrauchM3 = this._attr(ents.verbrauch_kwh, 'jahresverbrauch_m3');
    // Echte Verbrauchsmessung
    const verbrauchBisher = this._val(ents.verbrauch_bisher);
    const verbrauchUnit = this._unit(ents.verbrauch_bisher);
    const verbrauchHoch = this._val(ents.verbrauch_hochgerechnet);
    // Wasser
    const apAbwasser = this._val(ents.arbeitspreis_abwasser);
    const apGesamt = this._val(ents.arbeitspreis_gesamt_wasser);
    const wasserUnit = this._unit(ents.arbeitspreis_gesamt_wasser) || '€/m³';
    // Strom
    const einspeisung = this._val(ents.einspeiseverguetung);
    const apNacht = this._val(ents.arbeitspreis_nacht);
    const apEffektiv = this._val(ents.effektiver_arbeitspreis);
    const oekostrom = this._attr(ents.arbeitspreis, 'oekostrom');

    return `
      <div class="card detail">
        <div class="dh">
          <div class="hl">
            <div class="iw" style="background:${color}22;color:${color}">${icon}</div>
            <div>
              <div class="name">${name}</div>
              <div class="sub">${anbieter}${tarif?' · '+tarif:''}${oekostrom===true?' · <span class="green">Ökostrom</span>':''}</div>
            </div>
          </div>
          <div style="display:flex;gap:6px;align-items:center">
            ${abschlagWarnung?`<div class="chip warn">⚠ Abschlag zu niedrig</div>`:''}
            ${aktiv?`<div class="chip warn">⚠ ${erinnerung!=='—'?erinnerung:ende}</div>`:`<div class="chip ok">Aktiv</div>`}
          </div>
        </div>

        <div class="metrics">
          <div class="metric"><div class="ml">Abschlag</div><div class="mv">${this._ok(kosten)?this._fmt(kosten,0)+' €':'—'}</div><div class="ms">/Monat</div></div>
          <div class="metric"><div class="ml">Abschlag (Laufzeit)</div><div class="mv">${this._ok(jahreskosten)?this._fmt(jahreskosten,0)+' €':'—'}</div><div class="ms"> </div></div>
          ${istEnergie&&this._ok(kostenBisher)?`<div class="metric"><div class="ml">Kosten (Bisher)</div><div class="mv">${this._fmt(kostenBisher,0)} €</div><div class="ms"> </div></div>`:''}
          ${istEnergie&&this._ok(guthabenBisher)?`<div class="metric"><div class="ml">Guthaben (Bisher)</div><div class="mv ${guthabenBisherNeg?'neg':'pos'}">${this._fmt(guthabenBisher,0)} €</div><div class="ms ${guthabenBisherNeg?'neg':'pos'}">${guthabenBisherNeg?'Nachzahlung':'Guthaben'}</div></div>`:''}
          ${istEnergie&&this._ok(prognose)?`<div class="metric"><div class="ml">Guthaben (Ende)</div><div class="mv ${progNeg?'neg':'pos'}">${this._fmt(prognose,0)} €</div><div class="ms ${progNeg?'neg':'pos'}">${progNeg?'Nachzahlung':'Guthaben'}</div></div>`:''}
        </div>

        <div class="div"></div>

        <div class="g2">
          ${istEnergie&&!istWasser&&this._ok(arbeitspreis)?`<div><div class="dl">Arbeitspreis</div><div class="dv">${this._fmt(arbeitspreis,4)} ${apUnit}</div></div>`:''}
          ${istEnergie&&!istWasser&&this._ok(grundpreis)?`<div><div class="dl">Grundpreis</div><div class="dv">${this._fmt(grundpreis,2)} €/Mo</div></div>`:''}
          ${istStrom&&this._ok(apNacht)?`<div><div class="dl">Arbeitspreis Nacht</div><div class="dv">${this._fmt(apNacht,4)} €/kWh</div></div>`:''}
          ${istStrom&&this._ok(apEffektiv)?`<div><div class="dl">Eff. Arbeitspreis</div><div class="dv">${this._fmt(apEffektiv,4)} €/kWh</div></div>`:''}
          ${istGas&&verbrauchM3?`<div><div class="dl">Verbrauch (m³)</div><div class="dv">${this._fmt(verbrauchM3,0)} m³</div></div>`:''}
          ${istGas&&this._ok(verbrauchKwh)?`<div><div class="dl">Verbrauch (kWh)</div><div class="dv">${this._fmt(verbrauchKwh,0)} kWh</div></div>`:''}
          ${istGas&&brennwert?`<div><div class="dl">Brennwert</div><div class="dv">${this._fmt(brennwert,3)} kWh/m³</div></div>`:''}
          ${istGas&&zustandszahl?`<div><div class="dl">Zustandszahl</div><div class="dv">${this._fmt(zustandszahl,4)}</div></div>`:''}
          ${istWasser&&this._ok(apAbwasser)?`<div><div class="dl">Abwasserpreis</div><div class="dv">${this._fmt(apAbwasser,4)} ${wasserUnit}</div></div>`:''}
          ${istWasser&&this._ok(apGesamt)?`<div><div class="dl">Gesamtpreis (Wasser)</div><div class="dv">${this._fmt(apGesamt,4)} ${wasserUnit}</div></div>`:''}
          ${istWasser&&this._ok(grundpreis)?`<div><div class="dl">Grundpreis</div><div class="dv">${this._fmt(grundpreis,2)} €/Mo</div></div>`:''}
          ${istStrom&&this._ok(einspeisung)?`<div><div class="dl">Einspeisevergütung</div><div class="dv">${this._fmt(einspeisung,4)} €/kWh</div></div>`:''}
          ${istEnergie&&this._ok(verbrauchLetzte)?`<div><div class="dl">Verbrauch (Letzte Laufzeit)</div><div class="dv">${this._fmt(verbrauchLetzte,1)} ${verbrauchLetzteUnit}</div></div>`:''}
          ${istEnergie&&this._ok(empfohlenerAbschlag)?`<div><div class="dl">Abschlag (Empfohlen)</div><div class="dv">${this._fmt(empfohlenerAbschlag,0)} €/Mo</div></div>`:''}
          ${istEnergie&&this._ok(abschlagAnpassung)?`<div><div class="dl">Abschlag (Anpassung empfohlen)</div><div class="dv${abschlagWarnung?' neg':''}">${this._fmt(abschlagAnpassung,0)} €/Mo</div></div>`:''}
          ${istEnergie&&this._ok(verbrauchBisher)?`<div><div class="dl">Verbrauch bisher</div><div class="dv">${this._fmt(verbrauchBisher,1)} ${verbrauchUnit}</div></div>`:''}
          ${istEnergie&&this._ok(verbrauchHoch)?`<div><div class="dl">Hochgerechnet/Jahr</div><div class="dv">${this._fmt(verbrauchHoch,0)} ${verbrauchUnit}</div></div>`:''}
        </div>

        <div class="div"></div>

        <div class="rows">
          ${beginn!=='—'?`<div class="row"><span class="rl">Vertragsbeginn</span><span class="rv">${beginn}</span></div>`:''}
          ${ende!=='—'?`<div class="row"><span class="rl">Vertragsende</span><span class="rv">${ende}</span></div>`:''}
          ${this._ok(rest)?`<div class="row"><span class="rl">Restlaufzeit</span><span class="rv">${parseInt(rest)} Tage</span></div>`:''}
          ${wechsel!=='—'?`<div class="row"><span class="rl">Nächster Wechsel</span><span class="rv acc">${wechsel}</span></div>`:''}
          ${this._ok(kundennummer)?`<div class="row"><span class="rl">Kundennummer</span><span class="rv mut">${kundennummer}</span></div>`:''}
          ${this._ok(zaehlernummer)?`<div class="row"><span class="rl">Zählernummer</span><span class="rv mut">${zaehlernummer}</span></div>`:''}
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
    let deviceId = cfg.device_id;
    if (!deviceId && cfg.entity && this._hass && this._hass.entities) {
      const e = this._hass.entities[cfg.entity];
      if (e) deviceId = e.device_id;
    }
    const device = (this._hass && this._hass.devices || {})[deviceId];
    return device ? device.name : 'Tariffy';
  }

  _render() {
    if (!this._hass || !this._config) return;
    if (this._mode === undefined) this._mode = this._config.mode || 'compact';
    const ents = this._getEntities();
    const sparte = this._sparte();
    const name = this._getDeviceName();
    const html = this._mode === 'detail' ? this._renderDetail(ents, sparte, name) : this._renderCompact(ents, sparte, name);
    this.shadowRoot.innerHTML = `<style>
      :host{display:block}*{box-sizing:border-box;margin:0;padding:0}
      .card{background:var(--ha-card-background,var(--card-background-color,#fff));border-radius:var(--ha-card-border-radius,12px);border:1px solid var(--divider-color,rgba(0,0,0,.12));font-family:var(--paper-font-body1_-_font-family,sans-serif);color:var(--primary-text-color);overflow:hidden}
      .compact{display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer}
      .ci,.iw{width:38px;height:38px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px;flex-shrink:0}
      .iw{width:40px;height:40px}
      .ci-info{flex:1;min-width:0}.ci-right{text-align:right;flex-shrink:0}
      .name{font-size:14px;font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      .sub{font-size:12px;color:var(--secondary-text-color)}.cost{font-size:14px;font-weight:500}
      .chip{font-size:11px;font-weight:500;padding:3px 8px;border-radius:6px;white-space:nowrap;flex-shrink:0}
      .warn{background:rgba(245,158,11,.15);color:#b45309}.ok{background:rgba(16,185,129,.15);color:#047857}
      .detail{padding:14px 16px}.dh{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:14px}
      .hl{display:flex;align-items:center;gap:10px;flex:1;min-width:0}.green{color:#047857}
      .metrics{display:grid;grid-template-columns:repeat(auto-fit,minmax(80px,1fr));gap:10px;margin-bottom:14px}
      .metric{background:var(--secondary-background-color,rgba(0,0,0,.04));border-radius:8px;padding:10px 12px}
      .ml{font-size:11px;color:var(--secondary-text-color);margin-bottom:2px}.mv{font-size:20px;font-weight:500}.ms{font-size:11px;color:var(--secondary-text-color)}
      .neg{color:var(--error-color,#ef4444)}.pos{color:var(--success-color,#10b981)}
      .div{border:none;border-top:1px solid var(--divider-color,rgba(0,0,0,.08));margin:12px 0}
      .g2{display:grid;grid-template-columns:1fr 1fr;gap:10px 16px;margin-bottom:4px}
      .dl{font-size:11px;color:var(--secondary-text-color);margin-bottom:2px}.dv{font-size:13px;font-weight:500}
      .rows{display:flex;flex-direction:column}
      .row{display:flex;justify-content:space-between;align-items:center;padding:6px 0;border-top:1px solid var(--divider-color,rgba(0,0,0,.06))}
      .row:first-child{border-top:none}.rl{font-size:13px;color:var(--secondary-text-color)}.rv{font-size:13px;font-weight:500}
      .rv.mut{color:var(--secondary-text-color);font-weight:400}.rv.acc{color:var(--accent-color,#6366f1)}
    </style>${html}`;
    this.shadowRoot.querySelector('.card').addEventListener('click', () => this._toggleMode());
  }

  getCardSize() { return this._mode === 'detail' ? 4 : 1; }
}

customElements.define('tariffy-card', TariffyCard);


class TariffyCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this._config = {};
    this._rendered = false;
  }

  setConfig(config) {
    this._config = { ...config };
    if (this._rendered) this._syncValues();
    else this._tryRender();
  }

  set hass(hass) {
    this._hass = hass;
    if (!this._rendered) this._tryRender();
  }

  _tryRender() {
    if (!this._hass) return;
    this._render();
    this._rendered = true;
  }

  _fire(config) {
    this.dispatchEvent(new CustomEvent('config-changed', {
      detail: { config }, bubbles: true, composed: true,
    }));
  }

  _tariffyDevices() {
    if (!this._hass) return [];
    const seen = new Set();
    const result = [];
    Object.values(this._hass.entities || {}).forEach(e => {
      if (e.platform !== 'tariffy' || !e.device_id || seen.has(e.device_id)) return;
      seen.add(e.device_id);
      result.push({
        id: e.device_id,
        name: (this._hass.devices || {})[e.device_id]?.name || e.device_id,
      });
    });
    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  _syncValues() {
    const cfg = this._config;
    const d = this.shadowRoot.querySelector('#device_id');
    const n = this.shadowRoot.querySelector('#name');
    const m = this.shadowRoot.querySelector('#mode');
    if (d) d.value = cfg.device_id || '';
    if (n) n.value = cfg.name || '';
    if (m) m.value = cfg.mode || 'compact';
  }

  _render() {
    const cfg = this._config;
    const devices = this._tariffyDevices();

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; font-family: var(--paper-font-body1_-_font-family, sans-serif); }
        .section {
          font-size: 12px; font-weight: 500;
          color: var(--secondary-text-color);
          text-transform: uppercase; letter-spacing: .06em;
          padding: 16px 0 8px;
          border-bottom: 1px solid var(--divider-color);
          margin-bottom: 12px;
        }
        .section:first-child { padding-top: 0; }
        .field { margin-bottom: 16px; }
        label {
          display: block;
          font-size: 12px;
          color: var(--secondary-text-color);
          margin-bottom: 6px;
        }
        select, input[type="text"] {
          width: 100%;
          height: 48px;
          padding: 0 12px;
          font-size: 14px;
          color: var(--primary-text-color);
          background: var(--input-fill-color, rgba(0,0,0,0.04));
          border: none;
          border-bottom: 1px solid var(--secondary-text-color);
          border-radius: 4px 4px 0 0;
          box-sizing: border-box;
          appearance: none;
          -webkit-appearance: none;
          cursor: pointer;
          outline: none;
        }
        select:focus, input[type="text"]:focus {
          border-bottom: 2px solid var(--primary-color);
        }
        .select-wrap { position: relative; }
        .select-wrap::after {
          content: '▾';
          position: absolute;
          right: 12px;
          top: 50%;
          transform: translateY(-50%);
          pointer-events: none;
          color: var(--secondary-text-color);
          font-size: 16px;
        }
        .hint {
          font-size: 12px;
          color: var(--secondary-text-color);
          margin-top: 4px;
        }
      </style>

      <div class="section">Gerät</div>
      <div class="field">
        <label>Tariffy-Gerät</label>
        <div class="select-wrap">
          <select id="device_id">
            <option value="">— Gerät wählen —</option>
            ${devices.map(d => `<option value="${d.id}"${cfg.device_id === d.id ? ' selected' : ''}>${d.name}</option>`).join('')}
          </select>
        </div>
      </div>

      <div class="section">Darstellung</div>
      <div class="field">
        <label>Anzeigename (optional)</label>
        <input type="text" id="name" value="${cfg.name || ''}" placeholder="Leer = Gerätename">
      </div>
      <div class="field">
        <label>Startmodus</label>
        <div class="select-wrap">
          <select id="mode">
            <option value="compact"${(cfg.mode||'compact') === 'compact' ? ' selected' : ''}>Kompakt</option>
            <option value="detail"${cfg.mode === 'detail' ? ' selected' : ''}>Detail</option>
          </select>
        </div>
        <div class="hint">Per Klick auf die Card zwischen den Modi wechseln</div>
      </div>
    `;

    this.shadowRoot.querySelector('#device_id').addEventListener('change', e => {
      const val = e.target.value;
      this._config = { ...this._config, device_id: val };
      this._fire(this._config);
    });

    this.shadowRoot.querySelector('#name').addEventListener('change', e => {
      const val = e.target.value.trim();
      this._config = { ...this._config };
      if (val) this._config.name = val; else delete this._config.name;
      this._fire(this._config);
    });

    this.shadowRoot.querySelector('#mode').addEventListener('change', e => {
      this._config = { ...this._config, mode: e.target.value };
      this._fire(this._config);
    });
  }
}

customElements.define('tariffy-card-editor', TariffyCardEditor);

window.customCards = window.customCards || [];
window.customCards.push({
  type: 'tariffy-card',
  name: 'Tariffy Card',
  description: 'Zeigt Tariffy-Verträge kompakt oder detailliert an.',
});
console.log('[tariffy-card] v1.12.0 geladen');
