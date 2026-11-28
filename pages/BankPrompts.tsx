import React, { useEffect, useRef, useState } from 'react';
import { SANS, MONO } from '../components/darkKit';

/* ══════════════════════════════════════════════════════════════
   /bank-prompts — Landing autocontenida (STANDALONE_ROUTES en App.tsx).
   Port a React de landing-prompts/index.html: trae su propio header,
   footer y estilos, todos acotados bajo `.lp` para no tocar el resto.
   ══════════════════════════════════════════════════════════════ */

/* Checkout de Hotmart (el mismo producto que /ebook) */
const BUY_URL = 'https://pay.hotmart.com/K99381988U?checkoutMode=10&bid=1778363157034';
const PRICE = '$14.99';
const DEFAULT_TITLE = 'Banco de Prompts de IA · +1.000 prompts para ChatGPT, Claude y Gemini | Alpacka';

const CSS = `
.lp{
  --bg:#0B0908;--bg2:#100E0C;--card:#141210;--text:#F4EDE0;--muted:#B9B1A4;--dim:#8A8276;
  --line:rgba(244,237,224,.09);--line2:rgba(244,237,224,.18);
  --gold:#E9C46A;--gold-hi:#F8E4AC;--gold-lo:#B8892E;--gold-ink:#1E1503;
  --gold-soft:rgba(233,196,106,.12);--gold-line:rgba(233,196,106,.34);
  --paper:#F7F2E3;--ink:#17130D;
  --display:${SANS};--mono:${MONO};
  background:var(--bg);color:var(--text);font-family:var(--display);font-size:16px;line-height:1.5;
  -webkit-font-smoothing:antialiased;overflow-x:hidden;min-height:100vh;
}
.lp *{box-sizing:border-box;margin:0;padding:0}
.lp a{color:inherit}
.lp section[id]{scroll-margin-top:70px}
.lp .wrap{width:100%;max-width:1120px;margin:0 auto;padding:0 20px}

/* Top bar + nav */
.lp .bar{background:var(--gold);color:var(--gold-ink)}
.lp .bar .wrap{display:flex;justify-content:center;align-items:center;gap:10px;min-height:34px;font-size:.7rem;font-weight:700;letter-spacing:.14em;text-transform:uppercase;text-align:center;white-space:nowrap}
.lp .bar i{width:4px;height:4px;border-radius:50%;background:var(--gold-ink);opacity:.5;flex:none}
.lp .nav{position:sticky;top:0;z-index:25;border-bottom:1px solid var(--line);background:rgba(11,9,8,.86);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px)}
.lp .nav .wrap{display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:60px}
.lp .brand{white-space:nowrap;display:flex;align-items:center;gap:10px;font-weight:700;letter-spacing:-.01em;text-decoration:none}
.lp .logo{width:28px;height:28px;border-radius:8px;background:linear-gradient(160deg,var(--gold-hi),var(--gold-lo));color:var(--gold-ink);display:grid;place-items:center;font-weight:800;font-size:.95rem}
.lp .nav-links{display:none;gap:22px;font-size:.88rem;color:var(--muted)}
.lp .nav-links a{text-decoration:none}
.lp .nav-links a:hover{color:var(--text)}
.lp .nav .cta-s{color:var(--gold-ink);background:var(--gold);text-decoration:none;font-weight:700;font-size:.84rem;padding:9px 14px;border-radius:999px;white-space:nowrap}

/* Hero */
.lp .hero{position:relative;padding:34px 0 30px;overflow:hidden}
.lp .hero::before{content:"";position:absolute;left:50%;top:-40px;width:680px;height:460px;transform:translateX(-50%);background:radial-gradient(closest-side,rgba(233,196,106,.14),transparent 70%);pointer-events:none}
.lp .hero .wrap{position:relative;display:grid;gap:26px}
.lp .eyebrow{font-family:var(--mono);font-size:.68rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold);display:flex;align-items:center;gap:12px}
.lp .eyebrow::before{content:"";width:34px;height:1px;background:var(--gold-line)}
.lp h1{font-size:clamp(1.9rem,6.4vw + .5rem,3.4rem);line-height:1.04;letter-spacing:-.04em;text-wrap:balance;font-weight:700;margin-top:14px}
.lp h1 em{font-style:normal;color:var(--gold);display:block}
.lp .sub{color:var(--muted);font-size:clamp(.98rem,.9rem + .4vw,1.08rem);line-height:1.5;margin-top:16px;max-width:34em}
.lp .sub strong{color:var(--gold-hi);font-weight:700}
.lp .nos{display:grid;gap:9px;font-size:1rem;font-weight:600;letter-spacing:-.005em}
.lp .nos>span{display:flex;align-items:center;gap:10px}
.lp .works{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:18px}
.lp .works .lab{margin-right:4px}
.lp .pill{font-family:var(--mono);font-size:.62rem;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);border:1px solid var(--line2);border-radius:999px;padding:6px 10px;white-space:nowrap}

.lp .buybox{background:var(--card);border:1px solid var(--gold-line);border-radius:18px;padding:20px;box-shadow:0 40px 120px -70px rgba(233,196,106,.55)}
.lp .bb-tag{display:inline-flex;align-items:center;gap:8px;font-family:var(--mono);font-size:.66rem;letter-spacing:.16em;text-transform:uppercase;color:var(--gold)}
.lp .bb-tag::before{content:"";width:6px;height:6px;border-radius:50%;background:var(--gold);animation:lp-pulse 2.6s ease-in-out infinite}
.lp .bb-top{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin:12px 0 16px}
.lp .bb-price{display:flex;align-items:baseline;gap:6px}
.lp .bb-price small{font-size:1.1rem;color:var(--muted);font-weight:600}
.lp .bb-price b{font-size:clamp(2.4rem,8vw,2.9rem);line-height:.9;letter-spacing:-.04em;font-weight:700}
.lp .bb-save{text-align:right;font-size:.8rem;color:var(--muted);line-height:1.3}
.lp .bb-save b{display:block;color:var(--gold);font-size:.98rem;font-weight:650}
.lp .bb-list{list-style:none;display:grid;gap:8px;margin:0 0 16px;padding-top:14px;border-top:1px solid var(--line)}
.lp .bb-list li{display:flex;gap:10px;align-items:flex-start;font-size:.92rem;color:var(--text)}
.lp .bb-list .tick{margin-top:3px}
.lp .btn{position:relative;overflow:hidden;display:flex;align-items:center;justify-content:center;gap:8px;width:100%;background:linear-gradient(180deg,var(--gold-hi),var(--gold));color:var(--gold-ink);text-decoration:none;font-family:inherit;font-weight:700;font-size:1.04rem;padding:16px 18px;border-radius:14px;border:0;cursor:pointer;transition:transform .15s,filter .2s}
.lp .btn:hover{filter:brightness(1.05)}
.lp .btn:active{transform:scale(.985)}
.lp .btn::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 36%,rgba(255,255,255,.6) 50%,transparent 64%);transform:translateX(-130%);animation:lp-sheen 5.5s ease-in-out 2s infinite}
.lp .btn .arr{width:8px;height:8px;border:solid currentColor;border-width:2px 2px 0 0;transform:rotate(45deg)}
.lp .bb-note{margin-top:10px;font-size:.84rem;color:var(--muted);text-align:center}
.lp .tick{width:16px;height:16px;border-radius:50%;background:var(--gold);flex:none;position:relative;display:inline-block}
.lp .tick::after{content:"";position:absolute;left:5px;top:3px;width:4px;height:7px;border:solid var(--gold-ink);border-width:0 2px 2px 0;transform:rotate(42deg)}

/* Stats */
.lp .stats{list-style:none;display:grid;grid-template-columns:repeat(2,1fr);gap:8px;padding:0 0 22px}
.lp .stats li{border:1px solid var(--line);border-radius:14px;padding:16px 8px;background:var(--bg2);text-align:center}
.lp .stats b{display:block;font-size:clamp(1.5rem,5.5vw,1.9rem);line-height:1;font-weight:700;letter-spacing:-.04em;color:var(--gold)}
.lp .stats span{display:block;margin-top:6px;font-size:.76rem;line-height:1.25;color:var(--muted)}

.lp .chips-all{padding:0 0 44px;display:grid;gap:12px;justify-items:center;text-align:center}
.lp .chips-all>div{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;max-width:56rem}
.lp .chips-all a{text-decoration:none;font-size:.88rem;font-weight:600;color:var(--text);border:1px solid var(--line2);background:var(--card);border-radius:999px;padding:8px 13px;white-space:nowrap;transition:border-color .2s,color .2s}
.lp .chips-all a:hover{border-color:var(--gold);color:var(--gold-hi)}

/* Sections */
.lp .sec{position:relative;padding:clamp(40px,7vw,64px) 0 clamp(44px,8vw,72px);border-top:1px solid var(--line)}
.lp .aura::before{content:"";position:absolute;inset:0 0 auto;height:420px;background:radial-gradient(44% 62% at 50% 0%,rgba(233,196,106,.09),transparent 72%);pointer-events:none}
.lp .sec-h{max-width:44rem;margin:0 auto 28px;display:grid;gap:10px;text-align:left;position:relative}
.lp .sec-h.center{text-align:center;justify-items:center}
.lp .kick{font-family:var(--mono);font-size:.66rem;letter-spacing:.2em;text-transform:uppercase;color:var(--gold)}
.lp h2{font-size:clamp(1.45rem,4.4vw + .55rem,2.25rem);line-height:1.12;letter-spacing:-.03em;text-wrap:balance;font-weight:700}
.lp h2 em{font-style:normal;color:var(--gold)}
.lp .sec-h p:not(.kick){color:var(--muted);max-width:36rem;font-size:1.02rem}
.lp .sec-h p strong{color:var(--text);font-weight:650}
.lp .lab{display:block;font-family:var(--mono);font-size:.62rem;letter-spacing:.18em;text-transform:uppercase;color:var(--dim)}
.lp .narrow{max-width:44rem;margin:0 auto;position:relative}

/* Problem */
.lp .pain{display:grid;gap:10px}
.lp .pain li{list-style:none;display:grid;grid-template-columns:28px minmax(0,1fr);gap:12px;align-items:start;padding:16px;border:1px solid var(--line);border-radius:14px;background:var(--card)}
.lp .pain i{font-style:normal;width:28px;height:28px;border-radius:50%;border:1.5px solid var(--line2);display:grid;place-items:center;color:var(--dim);font-size:.9rem;font-weight:700}
.lp .pain b{display:block;font-weight:650;letter-spacing:-.01em}
.lp .pain span{display:block;color:var(--muted);font-size:.92rem;margin-top:2px}

/* Steps */
.lp .steps{display:grid;gap:10px}
.lp .step{display:grid;grid-template-columns:44px minmax(0,1fr);gap:14px;padding:18px;border:1px solid var(--line);border-radius:16px;background:var(--card)}
.lp .step .n{width:44px;height:44px;border-radius:50%;background:var(--gold);color:var(--gold-ink);font-weight:800;font-size:1.2rem;display:grid;place-items:center}
.lp .step b{display:block;font-size:1.12rem;letter-spacing:-.02em;line-height:1.2}
.lp .step span{display:block;color:var(--muted);font-size:.94rem;margin-top:4px}
.lp .step span.br{display:inline;margin:0;font-size:.75rem;color:var(--ink)}
.lp .step small{display:inline-block;margin-top:8px;font-family:var(--mono);font-size:.6rem;letter-spacing:.14em;text-transform:uppercase;color:var(--gold)}

/* Prompt sample */
.lp .pbox{background:var(--paper);color:var(--ink);border-radius:16px;overflow:hidden;box-shadow:0 30px 70px -30px rgba(0,0,0,.8)}
.lp .pb-h{background:#000;color:var(--text);display:flex;justify-content:space-between;align-items:center;gap:10px;padding:10px 10px 10px 16px;font-weight:650;font-size:.9rem}
.lp .pb-h .t{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.lp .copy{font:inherit;cursor:pointer;border:0;background:var(--gold);color:var(--gold-ink);border-radius:999px;padding:8px 16px;font-size:.8rem;font-weight:700;white-space:nowrap;transition:background .2s}
.lp .copy.ok{background:#CFE8C0}
.lp .pb-b{padding:18px 18px 8px;font-size:.92rem;line-height:1.55;max-height:340px;overflow:hidden;position:relative}
.lp .pb-b.open{max-height:none}
.lp .pb-b:not(.open)::after{content:"";position:absolute;left:0;right:0;bottom:0;height:90px;background:linear-gradient(transparent,var(--paper))}
.lp .pb-b p{margin-bottom:10px}
.lp .pb-b h4{font-family:var(--mono);font-size:.64rem;letter-spacing:.16em;text-transform:uppercase;color:#8A6A1E;margin:14px 0 6px}
.lp .pb-b ol,.lp .pb-b ul{padding-left:20px;margin-bottom:10px}
.lp .pb-b ol{list-style:decimal}
.lp .pb-b ul{list-style:disc}
.lp .pb-b li{margin-bottom:4px}
.lp .br{display:inline-block;background:#F3DC9A;color:var(--ink);font-weight:650;font-size:.82rem;line-height:1.2;padding:2px 6px;border-radius:5px}
.lp .pb-f{display:flex;justify-content:center;padding:6px 16px 16px}
.lp .more{font:inherit;cursor:pointer;background:transparent;border:1px solid rgba(23,19,13,.25);color:var(--ink);border-radius:999px;padding:8px 16px;font-size:.84rem;font-weight:650}
.lp .stabs{display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-bottom:12px}
.lp .stabs button{font:inherit;cursor:pointer;padding:11px 8px;border-radius:14px;border:1px solid var(--line2);background:var(--card);color:var(--muted);font-weight:700;font-size:.92rem;letter-spacing:-.01em;transition:background .2s,color .2s,border-color .2s}
.lp .stabs button.on{background:var(--gold);border-color:var(--gold);color:var(--gold-ink)}
.lp .spanel{animation:lp-fadeup .45s ease both}
.lp .sample-note{margin-top:14px;color:var(--muted);font-size:.9rem;text-align:center}

/* Anatomy */
.lp .anat{display:grid;gap:10px}
.lp .anat li{list-style:none;padding:16px 18px;border:1px solid var(--line);border-radius:14px;background:var(--card);display:grid;gap:4px}
.lp .anat code{font-family:var(--mono);font-size:.68rem;letter-spacing:.14em;color:var(--gold)}
.lp .anat b{font-weight:650;letter-spacing:-.01em}
.lp .anat span{color:var(--muted);font-size:.92rem}

/* Catalog */
.lp .grp{max-width:56rem;margin:0 auto 26px}
.lp .grp-h{display:flex;flex-direction:column;gap:4px;margin-bottom:12px;padding-bottom:10px;border-bottom:1px solid var(--line)}
.lp .grp-h .lab{color:var(--gold);white-space:nowrap}
.lp .grp-h h3{font-size:1.25rem;letter-spacing:-.025em;line-height:1.2;font-weight:700}
.lp .cats{list-style:none;display:grid;gap:8px}
.lp .cats li{display:grid;grid-template-columns:46px minmax(0,1fr);gap:14px;align-items:start;padding:14px;border:1px solid var(--line);border-radius:14px;background:var(--card);transition:border-color .2s,background .2s}
.lp .cats li:hover{border-color:var(--gold-line);background:linear-gradient(180deg,rgba(233,196,106,.07),rgba(233,196,106,.01))}
.lp .cats i{font-style:normal;width:46px;height:46px;border-radius:12px;background:var(--gold-soft);border:1px solid var(--gold-line);display:grid;place-items:center;font-size:1.35rem}
.lp .cats b{display:block;font-weight:700;font-size:1.04rem;line-height:1.25;letter-spacing:-.015em}
.lp .cats span{display:block;margin-top:4px;font-size:.86rem;line-height:1.45;color:var(--muted)}
.lp .cat-cta{max-width:28rem;margin:30px auto 0;text-align:center;display:grid;gap:14px}
.lp .cat-cta p{color:var(--muted)}
.lp .cat-cta b{color:var(--gold-hi)}

/* Updates */
.lp .upd{display:grid;gap:12px}
.lp .upd>div{border:1px solid var(--line);border-radius:18px;background:var(--card);padding:20px;display:grid;gap:8px;align-content:start}
.lp .upd b{font-weight:700;font-size:1.2rem;line-height:1.15;letter-spacing:-.025em}
.lp .upd span:not(.lab){font-size:.95rem;color:var(--muted);line-height:1.5}
.lp .upd .lab{color:var(--gold)}
.lp .timeline{margin-top:12px;border:1px solid var(--gold-line);border-radius:18px;padding:18px 20px;background:linear-gradient(180deg,rgba(233,196,106,.08),rgba(233,196,106,.02));display:grid;gap:12px}
.lp .tl{display:grid;grid-template-columns:14px minmax(0,1fr);gap:12px;align-items:start;font-size:.94rem}
.lp .tl::before{content:"";width:10px;height:10px;border-radius:50%;background:var(--gold);margin-top:.45em;box-shadow:0 0 0 4px var(--gold-soft)}
.lp .tl.next::before{background:transparent;border:1.5px dashed var(--gold)}
.lp .tl b{color:var(--text);font-weight:650}
.lp .tl span{color:var(--muted)}

/* VS */
.lp .vs2{display:grid;gap:12px;max-width:44rem;margin:0 auto}
.lp .vs2>div{border:1px solid var(--line);border-radius:18px;background:var(--card);padding:20px}
.lp .vs2 h3{font-size:1.2rem;letter-spacing:-.02em;margin:6px 0 12px;font-weight:700}
.lp .vs2 ul{list-style:none;display:grid;gap:9px;color:var(--muted);font-size:.96rem}
.lp .vs2 li{display:flex;gap:10px;align-items:flex-start}
.lp .vs2 li::before{content:"";flex:none;width:6px;height:6px;border-radius:50%;background:var(--dim);margin-top:.55em}
.lp .vs2 .gold{border-color:var(--gold-line);background:linear-gradient(180deg,rgba(233,196,106,.1),rgba(233,196,106,.02))}
.lp .vs2 .gold .lab{color:var(--gold)}
.lp .vs2 .gold ul{color:var(--text)}
.lp .vs2 .gold li::before{background:var(--gold)}

/* For who */
.lp .who{display:grid;grid-template-columns:1fr 1fr;gap:8px}
.lp .who li{list-style:none;border:1px solid var(--line);border-radius:14px;background:var(--card);padding:14px;display:grid;gap:4px}
.lp .who em{font-style:normal;font-size:1.3rem}
.lp .who b{font-weight:650;font-size:.98rem;letter-spacing:-.01em;line-height:1.2}
.lp .who span{color:var(--muted);font-size:.84rem;line-height:1.35}

/* Offer */
.lp .offer{max-width:44rem;margin:0 auto;border:1px solid var(--gold-line);border-radius:24px;overflow:hidden;background:var(--card);box-shadow:0 50px 140px -70px rgba(233,196,106,.5);position:relative}
.lp .of-list{padding:24px 20px 10px}
.lp .of-list h3{font-size:1.4rem;letter-spacing:-.025em;margin-top:6px;font-weight:700}
.lp .of-list ul{list-style:none;margin-top:10px}
.lp .of-list li{display:grid;grid-template-columns:auto minmax(0,1fr) auto;gap:12px;align-items:start;padding:13px 0;border-top:1px solid var(--line)}
.lp .of-list li:first-child{border-top:0}
.lp .of-list .tick{margin-top:3px}
.lp .of-list b{display:block;font-weight:650;line-height:1.3}
.lp .of-list span:not(.tick){display:block;margin-top:2px;font-size:.88rem;color:var(--muted);line-height:1.4}
.lp .of-list em{font-style:normal;font-family:var(--mono);font-size:.62rem;letter-spacing:.12em;color:var(--gold);white-space:nowrap;margin-top:4px}
.lp .of-pay{padding:26px 20px;background:linear-gradient(180deg,rgba(233,196,106,.13),rgba(233,196,106,.03));border-top:1px solid var(--gold-line);display:flex;flex-direction:column;align-items:center;gap:14px;text-align:center}
.lp .of-big{display:flex;align-items:baseline;justify-content:center;gap:6px}
.lp .of-big small{font-size:1.3rem;color:var(--muted);font-weight:600}
.lp .of-big b{font-size:clamp(2.8rem,10vw,3.4rem);line-height:1;font-weight:700;letter-spacing:-.05em}
.lp .of-pay p{color:var(--muted);font-size:.92rem;max-width:26rem}
.lp .of-pay .btn{max-width:420px}
.lp .trust{display:flex;flex-wrap:wrap;justify-content:center;gap:8px 18px;font-size:.82rem;color:var(--muted)}
.lp .trust>span{display:flex;align-items:center;gap:7px}

/* FAQ */
.lp .faq{max-width:44rem;margin:0 auto;border-top:1px solid var(--line)}
.lp .faq details{border-bottom:1px solid var(--line)}
.lp .faq summary{list-style:none;cursor:pointer;display:flex;justify-content:space-between;align-items:center;gap:16px;padding:18px 0;font-weight:650;font-size:1.02rem;letter-spacing:-.01em}
.lp .faq summary::-webkit-details-marker{display:none}
.lp .faq summary::after{content:"";flex:none;width:9px;height:9px;border:solid var(--gold);border-width:0 2px 2px 0;transform:rotate(45deg);transition:transform .25s;margin-top:-4px}
.lp .faq details[open] summary::after{transform:rotate(-135deg);margin-top:4px}
.lp .faq details p{color:var(--muted);padding:0 0 18px;font-size:.96rem;max-width:40rem}

/* Final */
.lp .final{text-align:center;padding:64px 0 72px}
.lp .final h2{max-width:20ch;margin:10px auto 14px}
.lp .final p:not(.kick){color:var(--muted);max-width:32rem;margin:0 auto 22px}
.lp .final .btn{max-width:420px;margin:0 auto}
.lp footer{border-top:1px solid var(--line);padding:26px 0 100px;color:var(--dim);font-size:.82rem}
.lp footer .wrap{display:flex;flex-wrap:wrap;gap:10px 20px;justify-content:space-between;align-items:center}
.lp footer a{text-decoration:none;color:var(--muted)}
.lp footer nav{display:flex;gap:16px}

/* Sticky mobile CTA */
.lp .sticky{position:fixed;left:0;right:0;bottom:0;z-index:30;padding:10px 16px calc(10px + env(safe-area-inset-bottom));background:rgba(11,9,8,.92);-webkit-backdrop-filter:blur(14px);backdrop-filter:blur(14px);border-top:1px solid var(--gold-line);display:flex;align-items:center;gap:12px;transform:translateY(110%);transition:transform .35s cubic-bezier(.2,.8,.2,1)}
.lp .sticky.show{transform:none}
.lp .sticky .p{display:grid;line-height:1.1;flex:none}
.lp .sticky .p b{font-size:1.35rem;letter-spacing:-.03em}
.lp .sticky .p span{font-family:var(--mono);font-size:.56rem;letter-spacing:.12em;text-transform:uppercase;color:var(--gold)}
.lp .sticky .btn{padding:13px 14px;font-size:.96rem}

.lp [data-rv]{opacity:0;transform:translateY(22px);transition:opacity .7s ease,transform .7s cubic-bezier(.2,.7,.2,1)}
.lp [data-rv].in{opacity:1;transform:none}

@keyframes lp-pulse{50%{opacity:.35}}
@keyframes lp-sheen{0%,60%{transform:translateX(-130%)}100%{transform:translateX(130%)}}
@keyframes lp-fadeup{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:none}}

/* Ajustes móvil */
.lp .cta-s .cta-p{display:none}
@media(min-width:400px){.lp .cta-s .cta-p{display:inline}}
@media(max-width:600px){.lp .bar .b3,.lp .bar .i2{display:none}}
@media(max-width:359px){.lp .btn{font-size:.92rem}.lp .nav .cta-s{padding:8px 10px}.lp .logo{width:24px;height:24px}}
@media(max-width:479px){
  .lp .bar .wrap{font-size:.56rem;letter-spacing:.08em;gap:7px}
  .lp .brand{font-size:.95rem}
  .lp .nav .cta-s{font-size:.8rem;padding:8px 12px}
  .lp .wrap{padding:0 16px}
  .lp .buybox{padding:16px}
  .lp .btn{font-size:.98rem;padding:15px 16px}
  .lp .pb-h{font-size:.84rem;padding-left:12px}
  .lp .pb-b{padding:16px 14px 8px;font-size:.88rem}
  .lp .of-list li{grid-template-columns:auto minmax(0,1fr)}
  .lp .of-list em{display:none}
  .lp .who span{font-size:.8rem}
  .lp .cats li{grid-template-columns:40px minmax(0,1fr);gap:12px;padding:12px}
  .lp .cats i{width:40px;height:40px;font-size:1.15rem}
  .lp .chips-all a{font-size:.8rem;padding:7px 11px}
  .lp .faq summary{font-size:.96rem}
}
@media(min-width:560px){
  .lp .nos{display:flex;flex-wrap:wrap;gap:8px 22px}
  .lp .stats{grid-template-columns:repeat(4,1fr)}
  .lp .who{grid-template-columns:repeat(3,1fr)}
  .lp .upd{grid-template-columns:1fr 1fr}
}
@media(min-width:720px){.lp .cats{grid-template-columns:1fr 1fr}}
@media(min-width:900px){
  .lp .nav-links{display:flex}
  .lp .hero{padding:68px 0 56px}
  .lp .hero .wrap{grid-template-columns:1.15fr .85fr;grid-template-areas:'t o' 'n o';align-items:center;gap:22px 56px}
  .lp .hero .wrap>div:first-child{grid-area:t;align-self:end}
  .lp #offer-top{grid-area:o}
  .lp .hero .nos{grid-area:n;align-self:start}
  .lp .split{display:grid;grid-template-columns:.9fr 1.1fr;gap:56px;align-items:start}
  .lp .split .sec-h{margin:0;position:sticky;top:100px}
  .lp .vs2{grid-template-columns:1fr 1fr}
  .lp .steps{grid-template-columns:repeat(3,1fr)}
  .lp .step{grid-template-columns:1fr;gap:16px}
  .lp .sticky{display:none}
  .lp footer{padding-bottom:26px}
}
@media(prefers-reduced-motion:reduce){.lp *{animation:none!important;transition:none!important}.lp [data-rv]{opacity:1;transform:none}}
`;

/* ─── Datos ─── */
const CHIPS = [
  '📈 Marketing & Ventas', '📱 Redes sociales', '💸 Ganar dinero', '✍️ Copywriting', '🎥 Creación de contenido',
  '🎬 YouTube sin rostro', '🖼️ Creación de imágenes', '🔍 SEO', '🎯 Conseguir empleo', '⚡ Productividad',
  '💻 Vibe Coding', '🍎 Docentes', '🎨 Creatividad', '💰 Finanzas personales', '🥗 Bajar de peso',
  '💪 Fitness', '🧠 Crecimiento personal', '📚 Inglés', '🇫🇷 Francés', '✨ Astrología',
];

const GROUPS: { lab: string; title: string; items: [string, string, string][] }[] = [
  {
    lab: 'Bloque 1', title: 'Negocio, ventas y contenido', items: [
      ['📈', 'Marketing & Ventas', 'Embudos · Generador de leads · Script de cierre · Propuesta de valor'],
      ['📱', 'Marketing para redes sociales', 'Ideas de contenido · Estrategia integral · Textos atrapantes · Respuesta a comentarios'],
      ['💸', 'Ganar dinero', 'Qué vender con lo que ya sabes · Primeros 5 clientes · Ingresos extra · Tu primer producto digital'],
      ['✍️', 'Copywriting & Contenido', 'Hooks que venden · Historias que venden · Emails que convierten · Guiones para reels'],
      ['🎥', 'Creación de contenido', 'Ideas virales · Banco de contenido perpetuo · Sistema para YouTube · Shorts de alto impacto'],
      ['🎬', 'Canal de YouTube sin rostro', 'De cero a monetizar · Nicho perfecto · Vídeos con IA y voz sintética · Guiones virales'],
      ['🖼️', 'Creación de imágenes', 'Prompts para Midjourney, ChatGPT y Gemini · Fotos de producto · Logos · Miniaturas · Imágenes para redes'],
      ['🔍', 'SEO y contenido', 'Palabras clave · Auditoría on-page · Artículo SEO desde cero · Link building realista'],
    ],
  },
  {
    lab: 'Bloque 2', title: 'Trabajo, carrera y productividad', items: [
      ['🎯', 'Conseguir empleo', 'CV de alto impacto · CV para ATS · LinkedIn imán · Entrevista STAR · Negociar salario'],
      ['⚡', 'Productividad', 'Planificación semanal · Vencer la procrastinación · Auditoría de reuniones · Metas trimestrales'],
      ['💻', 'Vibe Coding', 'De idea a brief · Debuggear sin saber código · Landing de SaaS · Deploy sin meter la pata'],
      ['🍎', 'Docentes', 'Unidad didáctica · Exámenes y rúbricas · Explicar temas difíciles · Reuniones con familias'],
      ['🎨', 'Creatividad', '30 ángulos sobre cualquier tema · Rompe tu bloqueo · Método SCAMPER · Naming'],
    ],
  },
  {
    lab: 'Bloque 3', title: 'Dinero, salud, idiomas y vida', items: [
      ['💰', 'Finanzas personales', 'Auditoría financiera · Salir de deudas · Ahorro automático · Inversión para principiantes'],
      ['🥗', 'Bajar de peso de forma saludable', 'Plan nutricional personalizado · Hábitos sin dietas extremas · Transformación holística'],
      ['💪', 'Fitness', 'Hipertrofia · Del sofá a 5K · Entrena en casa · Rutinas de 20 minutos'],
      ['🧠', 'Prompts honestos (crecimiento personal)', 'Destruye mis excusas · Diagnóstico sin anestesia · Dime la verdad que todos suavizan'],
      ['📚', 'Aprender inglés', 'Plan de 4 semanas · Vocabulario en contexto · Conversación con feedback · Phrasal verbs'],
      ['🇫🇷', 'Aprender francés', 'Programa intensivo · Conversación y fluidez · Pronunciación · Preparación DELF/DALF'],
      ['✨', 'Astrología', 'Carta natal · Planifica tu mes · Mapa del amor · Compatibilidad de pareja'],
    ],
  },
];

const FAQ: [string, string][] = [
  ['¿Qué recibo exactamente?', 'Un enlace a un banco de prompts en Notion con más de 500 prompts organizados en 20 categorías, una guía de uso y tips. Lo abres desde el navegador o la app de Notion, y puedes duplicarlo a tu propia cuenta.'],
  ['¿Qué significa que es "actualizable"?', 'Que el banco sigue creciendo. Cuando se añaden prompts o categorías nuevas, aparecen en el mismo enlace que ya tienes. No pagas nada más.'],
  ['¿Necesito saber de IA o de prompts?', 'No. Copias el prompt, rellenas lo que está entre corchetes con tu información y lo pegas en la IA. Eso es todo.'],
  ['¿Con qué IA funciona?', 'Con ChatGPT, Claude, Gemini y cualquier otro modelo de chat. Funcionan en las versiones gratuitas, aunque los modelos de pago suelen dar respuestas más completas.'],
  ['¿Necesito pagar Notion?', 'No. Puedes ver y copiar los prompts sin cuenta, o con una cuenta gratuita de Notion si quieres duplicarlo.'],
  ['¿Es un pago único o una suscripción?', `Pago único de ${PRICE} USD. Sin cuotas mensuales y con actualizaciones incluidas.`],
  ['¿Cómo y cuándo lo recibo?', 'Al instante. Después del pago recibes el enlace de acceso en tu email.'],
  ['¿Los prompts están en español?', 'Sí, todos están escritos en español. Los de idiomas (inglés y francés) están pensados para hispanohablantes que quieren aprender.'],
];

const Br: React.FC = () => <span className="br">[INSERTAR]</span>;

const SAMPLES: { id: string; tab: string; title: string; body: React.ReactNode }[] = [
  {
    id: 'sm1', tab: '💸 Ganar dinero', title: '💸 Consigue tus primeros 5 clientes sin audiencia ni publicidad',
    body: (
      <>
        <p>Adopta el rol de un consultor de captación para negocios que empiezan de cero, formado en prospección directa, activación de red de contactos y ofertas de entrada, que ha llevado a decenas de freelancers de cero a cartera llena sin gastar en anuncios. Tu misión es conseguirme mis primeros clientes. El problema es grave: casi todo el mundo empieza montando una web, un logo y un perfil impecable, se pasa dos meses en eso y no habla con una sola persona que pudiera pagarle. Los primeros clientes no llegan por difusión, llegan por conversaciones concretas con gente concreta. Respira hondo y trabaja en este problema paso a paso.</p>
        <p>Ejecuta estas 5 acciones: 1) Ayúdame a hacer una lista de 30 contactos posibles a partir de mi entorno real: antiguos compañeros, clientes de mi empleo, negocios de mi zona, grupos donde participo y personas que ya me conocen. 2) Clasifícalos por cercanía y probabilidad, y dime a quién escribir primero. 3) Escribe el mensaje de contacto para cada tipo de persona, breve y sin sonar a plantilla, centrado en lo que puedo resolverles y no en que acabo de empezar. 4) Diséñame una oferta de entrada con alcance pequeño y precio accesible que facilite el primer sí, sin regalar el trabajo. 5) Dame el guion de la conversación cuando alguien muestre interés: qué preguntar, cómo presentar el precio y cómo cerrar el acuerdo, más un sistema simple para no perder el seguimiento.</p>
        <h4>#Información sobre mí</h4>
        <ul>
          <li>Qué servicio ofrezco: <Br /></li>
          <li>A quién le sirve: <Br /></li>
          <li>Mi red de contactos y sector de origen: <Br /></li>
          <li>Trabajos previos que puedo mostrar: <Br /></li>
          <li>Tiempo semanal para buscar clientes: <Br /></li>
        </ul>
        <p>¡LO MÁS IMPORTANTE!: Estructura tu respuesta con las secciones A, B, C, D y E. Al final, dame el "reto de las 48 horas": la primera acción concreta que debo completar en los próximos dos días para validar que el plan funciona.</p>
      </>
    ),
  },
  {
    id: 'sm2', tab: '🎬 YouTube sin rostro', title: '🎬 Mapa completo para lanzar un canal sin rostro, de cero a monetizar',
    body: (
      <>
        <h4>CONTEXT:</h4>
        <p>Adopta el rol de un consultor de YouTube con experiencia lanzando y escalando canales sin mostrar el rostro, desde cero hasta superar las 4.000 horas y 1.000 suscriptores para monetizar.</p>
        <h4>INSTRUCCIONES:</h4>
        <p>Desarrolla un roadmap detallado dividido en 4 fases:</p>
        <ol>
          <li><b>Preparación del canal:</b> nicho con datos (CPM, búsquedas, competencia), propuesta de valor única, nombre e identidad visual.</li>
          <li><b>Primeros 30 videos:</b> estrategia de temas, títulos, hooks, duración ideal, y cómo enseñar al algoritmo tu público objetivo.</li>
          <li><b>Aceleración de visualizaciones:</b> estrategias para retención alta (cliffhangers, loops narrativos), optimización de CTR, y fomento de comentarios y shares.</li>
          <li><b>Monetización y escalado:</b> playlists, contenido evergreen, productos digitales o patrocinios, y cuándo reinvertir en outsourcing.</li>
        </ol>
        <h4>OUTPUT FORMAT:</h4>
        <p>Documento profesional con secciones numeradas, bullets y tablas. Termina con checklist ejecutiva para aplicar todo paso a paso.</p>
      </>
    ),
  },
];

/* ─── Piezas ─── */
const Buy: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className = 'btn' }) => (
  <a className={className} href={BUY_URL} rel="noopener">{children}</a>
);

const Arr = () => <span className="arr" />;
const Tick = () => <span className="tick" />;

const SamplePanel: React.FC<{ title: string; body: React.ReactNode }> = ({ title, body }) => {
  const bodyRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    const text = (bodyRef.current?.innerText ?? '').replace(/\n{3,}/g, '\n\n').trim();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      try { document.execCommand('copy'); } catch { /* sin portapapeles */ }
      ta.remove();
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  };

  return (
    <div className="pbox spanel" role="tabpanel">
      <div className="pb-h">
        <span className="t">{title}</span>
        <button className={`copy${copied ? ' ok' : ''}`} type="button" onClick={copy}>
          {copied ? '✓ Copiado' : 'Copiar prompt'}
        </button>
      </div>
      <div ref={bodyRef} className={`pb-b${open ? ' open' : ''}`}>{body}</div>
      <div className="pb-f">
        <button className="more" type="button" onClick={() => setOpen(o => !o)}>
          {open ? 'Ver menos' : 'Ver prompt completo'}
        </button>
      </div>
    </div>
  );
};

const BankPrompts: React.FC = () => {
  const rootRef = useRef<HTMLDivElement>(null);
  const heroBoxRef = useRef<HTMLElement>(null);
  const buySecRef = useRef<HTMLElement>(null);
  const [sample, setSample] = useState(SAMPLES[0].id);
  const [showSticky, setShowSticky] = useState(false);

  useEffect(() => {
    document.title = 'Alpacka Prompts — Banco de +500 prompts actualizable';
    return () => { document.title = DEFAULT_TITLE; };
  }, []);

  /* Animación de entrada */
  useEffect(() => {
    const els = rootRef.current?.querySelectorAll<HTMLElement>('[data-rv]') ?? [];
    if (!('IntersectionObserver' in window)) {
      els.forEach(el => el.classList.add('in'));
      return;
    }
    const io = new IntersectionObserver(es => {
      es.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12 });
    els.forEach(el => io.observe(el));
    return () => io.disconnect();
  }, []);

  /* CTA fijo en móvil: aparece tras el hero, se oculta en la sección de compra */
  useEffect(() => {
    if (!('IntersectionObserver' in window) || !heroBoxRef.current || !buySecRef.current) return;
    let heroOut = false;
    let buyIn = false;
    const upd = () => setShowSticky(heroOut && !buyIn);
    const a = new IntersectionObserver(([e]) => { heroOut = !e.isIntersecting && e.boundingClientRect.top < 0; upd(); });
    const b = new IntersectionObserver(([e]) => { buyIn = e.isIntersecting; upd(); }, { threshold: 0.2 });
    a.observe(heroBoxRef.current);
    b.observe(buySecRef.current);
    return () => { a.disconnect(); b.disconnect(); };
  }, []);

  const current = SAMPLES.find(s => s.id === sample)!;

  return (
    <div className="lp" ref={rootRef}>
      <style>{CSS}</style>

      <div className="bar">
        <div className="wrap">
          <span>Acceso de por vida</span><i /><span>Actualizaciones incluidas</span><i className="i2" /><span className="b3">Un solo pago</span>
        </div>
      </div>

      <header className="nav">
        <div className="wrap">
          <a className="brand" href="#top"><span className="logo">A</span>Alpacka Prompts</a>
          <nav className="nav-links">
            <a href="#como-funciona">Cómo funciona</a>
            <a href="#muestra">Prueba gratis</a>
            <a href="#catalogo">Catálogo</a>
            <a href="#faq">Preguntas</a>
          </nav>
          <Buy className="cta-s">Obtener acceso<span className="cta-p"> · {PRICE}</span></Buy>
        </div>
      </header>

      <main id="top">
        {/* HERO */}
        <section className="hero">
          <div className="wrap">
            <div>
              <p className="eyebrow">Banco de prompts · Actualizable</p>
              <h1>Deja de improvisar con la IA. <em>Copia, pega, resultado.</em></h1>
              <p className="sub">
                <strong>+500 prompts profesionales</strong> en 20 categorías, ya escritos y probados. Rellenas tus datos entre
                corchetes y la IA te devuelve un plan, un texto o una estrategia lista para usar. Sin aprender "prompt engineering".
              </p>
              <div className="works">
                <span className="lab">Funciona con</span>
                {['ChatGPT', 'Claude', 'Gemini', 'Cualquier IA'].map(p => <span key={p} className="pill">{p}</span>)}
              </div>
            </div>

            <aside className="buybox" id="offer-top" ref={heroBoxRef}>
              <span className="bb-tag">Acceso inmediato</span>
              <div className="bb-top">
                <div className="bb-price"><small>$</small><b>14.99</b><small>USD</small></div>
                <div className="bb-save"><b>Pago único</b>Sin suscripción</div>
              </div>
              <ul className="bb-list">
                <li><Tick />+500 prompts en 20 categorías</li>
                <li><Tick />Banco en Notion, copia en un clic</li>
                <li><Tick />Nuevos prompts y categorías gratis, para siempre</li>
              </ul>
              <Buy>Quiero el banco de prompts <Arr /></Buy>
              <p className="bb-note">Lo recibes en tu email al momento.</p>
            </aside>

            <div className="nos">
              {['Sin experiencia previa', 'En español', 'Listo para copiar', 'Se actualiza solo'].map(t => (
                <span key={t}><Tick />{t}</span>
              ))}
            </div>
          </div>
        </section>

        <div className="wrap">
          <ul className="stats" data-rv>
            <li><b>+500</b><span>prompts listos para usar</span></li>
            <li><b>20</b><span>categorías de trabajo, negocio y vida</span></li>
            <li><b>1</b><span>pago único de {PRICE}</span></li>
            <li><b>∞</b><span>actualizaciones sin coste extra</span></li>
          </ul>
          <div className="chips-all" data-rv>
            <span className="lab">Las 20 categorías incluidas</span>
            <div>{CHIPS.map(c => <a key={c} href="#catalogo">{c}</a>)}</div>
          </div>
        </div>

        {/* PROBLEMA */}
        <section className="sec aura">
          <div className="wrap split">
            <div className="sec-h" data-rv>
              <p className="kick">El problema</p>
              <h2>La IA no es el problema. <em>Lo que le pides, sí.</em></h2>
              <p>Si le escribes una frase suelta, te responde algo genérico. La diferencia entre una respuesta mediocre y una útil está en <strong>cómo está escrito el prompt</strong>.</p>
            </div>
            <ul className="pain narrow" data-rv>
              {[
                ['Respuestas genéricas que no sirven', 'Te da una lista de consejos obvios que ya conocías.'],
                ['Pierdes tiempo reescribiendo', 'Diez intentos para conseguir algo que se acerque a lo que querías.'],
                ['Prompts sueltos de internet', 'Copiados de hilos, desordenados, en inglés y sin estructura.'],
                ['No sabes qué pedir', 'Sabes que la IA puede ayudarte, pero no por dónde empezar.'],
              ].map(([b, s]) => (
                <li key={b}><i>×</i><div><b>{b}</b><span>{s}</span></div></li>
              ))}
            </ul>
          </div>
        </section>

        {/* CÓMO FUNCIONA */}
        <section className="sec" id="como-funciona">
          <div className="wrap">
            <div className="sec-h" data-rv>
              <p className="kick">Cómo funciona</p>
              <h2>Tres pasos. <em>Siempre los mismos.</em></h2>
              <p>No tienes que aprender a escribir prompts. Solo eliges, rellenas y pegas.</p>
            </div>
            <div className="steps" data-rv>
              <div className="step"><span className="n">1</span><div><b>Elige lo que quieres conseguir</b><span>Busca en 20 categorías: vender, conseguir empleo, ahorrar, aprender inglés, crear contenido…</span><small>~10 segundos</small></div></div>
              <div className="step"><span className="n">2</span><div><b>Copia y rellena los corchetes</b><span>Cada prompt tiene un bloque "Información sobre mí". Cambias solo lo que va entre <span className="br">[INSERTAR]</span>.</span><small>~1 minuto</small></div></div>
              <div className="step"><span className="n">3</span><div><b>Pega y recibe el resultado</b><span>La IA te devuelve un plan, guion o documento estructurado, listo para usar ese mismo día.</span><small>Al instante</small></div></div>
            </div>
          </div>
        </section>

        {/* MUESTRA */}
        <section className="sec aura" id="muestra">
          <div className="wrap">
            <div className="sec-h" data-rv>
              <p className="kick">Pruébalo gratis</p>
              <h2>Dos de los +500. <em>Úsalos ahora.</em></h2>
              <p>Cópialos, pégalos en ChatGPT o Claude y rellena tus datos. Si te sirven estos, imagina todo lo demás.</p>
            </div>
            <div className="narrow" data-rv>
              <div className="stabs" role="tablist">
                {SAMPLES.map(s => (
                  <button
                    key={s.id} type="button" role="tab"
                    className={s.id === sample ? 'on' : ''}
                    aria-selected={s.id === sample}
                    onClick={() => setSample(s.id)}
                  >
                    {s.tab}
                  </button>
                ))}
              </div>
              <SamplePanel key={current.id} title={current.title} body={current.body} />
              <p className="sample-note">Solo cambias lo que está entre <span className="br" style={{ fontSize: '.75rem' }}>[corchetes]</span>. Todo lo demás ya está pensado.</p>
            </div>
          </div>
        </section>

        {/* ANATOMÍA */}
        <section className="sec">
          <div className="wrap split">
            <div className="sec-h" data-rv>
              <p className="kick">Por qué funcionan</p>
              <h2>No son frases. <em>Son instrucciones completas.</em></h2>
              <p>Cada prompt sigue una estructura profesional que obliga a la IA a pensar como un experto y responder con un formato útil.</p>
            </div>
            <ul className="anat narrow" data-rv>
              {[
                ['01 · CONTEXT', 'Qué necesitas y por qué', 'La IA entiende tu situación antes de responder.'],
                ['02 · ROLE', 'Un experto asignado', 'Copywriter senior, coach, nutricionista, reclutador… según la tarea.'],
                ['03 · RESPONSE GUIDELINES', 'Los pasos exactos a seguir', 'Nada de respuestas vagas: le dices qué analizar y en qué orden.'],
                ['04 · CRITERIA', 'Estándares de calidad', 'Reglas para que el resultado sea claro, accionable y sin relleno.'],
                ['05 · INFORMACIÓN SOBRE MÍ', 'Tu caso, en corchetes', 'El único lugar donde escribes. Personaliza todo el resultado.'],
              ].map(([c, b, s]) => (
                <li key={c}><code>{c}</code><b>{b}</b><span>{s}</span></li>
              ))}
            </ul>
          </div>
        </section>

        {/* CATÁLOGO */}
        <section className="sec aura" id="catalogo">
          <div className="wrap">
            <div className="sec-h" data-rv>
              <p className="kick">Qué hay dentro</p>
              <h2>+500 prompts en <em>20 categorías.</em></h2>
              <p>Esto es todo lo que vas a encontrar. Cada categoría trae prompts para conseguir algo concreto que puedes usar el mismo día.</p>
            </div>

            {GROUPS.map(g => (
              <div className="grp" data-rv key={g.lab}>
                <div className="grp-h"><span className="lab">{g.lab}</span><h3>{g.title}</h3></div>
                <ul className="cats">
                  {g.items.map(([e, b, s]) => (
                    <li key={b}><i>{e}</i><div><b>{b}</b><span>{s}</span></div></li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="cat-cta" data-rv>
              <p>Y se siguen añadiendo categorías nuevas, <b>gratis</b> para quien ya compró.</p>
              <Buy>Quiero las 20 categorías · {PRICE} <Arr /></Buy>
            </div>
          </div>
        </section>

        {/* ACTUALIZABLE */}
        <section className="sec">
          <div className="wrap">
            <div className="sec-h" data-rv>
              <p className="kick">Actualizable</p>
              <h2>Lo compras una vez. <em>Sigue creciendo.</em></h2>
              <p>No es un PDF que se queda viejo. Es un banco vivo en Notion: cuando se añaden prompts o categorías nuevas, <strong>aparecen en tu mismo enlace</strong> sin pagar nada más.</p>
            </div>
            <div className="narrow" data-rv>
              <div className="upd">
                <div><span className="lab">Formato</span><b>Banco en Notion</b><span>Ábrelo desde el ordenador o el móvil. Busca, copia y pega. También puedes duplicarlo a tu propio Notion.</span></div>
                <div><span className="lab">Actualizaciones</span><b>Nuevos prompts, gratis</b><span>Nuevas categorías, mejoras y prompts adaptados a las nuevas herramientas de IA. Todo incluido en tu pago.</span></div>
              </div>
              <div className="timeline">
                <div className="tl"><div><b>Hoy:</b> <span>+500 prompts en 20 categorías.</span></div></div>
                <div className="tl"><div><b>Últimas incorporaciones:</b> <span>Vibe Coding, Docentes, SEO, Productividad, Francés, Creatividad.</span></div></div>
                <div className="tl next"><div><b>Próximamente:</b> <span>más categorías y prompts nuevos. Te llegan sin hacer nada.</span></div></div>
              </div>
            </div>
          </div>
        </section>

        {/* VS */}
        <section className="sec aura">
          <div className="wrap">
            <div className="sec-h" data-rv>
              <p className="kick">La diferencia</p>
              <h2>Prompts sueltos vs. <em>un banco de verdad.</em></h2>
            </div>
            <div className="vs2" data-rv>
              <div>
                <span className="lab">Prompts gratis de internet</span>
                <h3>Una frase y suerte</h3>
                <ul>
                  {['Una línea sin contexto ni estructura', 'Respuestas genéricas que hay que rehacer', 'Dispersos en hilos, capturas y notas', 'Casi siempre en inglés', 'Nadie los mejora ni los actualiza'].map(t => <li key={t}>{t}</li>)}
                </ul>
              </div>
              <div className="gold">
                <span className="lab">Alpacka Prompts</span>
                <h3>Instrucciones completas</h3>
                <ul>
                  {['Rol, contexto, pasos y criterios de calidad', 'Resultados estructurados y accionables', 'Todo en un solo sitio, por categorías', 'Escritos en español, para tu caso', 'Se actualizan para siempre'].map(t => <li key={t}>{t}</li>)}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* PARA QUIÉN */}
        <section className="sec">
          <div className="wrap">
            <div className="sec-h" data-rv>
              <p className="kick">Para quién es</p>
              <h2>Si usas IA, <em>hay un bloque para ti.</em></h2>
            </div>
            <ul className="who narrow" data-rv>
              {[
                ['🚀', 'Emprendedores', 'Embudos, ofertas, primeros clientes y ventas.'],
                ['📱', 'Creadores de contenido', 'Ideas, guiones, hooks y estrategia de redes.'],
                ['💼', 'Quien busca empleo', 'CV, LinkedIn, entrevistas y negociación.'],
                ['🍎', 'Docentes', 'Clases, exámenes, rúbricas y gestión del aula.'],
                ['💻', 'Builders con IA', 'Vibe coding, SEO y productividad.'],
                ['🌱', 'Tu vida personal', 'Finanzas, salud, idiomas y hábitos.'],
              ].map(([e, b, s]) => (
                <li key={b}><em>{e}</em><b>{b}</b><span>{s}</span></li>
              ))}
            </ul>
          </div>
        </section>

        {/* OFERTA */}
        <section className="sec aura" id="comprar" ref={buySecRef}>
          <div className="wrap">
            <div className="sec-h center" data-rv>
              <p className="kick">Tu acceso</p>
              <h2>Todo esto por <em>menos de lo que cuesta un almuerzo.</em></h2>
            </div>
            <div className="offer" data-rv>
              <div className="of-list">
                <span className="lab">Incluye</span>
                <h3>Alpacka Prompts · Banco completo</h3>
                <ul>
                  {[
                    ['+500 prompts profesionales', 'Con rol, contexto, pasos y criterios. Listos para copiar.', '20 CAT.'],
                    ['Banco en Notion', 'Ordenado por categorías, con índice y búsqueda.', 'WEB + MÓVIL'],
                    ['Guía de uso y tips', 'Cómo sacar más de cada prompt y combinarlos entre sí.', 'INCLUIDO'],
                    ['Actualizaciones de por vida', 'Prompts y categorías nuevas en tu mismo enlace.', 'GRATIS'],
                    ['Funciona con cualquier IA', 'ChatGPT, Claude, Gemini y otras.', 'TODAS'],
                  ].map(([b, s, e]) => (
                    <li key={b}><Tick /><div><b>{b}</b><span>{s}</span></div><em>{e}</em></li>
                  ))}
                </ul>
              </div>
              <div className="of-pay">
                <span className="bb-tag">Pago único · Acceso inmediato</span>
                <div className="of-big"><small>$</small><b>14.99</b><small>USD</small></div>
                <p>Sin suscripción ni pagos mensuales. Pagas una vez y es tuyo, con todas las actualizaciones futuras.</p>
                <Buy>Obtener acceso ahora <Arr /></Buy>
                <div className="trust">
                  <span><Tick />Pago seguro</span>
                  <span><Tick />Entrega al instante por email</span>
                  <span><Tick />Actualizaciones incluidas</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="sec" id="faq">
          <div className="wrap">
            <div className="sec-h" data-rv>
              <p className="kick">Preguntas frecuentes</p>
              <h2>Antes de comprar.</h2>
            </div>
            <div className="faq" data-rv>
              {FAQ.map(([q, a]) => (
                <details key={q}><summary>{q}</summary><p>{a}</p></details>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL */}
        <section className="sec aura final">
          <div className="wrap" data-rv>
            <p className="kick">Empieza hoy</p>
            <h2>La próxima vez que abras la IA, <em>sabrás exactamente qué pedirle.</em></h2>
            <p>+500 prompts, 20 categorías y actualizaciones para siempre. Un solo pago de {PRICE}.</p>
            <Buy>Quiero mi acceso · {PRICE} <Arr /></Buy>
          </div>
        </section>
      </main>

      <footer>
        <div className="wrap">
          <span>© {new Date().getFullYear()} Alpacka · <a href="/">alpackaai.xyz</a></span>
          <nav>
            <a href="/terms">Términos</a>
            <a href="/privacy">Privacidad</a>
          </nav>
          <span>Los resultados dependen de la información que aportes y del modelo de IA que uses.</span>
        </div>
      </footer>

      <div className={`sticky${showSticky ? ' show' : ''}`}>
        <div className="p"><b>{PRICE}</b><span>Pago único</span></div>
        <Buy>Obtener acceso <Arr /></Buy>
      </div>
    </div>
  );
};

export default BankPrompts;
