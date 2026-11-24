/* ============================================================
   PLANO B DO ONLINE: quando a conexão direta (WebRTC) não passa
   (4G, wi-fi de escola, roteadores chatos), as mensagens vão por
   um "correio" público (MQTT). Mesma interface de conexão do PeerJS.
   ============================================================ */
'use strict';
const RELAY_BROKERS = (() => { const q = new URLSearchParams(location.search).get('relay'); return q ? [q] : ['wss://broker.emqx.io:8084/mqtt', 'wss://broker.hivemq.com:8884/mqtt']; })();
const RELAY_BASE = code => 'cidade-esqueceu/v2/' + code;
class RelayConn {
  constructor(client, topic, myId) { this.client = client; this.topic = topic; this.myId = myId; this.open = false; this.h = {}; this.last = Date.now(); this.relay = true; }
  on(ev, fn) { (this.h[ev] = this.h[ev] || []).push(fn); return this; }
  emit(ev, x) { (this.h[ev] || []).forEach(f => { try { f(x); } catch (e) { console.warn(e); } }); }
  raw(d) { try { this.client.publish(this.topic, JSON.stringify({ f: this.myId, d })); } catch (e) { } }
  send(data) { if (this.open) this.raw(data); }
  got(d) { this.last = Date.now(); if (d === '__ping') return; if (d === '__bye') return this.close(true); if (d === '__ok') { if (!this.open) { this.open = true; this.emit('open'); } return; } if (this.open) this.emit('data', d); }
  close(remote) { if (this.closed) return; this.closed = true; if (!remote) this.raw('__bye'); const was = this.open; this.open = false; clearInterval(this.pi); if (was || remote) this.emit('close'); }
  startPing() { this.pi = setInterval(() => { if (this.closed) return clearInterval(this.pi); this.raw('__ping'); if (Date.now() - this.last > 20000) this.close(true); }, 4000); }
}
function relayClient(url) {
  if (typeof mqtt === 'undefined') return null;
  try { return mqtt.connect(url, { clean: true, connectTimeout: 7000, reconnectPeriod: 2500, keepalive: 20, clientId: 'ce_' + Math.random().toString(36).slice(2, 10) }); } catch (e) { return null; }
}
const Relay = {
  hosts: [],
  /* anfitrião: escuta em todos os correios ao mesmo tempo */
  host(code, onConn, onReady) {
    this.stop(); this.ready = false;
    RELAY_BROKERS.forEach(url => {
      const c = relayClient(url); if (!c) return; const conns = {}; this.hosts.push(c);
      c.on('connect', () => c.subscribe(RELAY_BASE(code) + '/h', () => { if (!this.ready) { this.ready = true; onReady && onReady(); } }));
      c.on('message', (topic, buf) => {
        let m; try { m = JSON.parse(buf.toString()); } catch (e) { return; }
        if (!m || !m.f) return;
        let cn = conns[m.f];
        if (m.d === '__join') {
          if (cn && !cn.closed) { cn.raw('__ok'); return; }
          cn = conns[m.f] = new RelayConn(c, RELAY_BASE(code) + '/g/' + m.f, 'host'); cn.open = true; cn.raw('__ok'); cn.startPing(); onConn(cn); cn.emit('open'); return;
        }
        if (cn) cn.got(m.d);
      });
      c.on('error', () => { });
    });
  },
  /* convidado: tenta os correios em sequência até um responder */
  join(code, onOpen, onFail) {
    const gid = 'g' + Math.random().toString(36).slice(2, 10); let done = false, k = 0;
    const tryNext = () => {
      if (done) return; if (k >= RELAY_BROKERS.length) { onFail && onFail(); return; }
      const c = relayClient(RELAY_BROKERS[k++]); if (!c) return tryNext(); this.guest = c;
      const cn = new RelayConn(c, RELAY_BASE(code) + '/h', gid); let tries = 0, iv = null;
      const giveUp = setTimeout(() => { if (!cn.open) { clearInterval(iv); try { c.end(true); } catch (e) { } tryNext(); } }, 12000);
      c.on('connect', () => {
        c.subscribe(RELAY_BASE(code) + '/g/' + gid, () => { cn.raw('__join'); iv = setInterval(() => { if (cn.open || ++tries > 8) return clearInterval(iv); cn.raw('__join'); }, 1300); });
      });
      c.on('message', (t, buf) => { let m; try { m = JSON.parse(buf.toString()); } catch (e) { return; } if (m && m.d !== undefined) cn.got(m.d); });
      cn.on('open', () => { if (done) return cn.close(); done = true; clearTimeout(giveUp); clearInterval(iv); cn.startPing(); onOpen(cn); });
      c.on('error', () => { });
    };
    tryNext();
    return { cancel: () => { done = true; try { this.guest && this.guest.end(true); } catch (e) { } } };
  },
  stop() { this.ready = false; this.hosts.forEach(c => { try { c.end(true); } catch (e) { } }); this.hosts = []; try { this.guest && this.guest.end(true); } catch (e) { } this.guest = null; }
};
