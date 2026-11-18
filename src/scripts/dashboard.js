
'use strict';
const DB=JSON.parse(document.getElementById('dataset').textContent);
const T={Oferta:{name:'Oferta',letter:'O',sheet:'1888932316'},Búsquedas:{name:'Búsquedas',letter:'B',sheet:'1063996026'},Demanda:{name:'Demanda',letter:'D',sheet:'1317036553'},Decisión:{name:'Decisión',letter:'C',sheet:'256195666'}};
const data=Object.fromEntries(Object.entries(DB).map(([k,v])=>[k,v.rows.map((r,i)=>({raw:r,index:i+2,id:String(r[0]||''),tab:k}))]));
const rows=Object.values(data).flat(),byId=new Map(rows.map(x=>[x.id,x]));
const labels={inicio:'Inicio',oferta:'Oferta',demanda:'Demanda',conceptos:'Conclusiones Cruzadas',metodo:'Métodos y Fuentes',precios:'Benchmarks y precios',busquedas:'Bitácora de búsquedas'};
const state={view:'inicio',offerQuery:'',offerProvider:'Todos',offerType:'Todos',offerMoney:'Todos',offerPage:0,searchQuery:'',searchTool:'Todos',searchPage:0,demandQuery:'',demandFamily:'Todos',demandType:'Todos'};
const sourceSheet='https://docs.google.com/spreadsheets/d/1D_LGqoXsAqLhToFWXBzXUhPds3R9K3OpSD-SPlz0Qqw/edit';
const clp=(n)=>new Intl.NumberFormat('es-CL',{maximumFractionDigits:0}).format(+n||0);
const esc=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const norm=(s)=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
const slug=(s)=>String(s||'').trim();
const safeUrl=(u)=>{try{const v=new URL(String(u||''));return ['https:','http:'].includes(v.protocol)?v.href:null}catch{return null}};
function openLink(u,text='Ver fuente ↗'){let url=safeUrl(u);return url?`<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(text)}</a>`:''}
function anchorRecord(id){let r=byId.get(id);return r?`<button class="linked" data-open="${esc(id)}">${esc(id)}</button>`:`<span class="tag gray">${esc(id)}</span>`}
function extractIds(v){return [...new Set((String(v||'').match(/\b[OBDC]\d{3}\b/g)||[]))]}
function sourceA(x){let tab=T[x.tab];let row=x.index;return sourceSheet+'#gid='+tab.sheet+'&range=A'+row+':'+String.fromCharCode(64+DB[x.tab].headers.length)+row}
function tline(v,n=110){let z=String(v||'');return z.length>n?z.slice(0,n-1)+'…':z}
function notice(msg){let e=document.getElementById('toast');e.textContent=msg;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2600)}
function metric(v,name,hint,icon){return `<div class="metric"><div class="meta"><span>${esc(name)}</span><span class="symbol">${icon}</span></div><div class="value">${esc(v)}</div><div class="hint">${esc(hint)}</div></div>`}
function hbar(v,max,color=''){return `<div class="barbg"><i style="width:${Math.max(1,Math.min(100,v/max*100))}%;${color?'background:'+color+';':''}"></i></div>`}
function score(x){const m=String(x.raw[15]||'').match(/ref\.\s*(\d),([0-9]{2})/);return m?+(`${m[1]}.${m[2]}`):null}
function tag(status,text){return `<span class="tag ${status}">${esc(text)}</span>`}
function head(title,subtitle,eyebrow='Investigación de cursos'){const refining=['Conclusiones Cruzadas','Señales públicas de demanda','Demanda · Necesidades y actividades observadas','Método, cobertura y trazabilidad'].includes(title);return `<div class="page-intro"><div class="eyebrow">${esc(eyebrow)}</div><h1 class="title">${esc(title)}${refining?'<span class="ux-refining ux-refining-heading">(Afinando detalles)</span>':''}</h1><p class="subtitle">${subtitle}</p></div>`}
function section(title,sub=''){return `<div class="section-head"><div><h2 class="section-title">${esc(title)}</h2>${sub?`<div class="section-desc">${sub}</div>`:''}</div></div>`}
const weights=[['Demanda observable',.30,10],['Diferenciación',.25,11],['Precio y comprador',.20,12],['Ajuste asincrónico',.15,13],['Encaje y factibilidad',.10,14]];
const orderedConcepts=[...data.Decisión].sort((a,b)=>score(b)-score(a));
function renderOverview(){return `<section class="welcome-shell" aria-labelledby="welcome-title">
 <div class="welcome-content">
  <img class="sdc-welcome-logo" src="{{SDC_LOGO_PORTADA}}" width="430" height="127" alt="Simón de Cirene · 30 años · Sin afecto no hay efectos">
  <div class="welcome-eyebrow">Simón de Cirene · Estudio de mercado 2026</div>
  <h1 class="welcome-title" id="welcome-title">Investigación sobre <span>Cursos Asincrónicos</span></h1>
  <p class="welcome-description">Una investigación para entender qué formación existe, qué señales de interés encontramos y qué oportunidades conviene evaluar.</p>
  <p class="welcome-prompt" id="welcome-prompt">Elige por dónde empezar</p>
  <nav class="welcome-options" aria-labelledby="welcome-prompt">
   <button class="welcome-option" type="button" data-view="oferta"><span class="welcome-symbol" aria-hidden="true">▦</span><strong>Oferta</strong><small>Cursos existentes, temas, públicos y precios.</small><span class="welcome-arrow" aria-hidden="true">↗</span></button>
   <button class="welcome-option" type="button" data-view="demanda"><span class="welcome-symbol" aria-hidden="true">◇</span><strong>Demanda</strong><span class="ux-refining ux-refining-card">(Afinando detalles)</span><small>Señales públicas de interés y necesidades.</small><span class="welcome-arrow" aria-hidden="true">↗</span></button>
   <button class="welcome-option" type="button" data-view="conceptos"><span class="welcome-symbol" aria-hidden="true">◉</span><strong>Conclusiones Cruzadas</strong><span class="ux-refining ux-refining-card">(Afinando detalles)</span><small>Qué sugieren los hallazgos al analizarlos juntos.</small><span class="welcome-arrow" aria-hidden="true">↗</span></button>
   <button class="welcome-option" type="button" data-view="metodo"><span class="welcome-symbol" aria-hidden="true">▤</span><strong>Métodos y Fuentes</strong><span class="ux-refining ux-refining-card">(Afinando detalles)</span><small>Cómo se investigó y dónde revisar la evidencia.</small><span class="welcome-arrow" aria-hidden="true">↗</span></button>
  </nav>
  <div class="welcome-bottom"><span>Investigación documentada · Corte 16 de noviembre de 2026</span></div>
 </div>
</section>`;}
function conceptCard(x){const n=score(x),primary=x.id==='C003',backup=x.id==='C002';return `<article class="concept-card ${primary?'primary':''}"><div class="head"><div><div class="codex">${primary?'PRIMERA ALTERNATIVA':backup?'ALTERNATIVA DE RESPALDO':'ALTERNATIVA EVALUADA'}</div><h3>${esc(x.raw[1])}</h3></div><div class="score">${n.toFixed(2).replace('.',',')}<small>/5</small></div></div><p>${esc(x.raw[4])}</p><div class="chips">${tag(primary?'teal':backup?'blue':'gray',primary?'Primero para pilotear':backup?'Segunda opción':'Alternativa evaluada')}${tag('gray',x.raw[16].startsWith('Media')?'Confianza media':'Confianza baja')}</div><div class="footer"><span class="xs muted">${esc(tline(x.raw[15],31))}</span><button class="btn btn-outline btn-small" data-open="${x.id}">Ficha completa ↗</button></div></article>`}
function renderConcepts(){let cards=orderedConcepts.map(conceptCard).join('');let matrix=orderedConcepts.map(x=>`<tr><td><button class="id-link" data-open="${x.id}">${x.id}</button></td><td class="col-title"><button class="record-open" data-open="${x.id}">${esc(x.raw[1])}</button></td>${[10,11,12,13,14].map(i=>`<td>${esc(x.raw[i])}</td>`).join('')}<td><b>${score(x).toFixed(2).replace('.',',')}</b></td></tr>`).join('');let weighted=weights.map(([name,w,ix])=>`<div class="weight">${esc(name)} · ${Math.round(w*100)}%</div>`).join('');return `${head('Conclusiones Cruzadas','Una lectura conjunta de oferta, señales de demanda y decisiones. La priorización es condicional y no predice ventas.','Oferta × Demanda × Decisión')}
 <div class="cross-intro"><h2 class="section-title">Lectura cruzada de lo investigado</h2>
<p>Estas conclusiones conectan el registro de oferta, las señales públicas de demanda y la evaluación de alternativas. No representan ventas medidas ni pruebas de usuarios realizadas.</p>
<div class="cross-highlights">
<div><b>Oferta registrada · 392 fichas</b>Se documentaron cursos, programas y recursos alternativos. Su presencia muestra opciones disponibles, no cuotas de mercado ni demanda pagada.</div>
<div><b>Demanda observada · 24 señales</b>Las fuentes registran conductas y públicos distintos. No es válido sumarlas como si fueran matrículas comparables.</div>
<div><b>Dos cursos en evaluación</b>La revisión previa de postulaciones figura primero; el cierre mensual con indicadores es alternativa. La prioridad depende de comprobar la autonomía y evitar duplicaciones.</div>
</div>
<div class="cross-links"><button type="button" data-view="oferta">Profundizar en oferta →</button><button type="button" data-view="demanda">Profundizar en demanda →</button><button type="button" data-view="precios">Ver precios comparables →</button></div>
</div>
 <div class="section panel"><h3>Qué está comprobado y qué falta validar</h3><div class="statline"><span class="xs">Oferta competidora y sustitutos</span>${tag('teal','Documentada')}</div><div class="statline"><span class="xs">Problemas formativos y uso</span>${tag('teal','Señales públicas')}</div><div class="statline"><span class="xs">Prioridad de curso para un piloto</span>${tag('peach','Condicionada')}</div><div class="statline"><span class="xs">Precio y disposición individual a pagar</span>${tag('gray','No validados')}</div><div class="statline"><span class="xs">Piloto con usuarios</span>${tag('gray','No ejecutado')}</div><div class="callout" style="margin-top:14px"><strong>Verificaciones pendientes:</strong> revisar el caso, pauta y rúbrica del curso propio O374 y el ejercicio con planilla de O373. La reunión del 16/11 no se presume realizada.</div></div>
 ${uxDecisionPanels()}
 <div class="callout" style="margin-bottom:19px"><strong>Resultado:</strong> «Revisar una postulación antes de enviarla» está primero (3,55/5), solo si funciona de manera autónoma. «Cerrar el mes con un tablero del programa social» (3,45/5) pasa a primer lugar si esa condición falla.</div><div class="concept-grid">${cards}</div>
 <div class="section grid2"><div class="panel"><h3>Cómo se obtuvo el puntaje</h3><p class="xs muted">Pesos originales del estudio. El componente de precio/comprador tiene evidencia insuficiente y recibe 3/5 como supuesto de referencia, no como dato observado.</p><div class="weights-inline">${weighted}</div><div class="line"></div><h3>Desglose de la primera alternativa</h3>${weights.map(([name,w,i])=>{const v=(i===12?3:+data.Decisión.find(x=>x.id==='C003').raw[i]);return `<div class="weight-row"><span class="wlabel">${esc(name)}<small>${Math.round(w*100)}% del puntaje</small></span>${hbar(v,5,i===12?'linear-gradient(90deg,#f4cb93,#ea9b7f)':'')}<span class="wnum">${v}${i===12?'*':''}/5</span></div>`}).join('')}<p class="xs muted">* Supuesto común por falta de datos de comprador y precio efectivo.</p></div><div class="panel"><h3>Qué podría alterar la prioridad</h3><ul class="simple-list"><li><b>Diferenciación:</b> el curso propio O374 ya enseña revisión de un proyecto final; verificar si sus recursos incluyen la autocorrección propuesta.</li><li><b>Dependencia de tutor:</b> si los controles esenciales requieren revisión experta, C003 pierde su ventaja como cápsula a ritmo propio.</li><li><b>Respaldo:</b> verificar si O373 ya incluye la planilla y el cierre mensual que C002 propone como entregable.</li><li><b>Canal y precio:</b> una compra individual o matrícula observada al precio de lanzamiento podría cambiar la confianza comercial.</li></ul><div class="line"></div><h3>Prueba propuesta, no realizada</h3><p class="bodycopy">Ocho usuarios nuevos: criterio preliminar de éxito 6/8 que corrijan tres errores objetivos y deriven una duda correctamente sin tutor. No es todavía un experimento ejecutado.</p></div></div>
 ${section('Matriz de evaluación original','Los valores se muestran tal como fueron registrados, sin reemplazar “Insuficiente” por un dato inventado.')}
 <div class="table-shell"><div class="table-scroll"><table><thead><tr><th>ID</th><th>Concepto</th><th>Demanda</th><th>Difer.</th><th>Precio</th><th>Asincr.</th><th>Encaje</th><th>Ref./5</th></tr></thead><tbody>${matrix}</tbody></table></div></div>`}
function offerPrice(x){let p=x.raw[13],cur=x.raw[14];if(p===null||p===undefined||String(p).trim()==='')return `<span class="tag gray">Sin importe</span>`;let amount=Number(p);if(!Number.isFinite(amount))return `<span>${esc(String(p))}</span>`;if(amount===0)return tag('teal','$0 publicado');return `<b>${cur==='CLP'?'$'+clp(amount):esc(cur||'')+' '+clp(amount)}</b>`}
function availableProviders(){return [...new Set(data.Oferta.map(x=>x.raw[1]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'))}
function availableTypes(){return [...new Set(data.Oferta.map(x=>x.raw[2]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'))}
function option(value,current){return `<option value="${esc(value)}" ${value===current?'selected':''}>${esc(value)}</option>`}
function filteredOffers(){const q=norm(state.offerQuery);return data.Oferta.filter(x=>(!q||norm(x.raw.join(' ')).includes(q))&&(state.offerProvider==='Todos'||x.raw[1]===state.offerProvider)&&(state.offerType==='Todos'||x.raw[2]===state.offerType)&&(state.offerMoney==='Todos'||(state.offerMoney==='Con importe'?x.raw[13]!==null&&x.raw[13]!==''&&x.raw[13]!==undefined:state.offerMoney==='Gratuito'?Number(x.raw[13])===0&&String(x.raw[13])!==''&&x.raw[13]!=null:(x.raw[13]===null||x.raw[13]===''))));}
function renderOfferRows(){let arr=filteredOffers(),size=24,maxPage=Math.max(0,Math.ceil(arr.length/size)-1);state.offerPage=Math.min(state.offerPage,maxPage);let start=state.offerPage*size;let show=arr.slice(start,start+size);let content=show.map(x=>`<tr><td><button class="id-link" data-open="${x.id}">${x.id}</button></td><td><strong>${esc(x.raw[1])}</strong><div class="micro muted">${esc(tline(x.raw[2],44))}</div></td><td class="col-title"><button class="record-open clamp2" data-open="${x.id}">${esc(x.raw[3])}</button><div class="micro muted clamp2">${esc(x.raw[4])}</div></td><td class="col-summary"><div class="clamp2">${esc(x.raw[8]||'Sin formato especificado')}</div></td><td>${offerPrice(x)}<div class="micro muted clamp2" style="max-width:150px">${esc(x.raw[15]||'Unidad no indicada')}</div></td><td><button class="btn btn-outline btn-small" data-open="${x.id}">Detalle</button></td></tr>`).join('');return `<div class="table-scroll"><table><thead><tr><th>ID</th><th>Proveedor</th><th>Producto / tarea</th><th>Formato publicado</th><th>Precio y unidad</th><th>Ficha</th></tr></thead><tbody>${content||`<tr><td colspan="6" class="empty">Sin coincidencias. Prueba con otro filtro o elimina la búsqueda.</td></tr>`}</tbody></table></div><div class="pagination"><span>Mostrando ${arr.length?start+1:0}–${Math.min(start+size,arr.length)} de <b>${arr.length}</b> resultados · página ${state.offerPage+1}/${maxPage+1}</span><div class="controls"><button data-offer-page="prev" ${state.offerPage===0?'disabled':''}>Anterior</button><button data-offer-page="next" ${state.offerPage===maxPage?'disabled':''}>Siguiente</button></div></div>`}
function renderOffer(){
 const all = data.Oferta;
 const topProviders=Object.entries(all.reduce((a,x)=>(a[x.raw[1]]=(a[x.raw[1]]||0)+1,a),{})).sort((a,b)=>b[1]-a[1]).slice(0,7);
 const types=Object.entries(all.reduce((a,x)=>(a[x.raw[2]]=(a[x.raw[2]]||0)+1,a),{})).sort((a,b)=>b[1]-a[1]);
 const known=all.filter(x=>x.raw[13]!==null && x.raw[13]!==undefined && String(x.raw[13]).trim()!=='').length;
 const zero=all.filter(x=>x.raw[13]===0).length;
 const primaryType=types[0], primaryProvider=topProviders[0];
 const topFive=topProviders.slice(0,5).reduce((n,[,c])=>n+c,0);
 const chartTypes=`<div class="panel ux-provider-chart"><h3>Composición según tipo de proveedor</h3><p class="xs muted">Cómo se distribuyen las fichas entre tipos de institución</p><div class="bars" style="margin-top:18px">${types.slice(0,5).map(([name,n])=>`<div class="provider-bar"><span class="pname" title="${esc(name)}">${esc(name)}</span>${hbar(n,primaryType[1])}<span class="pval">${n}</span></div>`).join('')}</div></div>`;
 const textTypes=`<aside class="ux-provider-explain" aria-label="Cómo interpretar la composición por tipo"><div class="ux-kicker">Cómo leer este gráfico</div><h4>¿Qué tipos de instituciones investigamos?</h4><p>Cada oferta se cuenta una vez según el tipo de proveedor que aparece en su ficha.</p><div class="ux-key-number">${oxPercent(primaryType[1],all.length)}</div><p><strong>${primaryType[1]} de ${all.length}</strong> registros corresponden a «${esc(primaryType[0])}».</p><p class="ux-caution">Este porcentaje describe nuestra muestra investigada, no la participación de mercado.</p></aside>`;
 const chartProviders=`<div class="panel ux-provider-chart"><h3>Proveedores con más fichas registradas</h3><p class="xs muted">Instituciones y plataformas que aparecen con mayor frecuencia</p><div class="bars" style="margin-top:18px">${topProviders.map(([name,n])=>`<div class="provider-bar"><span class="pname" title="${esc(name)}">${esc(name)}</span>${hbar(n,primaryProvider[1])}<span class="pval">${n}</span></div>`).join('')}</div></div>`;
 const textProviders=`<aside class="ux-provider-explain" aria-label="Cómo interpretar los proveedores más frecuentes"><div class="ux-kicker">Hallazgo del registro</div><h4>¿En quiénes se concentró la investigación?</h4><p>El orden refleja cuántas fichas levantamos por proveedor, no sus ventas ni el tamaño total de su catálogo.</p><div class="ux-key-number">${primaryProvider[1]} fichas</div><p><strong>${esc(primaryProvider[0])}</strong> aparece más veces en el registro. Los cinco primeros suman <strong>${topFive}/${all.length}</strong> fichas (${oxPercent(topFive,all.length)}).</p><p class="ux-caution">Que un proveedor aparezca más no demuestra que tenga mayor demanda.</p></aside>`;
 const providerPanels=`<div class="ux-provider-stack"><div class="ux-provider-row">${chartTypes}${textTypes}</div><div class="ux-provider-row">${chartProviders}${textProviders}</div></div>`;
 return `${head('Mapa de la oferta','Qué cursos, recursos y alternativas encontramos, qué enseñan, para quiénes están diseñados y cómo se presentan sus precios.','Investigación · Oferta observada')}
 <div class="metrics">${metric(String(all.length),'Registros de oferta','Cursos, programas, guías y sustitutos','▦')}${metric(String(known),'Fichas con precio registrado',`${known-zero} con monto positivo + ${zero} con $0 publicado`,'＄')}${metric(String(all.filter(x=>x.raw[1]==='Simón de Cirene').length),'Oferta propia','Fichas de Simón de Cirene','⌂')}${metric(String(availableProviders().length),'Proveedores distintos','Nombres de proveedor registrados','◉')}</div>
 <p class="ux-metric-note">Los 190 incluyen productos de precio positivo y ofertas publicadas a $0. No significa que existan 190 cursos pagados ni precios directamente comparables.</p>
 <div class="offer-catalog-cta"><button type="button" class="btn btn-primary" data-catalog>Explorar catálogo completo de cursos <span aria-hidden="true">↗</span></button></div>
 ${oxRender(providerPanels)}`;
}

function renderOfferCatalogue(){return ` <div id="metodo-catalogo" class="ox-anchor" tabindex="-1">
 ${section('Catálogo completo de cursos','392 fichas de oferta y recursos, con todos sus detalles y enlaces originales. Busca o filtra para revisar cada registro.')}
  <div class="method-catalog-return"><button type="button" class="btn btn-outline" data-view="oferta">← Volver al análisis de la oferta</button></div>
  <div class="toolbar"><input class="input" id="offerQuery" placeholder="Buscar en las 392 fichas…" value="${esc(state.offerQuery)}" aria-label="Buscar oferta"><select class="select" id="offerProvider" aria-label="Proveedor">${option('Todos',state.offerProvider)}${availableProviders().map(p=>option(p,state.offerProvider)).join('')}</select><select class="select" id="offerType" aria-label="Tipo de proveedor">${option('Todos',state.offerType)}${availableTypes().map(p=>option(p,state.offerType)).join('')}</select><select class="select" id="offerMoney" aria-label="Disponibilidad de importe">${['Todos','Con importe','Gratuito','Sin importe'].map(p=>option(p,state.offerMoney)).join('')}</select><button class="btn btn-outline" data-export="Oferta">Exportar CSV</button></div><div class="table-shell" id="offerResults">${renderOfferRows()}</div><p class="notefoot">Fuente: pestaña “Oferta” de la matriz original. “Con importe” significa cifra anotada, no tarifa comercialmente comparable.</p></div>
`; }
function demandRow(x){let val=x.raw[4],unit=x.raw[5],display=(val===null||val===''||val===undefined)?'Caso':clp(val);return `<article class="demand-card"><div><span class="d-id">${x.id}</span></div><div><h4>${esc(x.raw[1])}</h4><p>${esc(x.raw[3])}</p><div class="d-type">${esc(x.raw[2])} · ${esc(x.raw[14])}</div></div><div class="d-value"><b>${esc(display)}</b><small>${esc(unit||'Señal cualitativa')}</small><button class="btn btn-outline btn-small" data-open="${x.id}" style="margin-top:8px">Ver evidencia ↗</button></div></article>`}
function ux10DemandRecords(){
 const q=norm(state.demandQuery);
 return data.Demanda.filter(x=>(state.demandFamily==='Todos'||String(x.raw[1]||'').startsWith(state.demandFamily+' ·'))
 &&(state.demandType==='Todos'||ux10DemandBrief.typeById[x.id]===state.demandType)
 &&(!q||norm(x.raw.join(' ')).includes(q)));
}
function renderDemandRows(){const filtered=ux10DemandRecords();return `<div class="xs muted ux102-count" role="status" aria-live="polite">${filtered.length} de ${data.Demanda.length} fichas coinciden con los filtros. No se suman las cantidades de unidades distintas.</div>${filtered.map(demandRow).join('')||'<div class="empty">No hay fichas que coincidan. Puedes cambiar o limpiar los filtros.</div>'}`}

const ux10DemandBrief=JSON.parse(document.getElementById('ux10-demand-brief').textContent);
function ux10IdLinks(ids){return ids.map(id=>`<button type="button" class="ux10-id-link" data-open="${esc(id)}" aria-label="Abrir ficha ${esc(id)}">${esc(id)}</button>`).join('')}
function ux102FamilyOf(x){return String(x.raw[1]||'').split(' · ')[0]}
function ux102Count(f,t){return data.Demanda.filter(x=>(!f||ux102FamilyOf(x)===f)&&(!t||ux10DemandBrief.typeById[x.id]===t)).length}
function ux102FamilyBtn(f){const n=ux102Count(f.code,null),on=state.demandFamily===f.code;
 return `<button type="button" class="ux102-family-btn${on?' is-selected':''}" data-demand-family="${esc(f.code)}" aria-pressed="${on}" aria-label="${esc(f.title)}: ${n} fichas registradas. ${on?'Quitar':'Aplicar'} filtro">
 <span class="ux102-family-top"><span class="ux102-family-name">${esc(f.title)}</span><strong>${n} <small>fichas</small></strong></span>
 <span class="ux102-bar-track" aria-hidden="true"><span class="ux102-bar-fill" style="width:${n/6*100}%"></span></span></button>`}
function ux10FamilyTiles(){return ux10DemandBrief.families.map(ux102FamilyBtn).join('')}
function ux10TypeTiles(){return ux10DemandBrief.types.map(t=>{const n=ux102Count(null,t.key),on=state.demandType===t.key;
 return `<button type="button" class="ux10-type ux102-type-btn${on?' is-selected':''}" data-demand-type="${esc(t.key)}" aria-pressed="${on}"><div class="ux10-type-number">${n}<span> fichas</span></div><h3>${esc(t.title)}</h3><p>${esc(t.desc)}</p></button>`}).join('')}
function ux102MatrixCell(f,t){const n=ux102Count(f.code,t.key),on=state.demandFamily===f.code&&state.demandType===t.key;
 return `<button type="button" class="ux102-matrix-btn${on?' is-selected':''}${n===0?' is-empty':''}" data-demand-cell="${esc(f.code)}|${esc(t.key)}" aria-pressed="${on}" aria-label="${esc(f.title)}; ${esc(t.title)}: ${n} fichas registradas. ${on?'Quitar':'Aplicar'} filtros">${n}<span class="sr-only"> fichas</span></button>`}
function ux102Matrix(){const families=ux10DemandBrief.families,types=ux10DemandBrief.types;
 const desktop=`<div class="ux102-matrix-scroll"><table class="ux102-matrix-table"><caption>Registros documentados por familia y tipo de evidencia. Cada ficha se cuenta una sola vez.</caption><thead><tr><th scope="col">Familia de tareas</th>${types.map(t=>`<th scope="col">${esc(t.title)}</th>`).join('')}<th scope="col">Total de fichas</th></tr></thead><tbody>${families.map(f=>`<tr><th scope="row">${esc(f.title)}</th>${types.map(t=>`<td>${ux102MatrixCell(f,t)}</td>`).join('')}<td><strong>${ux102Count(f.code,null)}</strong></td></tr>`).join('')}</tbody><tfoot><tr><th scope="row">Total</th>${types.map(t=>`<td>${ux102Count(null,t.key)}</td>`).join('')}<td><strong>24</strong></td></tr></tfoot></table></div>`;
 const mobile=`<div class="ux102-matrix-mobile">${families.map(f=>`<details class="ux102-matrix-mobile-group" ${state.demandFamily===f.code?'open':''}><summary>${esc(f.title)} <span>${ux102Count(f.code,null)} fichas</span></summary><div class="ux102-mobile-cells">${types.map(t=>`<div class="ux102-mobile-cell"><span>${esc(t.title)}</span>${ux102MatrixCell(f,t)}</div>`).join('')}</div></details>`).join('')}</div>`;
 return `<div class="ux102-matrix-shell">${desktop}${mobile}<p class="ux102-caption">Cada número representa fichas que encontramos, no organizaciones que necesitan formación. Selecciona una celda para filtrar por familia y tipo.</p></div>`}
function ux102MatchedIds(){return new Set(ux10DemandRecords().map(x=>x.id))}
function ux10FindingCard(h,filtered){const ids=h.ids.filter(id=>filtered.has(id));if(ids.length===0)return '';
 return `<article class="ux10-finding"><div class="ux10-finding-top"><span class="ux10-kicker">Hallazgo descriptivo</span><span class="ux10-ref">${esc(h.id)}</span></div><h3>${esc(h.title)}</h3><p class="ux10-claim">${esc(h.claim)}</p>
 <p class="ux102-evidence-tag">${ids.length} de ${h.ids.length} fichas vinculadas cumplen los filtros</p>
 <details class="ux10-finding-details"><summary>Ver contexto, límites y fichas (${ids.length})</summary><p><strong>Contexto:</strong> ${esc(h.context)}</p><p><strong>Contraevidencia:</strong> ${esc(h.counter)}</p><p><strong>No podemos concluir:</strong> ${esc(h.not)}</p><div class="ux10-linked"><span>Fichas que cumplen los filtros</span><div class="ux10-id-list">${ux10IdLinks(ids)}</div></div></details></article>`}
function ux102Findings(){const filtered=ux102MatchedIds();const cards=ux10DemandBrief.findings.map(h=>ux10FindingCard(h,filtered)).filter(Boolean);
 return `<p class="ux102-findings-status" role="status" aria-live="polite">${cards.length} de 9 hallazgos tienen fichas relacionadas con la selección actual.</p>${cards.join('')||'<p class="empty">Ningún hallazgo vinculado a estos filtros. Amplía la selección para explorar otros casos.</p>'}`}
function ux102Status(){const fam=ux10DemandBrief.families.find(x=>x.code===state.demandFamily),type=ux10DemandBrief.types.find(x=>x.key===state.demandType);
 const parts=[fam?fam.title:'Todas las familias',type?type.title:'Todos los tipos'];if(state.demandQuery)parts.push('Texto: '+state.demandQuery);
 return `<div class="ux102-current" role="status" aria-live="polite"><div><strong>Selección actual</strong><span>${esc(parts.join(' · '))}</span><small>${ux10DemandRecords().length} de 24 fichas</small></div><button type="button" class="btn btn-outline btn-small" data-demand-reset ${state.demandFamily==='Todos'&&state.demandType==='Todos'&&!state.demandQuery?'disabled':''}>Limpiar filtros</button></div>`}
function ux102Sync(){const root=document.getElementById('demanda');if(!root||state.view!=='demanda')return;
 root.querySelectorAll('[data-demand-family]').forEach(x=>{const code=x.dataset.demandFamily,on=code===state.demandFamily,f=ux10DemandBrief.families.find(y=>y.code===code);x.classList.toggle('is-selected',on);x.setAttribute('aria-pressed',String(on));if(f)x.setAttribute('aria-label',`${f.title}: ${ux102Count(code,null)} fichas registradas. ${on?'Quitar':'Aplicar'} filtro`)});
 root.querySelectorAll('[data-demand-type]').forEach(x=>{const key=x.dataset.demandType,on=key===state.demandType,t=ux10DemandBrief.types.find(y=>y.key===key);x.classList.toggle('is-selected',on);x.setAttribute('aria-pressed',String(on));if(t)x.setAttribute('aria-label',`${t.title}: ${ux102Count(null,key)} fichas registradas. ${on?'Quitar':'Aplicar'} filtro`)});
 root.querySelectorAll('[data-demand-cell]').forEach(x=>{const [f,t]=x.dataset.demandCell.split('|'),on=state.demandFamily===f&&state.demandType===t,ff=ux10DemandBrief.families.find(y=>y.code===f),tt=ux10DemandBrief.types.find(y=>y.key===t);x.classList.toggle('is-selected',on);x.setAttribute('aria-pressed',String(on));if(ff&&tt)x.setAttribute('aria-label',`${ff.title}; ${tt.title}: ${ux102Count(f,t)} fichas registradas. ${on?'Quitar':'Aplicar'} filtros`)});
 root.querySelectorAll('.ux102-matrix-mobile-group').forEach((d,i)=>{if(state.demandFamily===ux10DemandBrief.families[i].code)d.open=true});
 const holder=root.querySelector('#ux102-status');if(holder)holder.innerHTML=ux102Status();
 const findings=root.querySelector('#ux102-findings');if(findings)findings.innerHTML=ux102Findings();
 const results=root.querySelector('#demandResults');if(results)results.innerHTML=renderDemandRows();
}
function renderDemand(){
 const types=['participación_en_formación','postulación_a_fondo','práctica_operativa','contratación_institucional'];
 const coverage=Object.values(ux10DemandBrief.statuses).filter(x=>x==='DIRECTO').length;
 const familyCount=new Set(data.Demanda.map(x=>String(x.raw[1]).split(' · ')[0])).size;
 return `${head('Demanda · Necesidades y actividades observadas','Exploramos tareas concretas documentadas en fuentes públicas. Estas señales describen actividades, no representan la totalidad del mercado chileno ni estiman cuántas fundaciones comprarían cursos.','Fase 2 · Qué actividades encontramos')}
 <div class="ux10-hero-note"><strong>Cómo leer esta página</strong><p>Partimos por las tareas que encontramos, distinguimos qué tipo de actividad ocurrió y después abrimos las fuentes originales. Así evitamos confundir un taller, una postulación y una contratación con una misma medida de demanda.</p></div>
 <div class="metrics ux10-metrics">
 ${metric(String(data.Demanda.length),'Señales documentadas','Son fichas, no clientes únicos','◇')}
 ${metric(String(familyCount),'Familias de tareas','Cobertura de la investigación','◎')}
 ${metric(String(types.length),'Tipos de evidencia','Actividades de naturaleza distinta','▦')}
 ${metric(coverage+' de '+data.Demanda.length,'Acceso directo','Otras: 3 indexadas y 6 parciales','◉')}
 </div>
 <div class="ux10-limits"><span class="ux10-limit-dot"></span><div><strong>Sobre las matrículas</strong><p>En estas 24 señales no encontramos evidencia comparable de matrículas pagadas de cursos asincrónicos para OSC. <b>Esto no significa que el mercado tenga cero compradores.</b></p></div></div>
 ${section('¿En qué tareas encontramos señales?','Una fotografía de los registros investigados. Estas cifras no indican qué necesidades son más demandadas por todas las fundaciones.')}
 <div class="ux10-families ux102-families">${ux10FamilyTiles()}</div><p class="ux10-subnote">Las barras representan cobertura de la investigación, no intensidad de demanda. Selecciona una para filtrar; puedes combinarla con un tipo de evidencia.</p>
 ${section('¿Qué tipo de actividad observamos?','Cuatro clases distintas de evidencias. Sus cantidades describen el catálogo de 24 fichas, no alumnos, compradores ni volumen de mercado.')}
 <div class="ux10-types">${ux10TypeTiles()}</div>${section('Cruce por tarea y actividad','La matriz cruza las seis familias con cuatro clases de evidencia. Cada ficha entra una vez en su celda: 0 significa que no registramos fichas de esa combinación, no ausencia de demanda.')}<div id="ux102-matrix">${ux102Matrix()}</div><div id="ux102-status">${ux102Status()}</div>
 ${section('Hallazgos que podemos explicar','Nueve observaciones descriptivas del estudio. Abre cada tarjeta para leer qué la respalda y qué sería incorrecto afirmar.')}
 <div class="ux10-findings" id="ux102-findings">${ux102Findings()}</div>
 <div class="ux10-sources"><div><span class="ux10-kicker">Calidad de las fuentes</span><h2>Qué pudimos corroborar</h2><p><strong>15</strong> accesos directos, <strong>3</strong> basados en índices oficiales y <strong>6</strong> verificaciones parciales. Los estados describen acceso documental, no importancia de la necesidad.</p><p>Hay <strong>14</strong> registros sin fecha editorial original suficiente. D012 y D014 comparten proyecto y fuente; D018 y D019 son órdenes diferentes del mismo organismo.</p></div><a href="https://app.notion.com/p/41b091be032781e9a3d6df75133d85ea" class="btn btn-outline" target="_blank" rel="noopener noreferrer">Leer auditoría completa ↗</a></div>
 ${section('Explorar las 24 fichas originales','Busca el caso que te interesa y ábrelo en el panel lateral. Cada ficha conserva sus fuentes, fechas y limitaciones de la base canónica.')}
 <div class="toolbar ux10-toolbar"><label class="ux10-search-label" for="demandQuery">Buscar en las señales</label><input class="input" id="demandQuery" value="${esc(state.demandQuery)}" placeholder="Tema, institución, resultado…" autocomplete="off"><button class="btn btn-outline" data-export="Demanda">Exportar CSV</button></div>
 <div id="demandResults">${renderDemandRows()}</div>
 <p class="ux10-method-footer">Este análisis identifica actividades documentadas, no una muestra estadística ni una validación de disposición a pagar. Las hipótesis comerciales pertenecen a Conclusiones Cruzadas.</p>`;
}
function priceTile(x,tagName){return `<div class="price-tile"><div class="pricelabel">${esc(x.raw[1])} · ${esc(x.id)}</div><div class="amount">${x.raw[13]===0?'Sin costo':('$'+clp(x.raw[13]))}</div><div class="pricetype">${esc(tagName)}<br><span class="muted">${esc(tline(x.raw[3],67))}</span></div><button class="btn btn-outline btn-small" data-open="${x.id}">Ver condiciones ↗</button></div>`}
function renderPrices(){const picks=['O005','O006','O028','O386','O374','O388','O373','O019'].map(x=>byId.get(x)).filter(Boolean);const labels=['Taller asincrónico gratuito','Producto: unidad individual por verificar','Curso individual generalista','Producto: unidad individual por verificar','Curso propio mixto con Zoom','Precio por organización de hasta dos personas','OTEC por persona; mínimo 35','Producto: unidad por verificar'];let indiv=data.Oferta.filter(x=>x.raw[14]==='CLP'&&x.raw[13]!=null&&x.raw[13]!==''&&Number.isFinite(Number(x.raw[13]))&&String(x.raw[15]||'').includes('Por curso individual'));const bins=[{lab:'$0',v:0},{lab:'$1–10 mil',v:0},{lab:'$10–20 mil',v:0},{lab:'$20–50 mil',v:0},{lab:'Más de $50 mil',v:0}];for(let o of indiv){let n=+o.raw[13];bins[n===0?0:n<=10000?1:n<=20000?2:n<=50000?3:4].v++}const mx=Math.max(1,...bins.map(x=>x.v));return `${head('Precios que se parecen, productos que no','El rango objetivo de $15.000–$20.000 por participante no se puede validar comparando indiscriminadamente cursos individuales, suscripciones, talleres con Zoom, contratos y organizaciones.','Fase 3 · Competencia y monetización')}
 <div class="callout warn"><strong>Regla crítica:</strong> las fichas muestran precios <em>publicados</em>; no hay matrícula pagada demostrada para una cápsula breve idéntica a C003 o C002. La unidad de cobro y la modalidad acompañan cada monto.</div>
 ${section('Ocho referencias con condiciones distintas','Abre cada caso para verificar fecha de consulta, público, unidad y modalidad.')}
 <div class="price-grid">${picks.map((x,i)=>priceTile(x,labels[i])).join('')}</div>
 <div class="section grid2"><div class="panel"><h3>Cursos individuales del corpus</h3><p class="xs muted">Distribución exploratoria de las ${indiv.length} fichas con monto en CLP clasificadas como “Por curso individual”. Incluye promociones y ediciones observadas; NO es precio sugerido de una OSFL chilena.</p><div class="bars" style="margin-top:22px">${bins.map(b=>`<div class="provider-bar"><span class="pname">${b.lab}</span>${hbar(b.v,mx)}<span class="pval">${b.v}</span></div>`).join('')}</div></div><div class="panel"><h3>Hipótesis comercial a validar</h3><div style="font:800 35px Manrope,sans-serif;letter-spacing:-.05em;color:var(--navy);margin:16px 0 4px">$15.000–$20.000</div><p class="xs muted">CLP por participante · solo propuesta inicial</p><div class="line"></div><p class="bodycopy">Primero se debe definir el comprador, el resultado de aprendizaje, el formato exacto y la sustitución gratuita más próxima. Luego observar matrículas pagadas o decisiones reales de compra.</p>${tag('peach','Sin validación transaccional')}</div></div>
 ${section('Qué constituye una comparación justa','No mezclar unidades para obtener una mediana atractiva pero engañosa.')}
 <div class="split-info"><div class="info-block"><h4>Producto individual</h4><p>Valorar contenido y entregable por compra única, modalidad, tutoría, certificado y vigencia del precio.</p></div><div class="info-block"><h4>Suscripción</h4><p>Un precio mensual o anual da acceso a un catálogo; no es automáticamente precio por un curso individual.</p></div><div class="info-block"><h4>Grupo, institución o asesoría</h4><p>Calcular equivalencias individuales solo con cupos y condiciones verificadas; una revisión humana cambia el servicio.</p></div></div>`}
function filteredSearch(){let q=norm(state.searchQuery);return data.Búsquedas.filter(x=>(!q||norm(x.raw.join(' ')).includes(q))&&(state.searchTool==='Todos'||x.raw[1]===state.searchTool))}
function renderSearchRows(){let arr=filteredSearch(),size=25,maxPage=Math.max(0,Math.ceil(arr.length/size)-1);state.searchPage=Math.min(state.searchPage,maxPage);let start=state.searchPage*size;let content=arr.slice(start,start+size).map(x=>`<tr><td><button class="id-link" data-open="${x.id}">${x.id}</button></td><td><strong>${esc(x.raw[1])}</strong></td><td class="col-title"><button data-open="${x.id}" class="record-open clamp2">${esc(x.raw[2])}</button></td><td>${esc(tline(x.raw[3],88))}</td><td class="col-summary"><div class="clamp2">${esc(x.raw[12]||x.raw[13]||'Ver ficha')}</div></td><td><button class="btn btn-outline btn-small" data-open="${x.id}">Ver rastro</button></td></tr>`).join('');return `<div class="table-scroll"><table><thead><tr><th>ID</th><th>Herramienta</th><th>Consulta exacta</th><th>Intención</th><th>Resultado</th><th>Registro</th></tr></thead><tbody>${content||'<tr><td colspan="6" class="empty">No se encontraron búsquedas.</td></tr>'}</tbody></table></div><div class="pagination"><span>${arr.length?start+1:0}–${Math.min(start+size,arr.length)} de <b>${arr.length}</b> registros · página ${state.searchPage+1}/${maxPage+1}</span><div class="controls"><button data-search-page="prev" ${state.searchPage===0?'disabled':''}>Anterior</button><button data-search-page="next" ${state.searchPage===maxPage?'disabled':''}>Siguiente</button></div></div>`}
function renderSearch(){let tools=[...new Set(data.Búsquedas.map(x=>x.raw[1]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));return `${head('La bitácora, sin recortar','Las 709 búsquedas y cotejos documentan consultas, herramientas, filtros, resultados y limitaciones. Son ejecuciones de investigación, no 709 fuentes únicas.','Rastro de verificación · B001–B709')}
 <div class="callout"><strong>Reproducibilidad:</strong> cada ejecución conserva consulta exacta, región, fecha, vínculo a búsqueda y las ofertas/señales asociadas. Los paneles de Google Trends se interpretan con sus límites, sin sumar índices normalizados como demanda absoluta.</div>
 ${section('Explorador de ejecuciones','Haz clic en cualquier ID para leer el registro completo y sus IDs vinculados.')}
 <div class="toolbar"><input class="input" id="searchQuery" value="${esc(state.searchQuery)}" placeholder="Buscar consulta, término, plataforma o incidencia…"><select class="select" id="searchTool">${option('Todos',state.searchTool)}${tools.map(o=>option(o,state.searchTool)).join('')}</select><button class="btn btn-outline" data-export="Búsquedas">Exportar CSV</button></div><div class="table-shell" id="searchResults">${renderSearchRows()}</div><p class="notefoot">Los últimos 15 cotejos (B695–B709) pertenecen al control final 5B. La presentación mantiene como referencia el corte anterior de 694 búsquedas, de forma deliberada.</p>`}
const phases=[['0A–0C','Definir alcance y protocolo','Mercado Chile, unidades de observación, cuatro pestañas canónicas, comparabilidad y registro de fuentes.'],['1A–1B','Oferta y depuración','Barrido de redes, Estado, universidades, plataformas generalistas y oferta propia; depuración por tareas y sustitutos.'],['2A–2C','Señales de demanda','Búsqueda pública de matrícula, uso, postulaciones, Google Trends y compras institucionales con límites.'],['3A–3C','Competencia y precio','Mejor sustituto gratuito y oferta pagada cercana; control de unidad de cobro, modalidad y comprador.'],['4A–4C','Puntuación, sensibilidad y convergencia','Seis conceptos, pesos explícitos, contraevidencia y selección condicional C003/C002.'],['5A','Presentación','Siete láminas editables para el lunes 16 de noviembre: decisión y anexos.'],['5B y 5B-R1','QA final y reconsulta','Auditoría de cifras, 15 cotejos extra, corrección de continuidad y reconsulta de precios.'],['5B-R2','Control prerreunión','Revisión adicional de solapamiento interno y límites de precio. No registra acuerdos ni prueba pilotos.'],['Siguiente','Acuerdos y materiales propios','Solo después de la reunión: comprobar rúbrica/caso de O374 y ejercicio editable de O373. Preparar piloto únicamente con autorización.']];
function renderMethod(){const sources=[['Registro canónico de evidencia',sourceSheet],['Plan de investigación y actas','https://app.notion.com/p/410091be032781b4aa5fdfadb82a9a83'],['Guía de continuidad','https://app.notion.com/p/417091be0327817e98c0f8ca7728b8d0'],['Presentación de siete láminas','https://docs.google.com/presentation/d/1dmyUfI8p98DGeveaGyn3j6zDce8LGK9r4LwM0AI3NLE/edit'],['Cursos oficiales Simón de Cirene','https://simondecirene.cl/cursos/'],['Aula de cursos Simón de Cirene','https://cursos.simondecirene.cl/courses/'],['Curso propio de fondos · O374','https://simondecirene.cl/cursos/postulacion-fondos-concursables-osfl-v3-2026/'],['Fondo Comunidad Activa 2027 · O388','https://incubatuong.cl/fondo-comunidad-activa-2027/']];return `${head('Método, cobertura y trazabilidad','El dashboard reúne el estudio externo con sus reglas de interpretación. Cada ficha incluye su origen y se puede contrastar con los documentos de trabajo.','Cómo se construyó el análisis')}
 <div class="section grid2"><div class="panel"><h3>Alcance del estudio</h3><ul class="simple-list"><li><b>Público central:</b> equipos de gestión y ejecución de fundaciones y corporaciones sin fines de lucro chilenas en operación.</li><li><b>Mercado:</b> Chile, con oferta y ediciones públicas desde 2024 y recursos anteriores aún pertinentes.</li><li><b>Fuentes:</b> catálogos, fichas oficiales, recursos abiertos, instrumentos públicos, informes y consultas documentadas.</li><li><b>Sin entrevistas:</b> el análisis externo no valida preferencias ni disposición individual a pagar.</li><li><b>Unidad de observación:</b> oferta única, ejecución de búsqueda, señal de demanda o concepto de curso; no mezclar sus totales.</li></ul></div><div class="panel"><h3>Convenciones de evidencia</h3><div class="statline"><span class="xs">O001–O392</span>${tag('teal','Ofertas y recursos')}</div><div class="statline"><span class="xs">B001–B709</span>${tag('blue','Búsquedas y verificación')}</div><div class="statline"><span class="xs">D001–D024</span>${tag('teal','Señales de demanda')}</div><div class="statline"><span class="xs">C001–C006</span>${tag('peach','Conceptos evaluados')}</div><div class="line"></div><p class="xs muted">Corte de decisión: 392 / 694 / 24 / 6. Corte de QA tras 5B: 392 / 709 / 24 / 6. El aumento de búsquedas proviene de 15 verificaciones, no de 15 cursos nuevos.</p></div></div>
 ${section('Roadmap e hitos','Cierres registrados en Notion; la próxima etapa depende de insumos internos reales.')}
 <div class="method-timeline">${phases.map(([code,name,desc],i)=>`<div class="phase"><div class="phase-dot" ${i===phases.length-1?'style="background:#fff3ea;border-color:#f5ddc6;color:#b56b47"':''}>${code}</div><div class="phase-body"><h4>${esc(name)} ${i===phases.length-1?tag('peach','Pendiente'):tag('teal','Completado')}</h4><p>${esc(desc)}</p></div></div>`).join('')}</div>
 ${section('Fuentes principales y archivos de origen','La totalidad de las referencias de fila también se encuentra en los 1.131 registros incluidos en este HTML.')}
 <div class="source-grid">${sources.map(([n,u])=>`<a class="source-link" href="${esc(u)}" target="_blank" rel="noopener noreferrer">${esc(n)} <span>↗</span></a>`).join('')}</div>
 <div class="section callout warn"><strong>Riesgos que no deben esconderse:</strong> número de fichas no es una estimación de mercado, participación pública no es compra, promoción no es precio vigente permanente, el índice de Trends no equivale a volumen absoluto y la autonomía de C003/C002 depende de revisar materiales internos no disponibles en el estudio de fuentes públicas.</div>
 ${renderOfferCatalogue()}`}
let detailTrigger;
function displayDetail(id){let x=byId.get(id);if(!x)return;if(!document.getElementById('overlay').classList.contains('open'))detailTrigger=document.activeElement;let headers=DB[x.tab].headers;let main=x.tab==='Oferta'?x.raw[3]:x.tab==='Demanda'?x.raw[1]:x.tab==='Decisión'?x.raw[1]:x.raw[3];let header=`<div class="eyebrow">${esc(x.tab)} · ${esc(id)}</div><h2>${esc(main||id)}</h2><p class="xs muted">Registro de fila ${x.index} de la pestaña original · se muestra la evidencia sin reescribirla</p><div class="pillbox"><a href="${esc(sourceA(x))}" target="_blank" rel="noopener" class="btn btn-outline btn-small">Abrir fila en Sheets ↗</a><button class="btn btn-outline btn-small" data-copy="${esc(id)}">Copiar ID</button></div>`;let lines=headers.map((name,i)=>{let val=x.raw[i];if(val==null||val==='')return '';let extra='';if(/^(URL|Enlace|Fuente.*URL)/i.test(name)||name==='URL principal'){let u=safeUrl(val);if(u)extra=`<div style="margin-top:5px">${openLink(u,'Abrir fuente ↗')}</div>`}let codes=extractIds(val).filter(t=>t!==id&&byId.has(t));if(codes.length&&/(ID de|IDs|vínculo)/i.test(name))extra+=`<div style="margin-top:6px">${codes.slice(0,35).map(anchorRecord).join('')}</div>`;return `<div class="drow"><dt>${esc(name)}</dt><dd>${esc(val)}</dd>${extra}</div>`}).join('');document.getElementById('drawerContent').innerHTML=header+`<dl>${lines}</dl>`;document.getElementById('overlay').classList.add('open');document.getElementById('overlay').setAttribute('aria-hidden','false');document.body.style.overflow='hidden';document.querySelector('.close').focus();}
function closeDetail(){if(!document.getElementById('overlay').classList.contains('open'))return;document.getElementById('overlay').classList.remove('open');document.getElementById('overlay').setAttribute('aria-hidden','true');document.body.style.overflow='';if(detailTrigger?.isConnected)detailTrigger.focus({preventScroll:true});detailTrigger=null;}
function render(view){if(!labels[view])view='inicio';state.view=view;let elem=document.getElementById(view);let fn={inicio:renderOverview,conceptos:renderConcepts,oferta:renderOffer,demanda:renderDemand,precios:renderPrices,busquedas:renderSearch,metodo:renderMethod}[view];elem.innerHTML=fn();if(view==='oferta')oxPaint();document.querySelectorAll('.page').forEach(x=>x.classList.toggle('active',x.id===view));document.querySelectorAll('.nav button').forEach(x=>x.classList.toggle('active',x.dataset.view===view));document.body.classList.toggle('home-active',view==='inicio');document.getElementById('breadcrumb').textContent=labels[view];closeSidebar(false);window.scrollTo({top:0,behavior:'instant'});}
function goToCatalogue(){
  if(state.view!=='metodo')render('metodo');
  history.replaceState(null,'','#metodo-catalogo');
  requestAnimationFrame(()=>{
    const el=document.getElementById('metodo-catalogo');
    if(el){el.focus({preventScroll:true});el.scrollIntoView({block:'start',behavior:'instant'});}
  });
}
function exportCSV(tab){let v=DB[tab];if(!v)return;let arr=[v.headers,...v.rows];let text=arr.map(row=>row.map(x=>'"'+String(x==null?'':x).replaceAll('"','""')+'"').join(';')).join('\r\n');let b=new Blob(['\ufeff'+text],{type:'text/csv;charset=utf-8'});let url=URL.createObjectURL(b),a=document.createElement('a');a.href=url;a.download='SDC_Cursos_'+tab.normalize('NFD').replace(/[\u0300-\u036f]/g,'')+'_2026-11-16.csv';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);notice('CSV de '+tab+' generado');}
document.addEventListener('click',async e=>{let target=e.target.closest('[data-catalog],[data-view],[data-open],[data-close],[data-offer-page],[data-search-page],[data-export],[data-copy]');if(!target)return; if(target.hasAttribute('data-catalog')){goToCatalogue();}else if(target.dataset.view){render(target.dataset.view);history.replaceState(null,'','#'+target.dataset.view)}else if(target.dataset.open){displayDetail(target.dataset.open)}else if(target.dataset.close){closeDetail()}else if(target.dataset.offerPage){state.offerPage=Math.max(0,state.offerPage+(target.dataset.offerPage==='next'?1:-1));document.getElementById('offerResults').innerHTML=renderOfferRows()}else if(target.dataset.searchPage){state.searchPage=Math.max(0,state.searchPage+(target.dataset.searchPage==='next'?1:-1));document.getElementById('searchResults').innerHTML=renderSearchRows()}else if(target.dataset.export){exportCSV(target.dataset.export)}else if(target.dataset.copy){try{await navigator.clipboard.writeText(target.dataset.copy);notice('ID copiado')}catch{notice('Copia el ID de la ficha')}}});
document.addEventListener('input',e=>{if(e.target.id==='offerQuery'){state.offerQuery=e.target.value;state.offerPage=0;document.getElementById('offerResults').innerHTML=renderOfferRows()}else if(e.target.id==='searchQuery'){state.searchQuery=e.target.value;state.searchPage=0;document.getElementById('searchResults').innerHTML=renderSearchRows()}else if(e.target.id==='demandQuery'){state.demandQuery=e.target.value;ux102Sync()}});
document.addEventListener('change',e=>{if(e.target.id==='offerProvider'||e.target.id==='offerType'||e.target.id==='offerMoney'){state[e.target.id==='offerProvider'?'offerProvider':e.target.id==='offerType'?'offerType':'offerMoney']=e.target.value;state.offerPage=0;document.getElementById('offerResults').innerHTML=renderOfferRows()}else if(e.target.id==='searchTool'){state.searchTool=e.target.value;state.searchPage=0;document.getElementById('searchResults').innerHTML=renderSearchRows()}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-demand-family],[data-demand-type],[data-demand-cell],[data-demand-reset]');if(!b||state.view!=='demanda')return;
 if(b.hasAttribute('data-demand-family'))state.demandFamily=state.demandFamily===b.dataset.demandFamily?'Todos':b.dataset.demandFamily;
 else if(b.hasAttribute('data-demand-type'))state.demandType=state.demandType===b.dataset.demandType?'Todos':b.dataset.demandType;
 else if(b.hasAttribute('data-demand-cell')){const [f,t]=b.dataset.demandCell.split('|');const same=state.demandFamily===f&&state.demandType===t;state.demandFamily=same?'Todos':f;state.demandType=same?'Todos':t;}
 else if(b.hasAttribute('data-demand-reset')){state.demandFamily='Todos';state.demandType='Todos';state.demandQuery='';const input=document.getElementById('demandQuery');if(input)input.value='';}
 ux102Sync();if(b.hasAttribute('data-demand-reset'))document.getElementById('demandQuery')?.focus({preventScroll:true});});
document.getElementById('overlay').addEventListener('click',e=>{if(e.target.id==='overlay')closeDetail()});document.addEventListener('keydown',e=>{if(e.key==='Escape')closeDetail()});const sidebar = document.getElementById('sidebar');
const sidebarToggle = document.getElementById('sidebarToggle');
const sidebarBackdrop = document.getElementById('sidebarBackdrop');
function closeSidebar(returnFocus=false){
  document.body.classList.remove('sidebar-open');
  sidebarToggle.setAttribute('aria-expanded','false');
  sidebarToggle.setAttribute('aria-label','Abrir menú de navegación');
  sidebarToggle.title='Abrir menú';
  sidebar.inert=true;
  sidebarBackdrop.hidden=true;
  if(returnFocus) sidebarToggle.focus({preventScroll:true});
}
function openSidebar(){
  document.body.classList.add('sidebar-open');
  sidebarToggle.setAttribute('aria-expanded','true');
  sidebarToggle.setAttribute('aria-label','Cerrar menú de navegación');
  sidebarToggle.title='Cerrar menú';
  sidebar.inert=false;
  sidebarBackdrop.hidden=false;
}
sidebarToggle.addEventListener('click',()=>document.body.classList.contains('sidebar-open')?closeSidebar(true):openSidebar());
sidebarBackdrop.addEventListener('click',()=>closeSidebar(true));
document.addEventListener('keydown',e=>{
  if(e.key==='Escape'&&document.body.classList.contains('sidebar-open')){closeSidebar(true);return;}
  if(e.key==='Tab'&&document.body.classList.contains('sidebar-open')){
    const focusables=[sidebarToggle,...sidebar.querySelectorAll('button:not([disabled]),a[href]')].filter(el=>!el.inert && el.getClientRects().length);
    const current=focusables.indexOf(document.activeElement);
    if(e.shiftKey && current===0){e.preventDefault();focusables[focusables.length-1].focus();}
    else if(!e.shiftKey && current===focusables.length-1){e.preventDefault();sidebarToggle.focus();}
  }
});
const ox = JSON.parse(document.getElementById('ox-analysis-data').textContent);
const oxTitles = {
  total: 'Catálogo completo',
  pertinente: 'Pertinente para OSFL',
  osfl_chile: 'OSFL Chile · público explícito',
  osfl_chile_sensibilidad: 'OSFL Chile · sensibilidad'
};
const oxSegments = ['S01', 'S02', 'S03', 'S04', 'S05', 'S06', 'S00'];
const oxShort = {S01:'OSFL / OSC',S02:'MIPYME',S03:'Empresas / profesionales',S04:'Sector público',S05:'Estudiantes',S06:'Público general',S00:'Sin evidencia'};
const oxEvidence = ['Explícito', 'Inferido', 'No consta'];
const oxUnique = values => [...new Set(values)];
const oxValues = key => oxUnique(ox.records.flatMap(r => r[key])).sort((a,b) => a.localeCompare(b,'es'));
const oxThemes = Object.keys(ox.labels).filter(key => key.startsWith('T'));
const oxCodes = codes => codes.map(key => [key, ox.labels[key]]);
const oxFilterOptions = {
  theme: ['Tema principal', oxCodes(oxThemes)],
  segment: ['Público', oxCodes(oxSegments)],
  evidence: ['Evidencia de público', oxEvidence.map(x => [x, x === 'No consta' ? 'Sin evidencia suficiente' : x])],
  roles: ['Rol objetivo', oxCodes(oxValues('roles'))],
  provider: ['Proveedor', oxValues('provider')],
  competition: ['Relación competitiva', ['Comparable directo', ...oxValues('competition')]],
  modality: ['Modalidad', oxValues('modality')],
  unit: ['Unidad de precio', oxValues('unit')],
  verification: ['Revisión de ficha', oxValues('verification')],
  group: ['Grupo de precio', Object.entries(ox.groups)]
};
const oxState = {view:'total', filters:{}, page:0, includeOwn:true, priceBand:null};

const oxViewSizes = Object.fromEntries(ox.views.map(view => [view, ox.records.filter(r => r.views.includes(view)).length]));
const oxInteger = n => new Intl.NumberFormat('es-CL').format(n);
const oxPercent = (n,d) => d ? new Intl.NumberFormat('es-CL',{style:'percent',minimumFractionDigits:1,maximumFractionDigits:1}).format(n/d) : '—';
const oxProviders = rows => new Set(rows.map(r => r.provider)).size;
const oxOwn = rows => rows.filter(r => r.competition === 'Propia').length;
const oxIds = ids => ids.map(anchorRecord).join(' ');
const oxHeading = (id, title) => `<h3 class="ox-anchor" id="${id}" tabindex="-1">${title}</h3>`;
const oxEmpty = message => `<p class="ox-empty">${message}</p>`;

function oxSelect(key, [label, options]){
  return `<label>${label}<select id="ox-filter-${key}" class="select" data-ox-filter="${key}">${option('Todos', oxState.filters[key] || 'Todos')}${
    options.map(entry => {
      const [value, name] = Array.isArray(entry) ? entry : [entry, entry];
      return `<option value="${esc(value)}" ${oxState.filters[key] === value ? 'selected' : ''}>${esc(name)}</option>`;
    }).join('')}</select></label>`;
}

function oxViewButton(view){
  return `<button class="ox-choice" type="button" data-ox-view="${view}" aria-pressed="${oxState.view===view}">${oxTitles[view]} · ${oxViewSizes[view]}</button>`;
}

function oxRender(providerPanels=''){
 const primaryKeys=['theme','segment','modality'];
 const advancedKeys=['provider','evidence','roles','competition','unit','verification','group'];
 return `<section id="oferta-analisis" class="ox-analysis ox-anchor" tabindex="-1" aria-labelledby="ox-title">
   <div class="ox-heading"><div class="eyebrow">Oferta investigada · Corte 16 nov 2026</div>
     <h2 id="ox-title">Análisis de la oferta</h2>
     <p>Recorre los resultados en orden. Primero observa quién ofrece formación; después explora temas, públicos y precios. Todo se actualiza al aplicar filtros.</p>
     <nav class="ox-jump" aria-label="Dentro del análisis"><a href="#oferta-temas">Temas</a><a href="#oferta-publicos">Públicos</a><a href="#oferta-precios">Precios</a><a href="#oferta-insights">Hallazgos</a><a href="#oferta-trazas">Fichas filtradas</a></nav>
   </div>
   ${providerPanels}
   <section class="panel ox-panel ux-filter-panel" aria-labelledby="ux-filters-title">
     <div class="ux-filter-intro"><div><h3 id="ux-filters-title">Explorar la oferta</h3><p>Elige qué universo quieres analizar. Los filtros que apliques afectan todos los apartados siguientes; siempre puedes restablecerlos.</p></div></div>
     <fieldset class="ox-fieldset"><legend>Vista de referencia</legend><p class="xs muted">De todo lo investigado al subconjunto con mayor cercanía al tercer sector chileno.</p><div class="ox-views">${['total','pertinente','osfl_chile'].map(oxViewButton).join('')}</div></fieldset>
     <details class="ux-view-detail"><summary>Ver variante de clasificación para Chile</summary><div class="ox-sensitivity">${oxViewButton(ox.views[4])}<span class="xs muted">Suma dos fichas con condiciones por confirmar. Puedes abrirlas: ${oxIds(['O019','O385'])}.</span></div></details>
     <div class="ux-filter-primary"><div class="ux-filter-label">Filtros principales</div><div class="ox-filters">${primaryKeys.map(k=>oxSelect(k,oxFilterOptions[k])).join('')}</div></div>
     <button type="button" class="ux-own-button" data-ox-own aria-pressed="${oxState.includeOwn}" aria-label="Incluir los cursos de Simón de Cirene"><span class="ux-switch" aria-hidden="true"><span></span></span><span><strong>Incluir los cursos de Simón de Cirene</strong><small>Actívalo para comparar también la oferta propia; desactívalo para ver solo ofertas externas.</small></span></button>
     <details class="ux-advanced" id="ux-advanced"><summary>Filtros avanzados · proveedor, evidencia, precio y más</summary><p class="xs muted">Opciones para analizar segmentos, proveedores, unidades de cobro y calidad de las fichas. Los filtros principales siguen activos.</p><div class="ox-filters">${advancedKeys.map(k=>oxSelect(k,oxFilterOptions[k])).join('')}</div></details>
     <div class="ox-filter-actions"><button class="btn btn-outline" type="button" data-ox-reset>Restablecer filtros</button><p id="ox-summary" role="status" aria-live="polite"></p></div>
     <div class="ux-active-summary" id="ux-active-summary" aria-live="polite"></div>
   </section>
   <section class="panel ox-panel" aria-labelledby="oferta-temas">
     ${oxHeading('oferta-temas','¿Qué temas predominan?')}
     <p class="ux-section-lead">Aquí se agrupan las ofertas según <strong>su tema principal</strong>. La barra más larga indica que levantamos más fichas de ese tema, no que exista más demanda.</p>
     <div class="ux-howto"> <span aria-hidden="true">☝</span><span><strong>Prueba los gráficos:</strong> selecciona cualquier tema para filtrar el público, los precios, los hallazgos y las fichas que vienen después. Vuelve a pulsarlo para quitar el filtro.</span></div>
     <div id="ox-themes"></div>
   </section>
   <section class="panel ox-panel" aria-labelledby="oferta-publicos">
     ${oxHeading('oferta-publicos','¿A quién se dirige la oferta?')}
     <p class="ux-section-lead">Conocer el público declarado permite distinguir cursos diseñados para fundaciones de otros que podrían adaptarse. Una ficha puede mencionar varios públicos.</p>
     <div class="ux-howto"><span aria-hidden="true">☝</span><span><strong>También puedes filtrar aquí:</strong> elige una tarjeta de público. Los precios, los hallazgos y las fichas mostrarán los resultados de ese público. Para profundizar, abre «Cruzar públicos con temas».</span></div>
     <div id="ox-publics"></div>
   </section>
   <section class="panel ox-panel" aria-labelledby="oferta-precios">
     ${oxHeading('oferta-precios','¿Cuánto cuestan las ofertas?')}
     <p class="ux-section-lead">No todos los precios se pueden comparar entre sí. Una compra individual es distinta de una suscripción, un programa de muchas horas o una tarifa para una organización completa.</p>
     <div class="ux-howto"><span aria-hidden="true">☝</span><span><strong>Filtra por precio:</strong> cuando haya una muestra comparable suficiente, pulsa una banda para analizar solo esas fichas. Vuelve a pulsarla para quitarla.</span></div>
     <div id="ox-prices"></div>
   </section>
   <section class="panel ox-panel" aria-labelledby="oferta-insights">
     ${oxHeading('oferta-insights','Hallazgos objetivos de la oferta')}
     <p class="ux-section-lead">Estos datos describen lo que registramos: concentración de temas, formación por públicos, modalidades y disponibilidad de precios. No son recomendaciones de cursos ni estimaciones de demanda.</p>
     <div id="ox-insights"></div>
   </section>
   <section class="panel ox-panel" aria-labelledby="oferta-trazas">
     ${oxHeading('oferta-trazas','Fichas del análisis')}
     <p class="ux-section-lead">Esta tabla contiene únicamente las ofertas que cumplen <strong>todos los filtros activos</strong>. Selecciona el identificador de cualquier curso para abrir su ficha a un costado, con la fuente y el registro original. El catálogo sin filtros permanece en Métodos y Fuentes.</p>
     <div id="ox-records"></div>
     <details class="ux-method-detail"><summary>Cómo se construyeron estas clasificaciones y dónde consultar la metodología</summary>
       <p class="xs muted" style="margin-top:8px">Se asignó un tema principal por ficha, públicos explícitos o inferidos y una modalidad de precio por registro. Una baja frecuencia en esta muestra no demuestra demanda desatendida. Los precios sin unidad comparable permanecen separados.</p>
       <div class="ox-links">${openLink('https://drive.google.com/file/d/1MWthN8pd7VZ0fx9ahJV8mArN6RItu2Zs/view','Diccionario de categorías')}${openLink('https://drive.google.com/file/d/14ihioTs9vQ90Cmjj0TsP820oL7euGCI3/view','Públicos y temas')}${openLink('https://drive.google.com/file/d/1TtUO0sYeWATPFNPZLvICqmLYpOBwhY69/view','Criterios de precios')}${openLink('https://drive.google.com/file/d/1g3LHIyoaCqfr4KrCcn1tisy5mRh-owYc/view','Contraevidencia')}<button class="btn btn-outline" type="button" data-ox-download>Descargar clasificación CSV</button></div>
     </details>
   </section>
 </section>`;
}

function oxMatches(row, key, value){
  if(key === 'segment'){
    return value === 'S00' ? row.evidence === 'No consta' : row.explicit.includes(value) || row.inferred.includes(value);
  }
  return key === 'roles' ? row.roles.includes(value) : row[key] === value;
}

function oxBaseFiltered(){
 return ox.records.filter(row=>row.views.includes(oxState.view) && (oxState.includeOwn || row.competition!=='Propia') && Object.entries(oxState.filters).every(([k,v])=>oxMatches(row,k,v)));
}
function oxFiltered(){
 const rows=oxBaseFiltered();
 return oxState.priceBand ? rows.filter(row=>row.group==='G01' && row.band===oxState.priceBand) : rows;
}

function oxBar(label, count, total, summary, controls = ''){
  return `<div class="ox-chart-row">${controls || `<span>${esc(label)}</span>`}
    <div class="ox-track" aria-hidden="true"><span style="width:${total ? count/total*100 : 0}%"></span></div>
    <span class="ox-num">${summary}</span></div>`;
}

function oxThemeRows(rows){
  return oxThemes.map(code => [code, rows.filter(row => row.theme === code)])
    .sort((a,b) => b[1].length-a[1].length);
}

function oxShowThemes(rows){
  if(!rows.length) return oxEmpty('Sin fichas para mostrar por tema.');
  return `<div class="ox-chart">${oxThemeRows(rows).filter(([,entries])=>entries.length).map(([code, entries]) => oxBar(ox.labels[code], entries.length, rows.length,
    `${entries.length}/${rows.length} · ${oxPercent(entries.length,rows.length)} · ${oxProviders(entries)} prov. · ${oxOwn(entries)} propias`,
    `<button class="linked" type="button" data-ox-theme="${code}" aria-pressed="${oxState.filters.theme===code}">${esc(ox.labels[code])}</button>`)).join('')}</div>`;
}

function oxShowPublics(rows){
 if(!rows.length) return oxEmpty('No hay fichas con esta combinación de filtros. Puedes restablecer filtros para volver a explorar.');
 const evidence=oxEvidence.map(k=>rows.filter(row=>row.evidence===k).length);
 const tiles=oxSegments.filter(c=>c!=='S00').map((segment,i)=>{
   const explicit=rows.filter(r=>r.explicit.includes(segment)).length;
   const inferred=rows.filter(r=>r.inferred.includes(segment)).length;
   const count=explicit+inferred;
   const active=oxState.filters.segment===segment;
   const names={S01:'Fundaciones y OSC',S02:'MIPYME y emprendimientos',S03:'Empresas y profesionales',S04:'Sector público',S05:'Estudiantes y academia',S06:'Público general'};
   return `<button class="ux-audience-card" data-ox-audience="${segment}" type="button" aria-pressed="${active}"><span class="ux-audience-icon" aria-hidden="true">${['♧','◇','▣','⌂','▤','◯'][i]}</span><strong>${esc(names[segment])}</strong><span class="ux-audience-total">${count} <small>fichas</small></span><span class="ux-audience-breakdown">${explicit} declaradas · ${inferred} inferidas</span><span class="ux-audience-action">${active?'Filtro activo ✓':'Filtrar por este público →'}</span></button>`;
 }).join('');
 const themes=oxThemeRows(rows).filter(([,entries])=>entries.length);
 const matrix=themes.map(([code,entries])=>{
   const cols=oxSegments.map(segment=>{
     const e=entries.filter(r=>r.explicit.includes(segment)).length;
     const i=entries.filter(r=>r.inferred.includes(segment)).length;
     const missing=entries.filter(r=>r.evidence==='No consta').length;
     const count=segment==='S00'?missing:e+i;
     const label=segment==='S00'?`${missing}`:`${e} declaradas · ${i} inferidas`;
     const pressed=oxState.filters.theme===code && oxState.filters.segment===segment;
     return `<td style="background:rgba(8,123,119,${count/entries.length*.15})"><button class="linked ux-matrix-cell" type="button" data-ox-theme="${code}" data-ox-segment="${segment}" aria-pressed="${pressed}" aria-label="${esc(ox.labels[code])}, ${esc(oxShort[segment])}: ${label}">${segment==='S00'?missing:`${e} / ${i}`}</button></td>`;
   }).join('');
   return `<tr><th scope="row">${esc(ox.labels[code])}</th><td>${entries.length}</td>${cols}</tr>`;
 }).join('');
 return `<div class="ux-evidence-summary" aria-label="Calidad de la información sobre públicos">
    <div class="ux-evidence-tile"><span>El público está declarado</span><strong>${evidence[0]}</strong><small>La ficha lo menciona directamente</small></div>
    <div class="ux-evidence-tile"><span>El público fue inferido</span><strong>${evidence[1]}</strong><small>Clasificado a partir de indicios</small></div>
    <div class="ux-evidence-tile"><span>No se pudo identificar</span><strong>${evidence[2]}</strong><small>No hay información suficiente</small></div>
  </div><h4 class="ux-subheading">Explora por público</h4><div class="ux-audience-grid">${tiles}</div>
  <p class="ux-caution">Las categorías no son excluyentes: una oferta puede estar dirigida a varios públicos. Las cifras no representan personas matriculadas.</p>
  <details class="ux-matrix-detail"><summary>Cruzar públicos con temas · ver matriz detallada</summary><p class="xs muted">Cada fila es un tema. «Declaradas / Inferidas» muestra cuántas fichas de ese tema mencionan un público o permiten inferirlo. Pulsa una celda para combinar tema y público en los siguientes análisis.</p>
    <div class="ox-scroll" tabindex="0" role="region" aria-label="Tabla desplazable de temas y públicos"><table class="ox-heat"><caption>Fichas por tema y público · declaradas / inferidas</caption><thead><tr><th scope="col">Tema</th><th scope="col">Total</th>${oxSegments.map(c=>`<th scope="col">${esc(oxShort[c])}</th>`).join('')}</tr></thead><tbody>${matrix}</tbody></table></div>
  </details>`;
}

function oxQuantile(values, fraction){
  const position = (values.length - 1) * fraction;
  const index = Math.floor(position);
  return values[index] + (values[Math.min(index+1,values.length-1)] - values[index]) * (position-index);
}

const uxBandNames={'1–9.999':'Hasta $9.999','10.000–19.999':'$10.000 a $19.999','20.000–49.999':'$20.000 a $49.999','50.000–99.999':'$50.000 a $99.999','100.000+':'$100.000 o más'};
const uxPriceCategories=[
 ['Compra individual comparable',['G01'],'Precio de curso asincrónico por compra individual, observado para el análisis de bandas'],
 ['Precio individual promocional',['G02','G03','G04'],'Precio por curso publicado en promoción o con modalidad por comprobar'],
 ['Cursos, programas y paquetes',['G05','G09','G10','G11'],'Incluye cohortes, programas largos, paquetes y formación presencial'],
 ['Precios por organización o grupo',['G07','G08'],'No equivalen a una compra individual sin revisar condiciones'],
 ['Producto con unidad por confirmar',['G06'],'No consta si la cifra corresponde a un participante o producto completo'],
 ['Acceso gratuito o parcialmente gratuito',['G12','G13','G14','G15'],'Gratuidad total, documental, parcial o condicionada'],
 ['Suscripción y acceso sin importe individual',['G16','G17'],'Precio por licencia/plan o acceso sin tarifa de curso confirmada'],
 ['Sin información comercial suficiente',['G18'],'No se observó un monto y unidad comercial verificables']
];
function oxShowPrices(rows,baseRows=rows){
 if(!baseRows.length) return oxEmpty('No hay ofertas para comparar con esta combinación de filtros.');
 const positives=baseRows.filter(r=>r.priceState==='positivo').length;
 const zeros=baseRows.filter(r=>r.priceState==='cero').length;
 const missing=baseRows.length-positives-zeros;
 const eligible=baseRows.filter(r=>r.group==='G01');
 const values=eligible.map(r=>r.amount).sort((a,b)=>a-b);
 const selected=oxState.priceBand;
 const cards=`<div class="ux-price-numbers"><div><span>Con monto positivo</span><strong>${positives}</strong></div><div><span>Con precio $0 publicado</span><strong>${zeros}</strong></div><div><span>Sin cifra verificable</span><strong>${missing}</strong></div></div>`;
 const countOther=positives+zeros-eligible.length;
 const why=`<div class="ux-price-context"><h4>¿Por qué solo ${eligible.length} para comparar?</h4><p>Las <strong>${baseRows.length} fichas</strong> tienen distintos modos de pago. <strong>${eligible.length}</strong> corresponden al grupo comparable de <strong>compras individuales de cursos asincrónicos en CLP</strong>, observadas en una sesión de consulta. Otros <strong>${countOther}</strong> registros tienen una cifra, pero su modalidad o unidad de cobro es distinta. <strong>${missing}</strong> no tienen importe numérico.</p><p>El filtro de bandas solo se aplica a esas ${eligible.length} fichas comparables. No estamos afirmando que las demás no tengan precio.</p></div>`;
 let distribution='';
 if(eligible.length>=ox.minStats){
   const med=oxInteger(oxQuantile(values,.5));
   const q1=oxInteger(oxQuantile(values,.25)),q3=oxInteger(oxQuantile(values,.75));
   distribution=`<div class="ux-price-stat"><span>Mediana del grupo comparable</span><strong>$${med} CLP</strong><small>La mitad central se sitúa entre $${q1} y $${q3} CLP. Los precios observados pueden cambiar.</small></div>
     <h4 class="ux-subheading">Filtrar por banda de precio</h4><div class="ux-price-band-grid">${ox.bands.map(b=>{
       const n=eligible.filter(r=>r.band===b).length;
       return `<button class="ux-price-band" type="button" data-ox-band="${esc(b)}" aria-pressed="${selected===b}" ${n===0?'disabled':''}><span class="ux-price-band-head"><strong>${esc(uxBandNames[b])}</strong><b>${n}</b></span><span class="ux-price-track"><i style="width:${eligible.length?n/eligible.length*100:0}%"></i></span><small>${oxPercent(n,eligible.length)} de las comparables ${selected===b?'· seleccionado':''}</small></button>`;
     }).join('')}</div>`;
 } else if(eligible.length){
   distribution=`<div class="ux-caution">Solo ${eligible.length} fichas cumplen las condiciones de precio comparable. Se requieren al menos ${ox.minStats} para mostrar una distribución y una mediana fiables con el criterio del estudio. Prueba con una vista menos restringida.</div>`;
 } else {distribution=`<div class="ux-caution">En este subconjunto no hay compras individuales del grupo comparable. Eso no significa que todos los cursos sean gratuitos.</div>`;}
 const groupRows=uxPriceCategories.map(([title,ids,reason])=>{
   const n=baseRows.filter(r=>ids.includes(r.group)).length;
   return n?`<tr><th scope="row">${esc(title)}</th><td>${n}</td><td>${esc(reason)}</td></tr>`:'';
 }).join('');
 return `${cards}${why}${selected?`<div class="ux-active-band"><span>Banda activa: <strong>${esc(uxBandNames[selected])}</strong> · ${rows.length} fichas en el análisis.</span><button type="button" data-ox-clear-band>Quitar filtro de precio ✕</button></div>`:''}${distribution}
   <details class="ux-price-detail"><summary>¿Qué pasa con las otras ofertas? Ver tipos de precio y acceso</summary><p>Para evitar sumas engañosas, <strong>cada ficha pertenece a una sola categoría de precio o acceso</strong>. Así distinguimos compra individual, suscripciones, gratuidad, tarifas institucionales y productos sin monto comprobado. Estas categorías son de clasificación, no de calidad.</p>
     <div class="ox-scroll" tabindex="0" role="region" aria-label="Tipos de precio y acceso"><table><caption>Ofertas según la forma de cobro o acceso</caption><thead><tr><th>Tipo de acceso o precio</th><th>Fichas</th><th>Por qué se distingue</th></tr></thead><tbody>${groupRows}</tbody></table></div>
   </details>`;
}

function uxDecisionPanels(){
 const items=ox.opportunities.slice(0,2);
 return `<section class="panel section ux-decision-section" id="conclusiones-alternativas"><div class="ux-kicker">Oferta + demanda + evaluación</div><h2 class="section-title">¿Por qué destacan estas dos alternativas?</h2>
 <p>Estas dos propuestas se priorizaron provisionalmente por su relevancia para tareas de organizaciones, señales públicas, diferenciación potencial y factibilidad del formato. El puntaje es una comparación interna, <strong>no una medición de ventas ni una prueba con alumnos</strong>.</p>
 <div class="ux-decision-grid">${items.map((item,i)=>{
   const linked=item.o_ids.split(' ');
   const status=i===0?'Primera alternativa para pilotear, condicionada':'Alternativa de respaldo, condicionada';
   const rating=item.puntaje_referencia_corte_previo?.match(/ref\.\s*(\d,[0-9]{2})/i)?.[1]||'—';
   return `<article class="ux-decision-card"><span class="ux-kicker">${status}</span><h3>${esc(item.titulo)}</h3><div class="ux-decision-score">${rating}<small>/5 · evaluación previa</small></div>
     <p><strong>Para quién y para qué:</strong> ${esc(item.segmento)}. ${esc(item.tarea)}</p>
     <p><strong>Por qué se consideró:</strong> ${esc(item.recomendacion)}</p>
     <p><strong>Qué falta validar:</strong> ${esc(item.dato_decisivo)}</p>
     <button class="btn btn-outline btn-small" type="button" data-open="${esc(item.concepto)}">Abrir ficha de evaluación ↗</button>
     <details><summary>Ver alternativas, límites y evidencia</summary>
       <p><strong>Opciones gratuitas:</strong> ${esc(item.gratis)}</p><p><strong>Opciones pagadas:</strong> ${esc(item.pagados)}</p><p><strong>Oferta de Simón:</strong> ${esc(item.propia)}</p>
       <p><strong>Señales de demanda:</strong> ${esc(item.demanda)}</p><p><strong>Contraevidencia:</strong> ${esc(item.contra)}</p>
       <div class="ux-links">Fichas de oferta ${oxIds(linked)}</div><div class="ux-links">Registros de demanda ${oxIds(item.d_ids.split(' '))}</div>
     </details></article>`;
 }).join('')}</div></section>`;
}
function oxOpportunity(item, rows){
  const primary = item.concepto === 'C003';
  const linked = item.o_ids.split(' ');
  const matches = rows.filter(r => linked.includes(r.id)).length;
  const status = primary ? 'Primer piloto condicionado' : item.concepto === 'C002' ? 'Respaldo condicionado' : 'Hipótesis en seguimiento';
  const full = primary || item.concepto === 'C002';
  const evidence = `<p><strong>Sustitutos gratuitos.</strong> ${esc(item.gratis)}</p><p><strong>Alternativas pagadas.</strong> ${esc(item.pagados)}</p>
    <p><strong>Oferta propia.</strong> ${esc(item.propia)}</p>`;
  return `<article class="ox-opportunity" data-ox-concept="${item.concepto}">
    <h4>${anchorRecord(item.concepto)} · ${esc(item.titulo)}</h4>
    <p class="ox-status">${status}${full ? ' · '+esc(item.puntaje_referencia_corte_previo.split('ref. ').pop())+' del corte previo' : ''}</p>
    ${full ? `<p>${esc(item.segmento)}</p><p>${esc(item.tarea)}</p>` : ''}
    <p>${esc(item.recomendacion)}</p>
    ${full ? `<p><strong>Contraevidencia.</strong> ${esc(item.contra)}</p>
    <p class="ox-next"><strong>Dato que cambiaría la decisión.</strong> ${esc(item.dato_decisivo)}</p>
    <div class="ox-links"><strong>Oferta</strong> ${oxIds(linked)}</div>
    <div class="ox-links"><strong>Demanda</strong> ${oxIds(item.d_ids.split(' '))}</div>
    <p class="xs muted ox-match">${matches}/${linked.length} fichas vinculadas coinciden con la vista y los filtros.</p>` : ''}
    <details><summary>${full ? 'Sustitutos, demanda y sensibilidad' : 'Evidencia y condición para avanzar'}</summary>
      ${full ? evidence : `<p><strong>Contraevidencia.</strong> ${esc(item.contra)}</p><p>${esc(item.dato_decisivo)}</p>
      <div class="ox-links">${oxIds([...linked, ...item.d_ids.split(' ')])}</div>`}
      <p><strong>Señales observadas.</strong> ${esc(item.demanda)}</p>
      <p><strong>Sensibilidad.</strong> ${esc(item.sensibilidad)}</p>
      <p class="xs muted">${esc(item.abundancia_por_vista)}</p>
    </details>
  </article>`;
}

function oxShowOpportunities(rows){
  const main = ox.opportunities.slice(0,2).map(item => oxOpportunity(item,rows)).join('');
  const reserve = ox.opportunities.slice(2).filter(item => !oxState.filters.theme || item.tema === oxState.filters.theme);
  return main + (reserve.length ? `<details><summary>Otras hipótesis de la matriz</summary>${reserve.map(item => oxOpportunity(item,rows)).join('')}</details>` : '');
}

function oxShowInsights(rows){
 if(!rows.length) return oxEmpty('No hay registros suficientes con los filtros elegidos.');
 const counts=oxThemeRows(rows).filter(([,r])=>r.length);
 const top=counts.slice(0,3), low=[...counts].reverse().slice(0,3);
 const total=n=>n.reduce((x,[,rs])=>x+rs.length,0);
 const named=items=>items.map(([c,r])=>`<li><span>${esc(ox.labels[c])}</span><strong>${r.length}</strong></li>`).join('');
 const explicit=rows.filter(r=>r.evidence==='Explícito').length;
 const noEvidence=rows.filter(r=>r.evidence==='No consta').length;
 const async=rows.filter(r=>String(r.modality||'').startsWith('Asincrónica')).length;
 return `<div class="ux-insight-grid">
   <article class="ux-insight-card"><div class="ux-kicker">Áreas más registradas</div><h4>Temas con más fichas</h4><ol>${named(top)}</ol><p>Los tres primeros reúnen <strong>${total(top)} de ${rows.length}</strong> fichas (${oxPercent(total(top),rows.length)}).</p></article>
   <article class="ux-insight-card"><div class="ux-kicker">Áreas menos registradas</div><h4>Temas con menos fichas</h4><ol>${named(low)}</ol><p>Los tres últimos reúnen <strong>${total(low)} de ${rows.length}</strong> fichas. Esto refleja cobertura observada, no necesidad de mercado.</p></article>
   <article class="ux-insight-card"><div class="ux-kicker">Evidencia de destinatarios</div><h4>¿Qué sabemos del público?</h4><div class="ux-insight-number">${explicit}/${rows.length}</div><p>Fichas con público objetivo identificado de forma explícita. En <strong>${noEvidence}</strong> no hay evidencia suficiente para atribuirlo.</p></article>
   <article class="ux-insight-card"><div class="ux-kicker">Formato de las ofertas</div><h4>Modalidad declarada</h4><div class="ux-insight-number">${async}/${rows.length}</div><p>Fichas clasificadas como asincrónicas o con una variante asincrónica documentada. La modalidad de otras ofertas puede diferir o necesitar confirmación.</p></article>
  </div><p class="ux-caution">Los temas describen áreas formativas y tareas principales del catálogo, no habilidades individuales medidas. Estas cifras cambian según los filtros y no permiten concluir demanda, ventas o brechas insatisfechas.</p>`;
}
function oxRecordRows(rows){
  if(!rows.length) return oxEmpty('Sin coincidencias. Cambia la vista o restablece los filtros.');
  const size = 20;
  const lastPage = Math.ceil(rows.length/size)-1;
  oxState.page=Math.max(0,Math.min(oxState.page,lastPage));
  const start = oxState.page*size;
  const table = rows.slice(start,start+size).map(row => {
    const record = byId.get(row.id);
    const price = row.amount === null ? 'Sin cifra' : `${row.currency} ${oxInteger(row.amount)}`;
    const audiences = [...row.explicit, ...row.inferred].map(key => oxShort[key]).join(' · ') || 'Sin evidencia';
    return `<tr><td>${anchorRecord(row.id)}</td><td class="ox-detail-title">${esc(record.raw[3])}<br><span class="xs muted">${esc(row.provider)}</span></td>
    <td>${esc(ox.labels[row.theme])}</td><td>${esc(audiences)}<br><span class="xs muted">${esc(row.evidence)}</span></td>
    <td>${esc(price)}<br><span class="xs muted">${esc(row.unit)}</span></td></tr>`;
  }).join('');
  return `<div class="ox-scroll" tabindex="0" role="region" aria-label="Fichas filtradas"><table>
    <caption>Mostrando ${start+1}–${Math.min(start+size,rows.length)} de ${rows.length} fichas</caption>
    <thead><tr><th scope="col">ID</th><th scope="col">Producto y proveedor</th><th scope="col">Tema</th><th scope="col">Público</th><th scope="col">Precio publicado</th></tr></thead><tbody>${table}</tbody></table></div>
    <div class="controls ox-record-pages"><button data-ox-page="prev" ${oxState.page===0?'disabled':''}>Anterior</button>
    <button data-ox-page="next" ${oxState.page===lastPage?'disabled':''}>Siguiente</button></div>`;
}

function oxPaint(){
 const summary=document.getElementById('ox-summary');if(!summary)return;
 const base=oxBaseFiltered(), rows=oxFiltered();
 const viewTotal=ox.records.filter(r=>r.views.includes(oxState.view) && (oxState.includeOwn || r.competition!=='Propia')).length;
 summary.textContent=`${rows.length} de ${viewTotal} fichas · ${oxProviders(rows)} proveedores · ${oxOwn(rows)} propias`;
 const extras=[];
 if(oxState.priceBand) extras.push('Precio: '+uxBandNames[oxState.priceBand]);
 for(const [k,v] of Object.entries(oxState.filters)) extras.push(oxFilterOptions[k]?.[0]+': '+String(k==='theme'||k==='segment'?ox.labels[v]:v));
 if(!oxState.includeOwn) extras.push('Sin oferta propia');
 document.getElementById('ux-active-summary').textContent=extras.length?'Filtros activos: '+extras.join(' · '):'Mostrando la vista seleccionada sin filtros adicionales.';
 document.getElementById('ox-themes').innerHTML=oxShowThemes(rows);
 document.getElementById('ox-publics').innerHTML=oxShowPublics(rows);
 document.getElementById('ox-prices').innerHTML=oxShowPrices(rows,base);
 document.getElementById('ox-insights').innerHTML=oxShowInsights(rows);
 document.getElementById('ox-records').innerHTML=oxRecordRows(rows);
}
function oxApply(filters){
 oxState.filters=filters;oxState.page=0;
 document.querySelectorAll('[data-ox-filter]').forEach(el=>{el.value=filters[el.dataset.oxFilter]||'Todos';});
 document.querySelectorAll('[data-ox-view]').forEach(el=>el.setAttribute('aria-pressed',String(el.dataset.oxView===oxState.view)));
 const own=document.querySelector('[data-ox-own]');if(own){own.setAttribute('aria-pressed',String(oxState.includeOwn));own.disabled=false;own.querySelector('small').textContent='Actívalo para comparar también la oferta propia; desactívalo para ver solo ofertas externas.';}
 oxPaint();
}

function oxDownload(){
  const columns = ['id','theme','secondary','explicit','inferred','evidence','roles','roleEvidence','provider','competition','modality','verification','publication','unit','group','priceState','band','amount','currency','views','segmentBasis','priceReason'];
  const table = [columns, ...ox.records.map(row => columns.map(key => row[key]))];
  const text = table.map(row => row.map(value => {
    const str = Array.isArray(value) ? value.join('|') : String(value ?? '');
    return '"'+str.replaceAll('"','""')+'"';
  }).join(';')).join('\r\n');
  const url = URL.createObjectURL(new Blob(['\ufeff'+text],{type:'text/csv;charset=utf-8'}));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'SDC_OX-5_Clasificacion_v1.0.0.csv';
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

const oxAnchors = new Set(['oferta-analisis','oferta-temas','oferta-publicos','oferta-precios','oferta-insights','oferta-trazas']);
function oxGo(id){
  if(id==='oferta-catalogo'||id==='metodo-catalogo'){goToCatalogue();return;}
  if(state.view !== 'oferta') render('oferta');
  const target = document.getElementById(id);
  target.focus({preventScroll:true});
  target.scrollIntoView({block:'start', behavior:'instant'});
}

document.addEventListener('change', event => {
  const key = event.target.dataset.oxFilter;
  if(!key) return;
  const filters = {...oxState.filters};
  if(event.target.value === 'Todos') delete filters[key];
  else filters[key] = event.target.value;
  oxApply(filters);
});

document.addEventListener('click', event => {
  const link = event.target.closest('.ox-jump a[href^="#"]');
  if(link && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey){
    event.preventDefault();
    history.pushState(null,'',link.hash);
    oxGo(link.hash.slice(1));
    return;
  }
  const control = event.target.closest('[data-ox-view],[data-ox-reset],[data-ox-theme],[data-ox-audience],[data-ox-own],[data-ox-band],[data-ox-clear-band],[data-ox-download],[data-ox-page]');
  if(!control) return;
  const {oxView,oxTheme,oxSegment,oxPage,oxAudience,oxBand} = control.dataset;
  if(oxView){
    oxState.view = oxView;
    oxApply({...oxState.filters});
  } else if(control.hasAttribute('data-ox-own')){
    oxState.includeOwn=!oxState.includeOwn;
    oxApply({...oxState.filters});
    document.querySelector('[data-ox-own]')?.focus({preventScroll:true});
  } else if(oxBand){
    oxState.priceBand=oxState.priceBand===oxBand?null:oxBand;
    oxApply({...oxState.filters});
    document.querySelector(`[data-ox-band="${CSS.escape(oxBand)}"]`)?.focus({preventScroll:true});
  } else if(control.hasAttribute('data-ox-clear-band')){
    oxState.priceBand=null;oxApply({...oxState.filters});
  } else if(oxAudience){
    const filters={...oxState.filters};
    if(filters.segment===oxAudience)delete filters.segment;
    else filters.segment=oxAudience;
    oxApply(filters);
    document.querySelector(`[data-ox-audience="${oxAudience}"]`)?.focus({preventScroll:true});
  } else if(oxTheme){
    const filters = {...oxState.filters};
    const active = filters.theme===oxTheme && (!oxSegment || filters.segment===oxSegment);
    if(active) {
      delete filters.theme;
      if(oxSegment) delete filters.segment;
    } else {
      filters.theme = oxTheme;
      if(oxSegment) filters.segment = oxSegment;
    }
    oxApply(filters);
    document.getElementById(oxSegment?'ox-filter-segment':'ox-filter-theme').focus({preventScroll:true});
  } else if(oxPage){
    oxState.page += oxPage==='next' ? 1 : -1;
    document.getElementById('ox-records').innerHTML = oxRecordRows(oxFiltered());
    const next = document.querySelector(`[data-ox-page="${oxPage}"]:not(:disabled)`);
    (next || document.querySelector('#ox-records .ox-scroll')).focus({preventScroll:true});
  } else if(control.hasAttribute('data-ox-reset')){
    oxState.view = 'total';oxState.includeOwn=true;oxState.priceBand=null;
    oxApply({});
  } else {
    oxDownload();
  }
});

window.addEventListener('hashchange', () => {
  const hash = window.location.hash.slice(1);
  if(hash==='metodo-catalogo'||hash==='oferta-catalogo') goToCatalogue();
  else if(oxAnchors.has(hash)) oxGo(hash);
  else if(labels[hash]) render(hash);
});

document.addEventListener('keydown', event => {
  const overlay = document.getElementById('overlay');
  if(event.key !== 'Tab' || !overlay.classList.contains('open')) return;
  const controls = [...overlay.querySelectorAll('a[href],button:not([disabled])')].filter(el => el.getClientRects().length);
  const edge = event.shiftKey ? controls[0] : controls[controls.length-1];
  if(document.activeElement === edge){
    event.preventDefault();
    (event.shiftKey ? controls[controls.length-1] : controls[0]).focus();
  }
});

const oxInitial = window.location.hash.slice(1);
if(oxInitial==='metodo-catalogo'||oxInitial==='oferta-catalogo') goToCatalogue();
else if(oxAnchors.has(oxInitial)) oxGo(oxInitial);
else render(labels[oxInitial] ? oxInitial : 'inicio');

