/* UX-11.4 candidate only. The baseline v1.0.12 is built separately and unchanged. */
const ux4Data=JSON.parse(document.getElementById('ux114-cards').textContent);
const ux4Cards=Array.isArray(ux4Data)?ux4Data:ux4Data.cards;
const ux4Map=new Map(ux4Cards.map(c=>[c.concepto_id,c]));
let ux4Selected='C003';
const ux4Status={
  PRIORIDAD_CONDICIONAL_1:'Primera hipótesis · condicionada',
  PRIORIDAD_CONDICIONAL_2:'Segunda hipótesis · condicionada',
  RESERVA:'En reserva', EXPLORATORIA:'Exploratoria', POSPONER:'Posponer'
};
function ux4Score(c){const m=c.puntaje_historico_no_recalculado.match(/ref\.\s*(\d,[0-9]{2})/);return m?m[1]:'—'}
function ux4Evidence(d){
  const kind={DIRECTO:'Acceso directo',INDICE_OFICIAL:'Índice oficial',PARCIAL:'Acceso parcial'}[d.corroboracion]||d.corroboracion;
  const amount=d.valor==null?esc(d.unidad||'Caso cualitativo'):esc(d.valor)+' '+esc(d.unidad);
  return '<li class="ux4-evidence"><div class="ux4-evidence-row">'+anchorRecord(d.id)+
    '<span class="ux4-badge">'+esc(kind)+'</span></div><strong>'+esc(tline(d.tipo_senal,110))+'</strong>'+
    '<p>'+esc(tline(d.hecho_observado,260))+'</p><small><b>Unidad original:</b> '+amount+
    ' · <b>Público:</b> '+esc(tline(d.publico,135))+'</small>'+
    '<details><summary>Limitación y fuente</summary><p>'+esc(d.limitacion)+'</p>'+
    '<p>'+openLink(d.url,'Abrir fuente original ↗')+'</p></details></li>';
}
function ux4Offer(o){
  const category={SUSTITUTO_PARCIAL_POTENCIAL:'Sustituto parcial posible',ADYACENTE_NO_EQUIVALENTE:'Oferta adyacente',
  DESCARTAR_DESAJUSTE:'Desajuste documental',NO_CLASIFICADA_UX112:'No clasificada en UX-11.2'}[o.clasificacion_documental_ux112];
  const label=o.solapamiento_oferta_propia?'Oferta propia de Simón / recurso propio':
      o.contraste_web_ux112==='WEB_CONTRASTADA_FICHA'?'Ficha web contrastada en UX-11.2':'Referencia del catálogo';
  return '<li class="ux4-offer"><div class="ux4-evidence-row">'+anchorRecord(o.id)+'<strong>'+esc(tline(o.nombre,145))+'</strong></div>'+
    '<span class="ux4-badge">'+esc(label)+'</span>'+
    '<p><b>Tarea:</b> '+esc(tline(o.tarea,160))+'</p><p><b>Público:</b> '+esc(tline(o.publico,160))+'</p>'+
    '<small>'+esc(category||'Clasificación pendiente')+'. Esta clasificación no demuestra equivalencia.</small>'+
    '<p>'+openLink(o.url,'Abrir ficha de proveedor ↗')+'</p></li>';
}
function ux4Detail(c){
  const cor=c.corroboracion;
  let out='<article class="ux4-detail" aria-labelledby="ux4-detail-heading">'+
    '<header class="ux4-detail-head"><div><span class="ux4-kicker">'+esc(c.concepto_id)+
    ' · '+esc(ux4Status[c.posicion_decision])+'</span>'+
    '<h2 id="ux4-detail-heading" tabindex="-1">'+esc(c.nombre)+'</h2>'+
    '<p>'+esc(c.publico_hipotetico)+'</p></div>'+
    '<div class="ux4-score"><strong>'+esc(ux4Score(c))+'</strong><small>/5 · puntaje previo</small></div></header>'+
    '<p class="ux4-caution"><b>Lectura obligatoria:</b> referencia del ranking anterior. No se recalculó con UX-11.1–11.3 y no predice ventas. No hay compras verificadas de estos microcursos.</p>';
  out+='<section class="ux4-stage"><h3><span>1</span>Necesidad y resultado concreto</h3>'+
    '<p>'+esc(c.entregable_hipotetico)+'</p><div class="ux4-note"><b>Respaldo inicial:</b> '+esc(c.respaldo_historico)+'</div></section>';
  out+='<section class="ux4-stage"><h3><span>2</span>Qué evidencia documental tenemos</h3>'+
    '<div class="ux4-badges"><span class="ux4-badge">'+c.senales.length+' señales D</span>'+
    '<span class="ux4-badge">'+cor.DIRECTO+' directas</span><span class="ux4-badge">'+cor.INDICE_OFICIAL+
    ' indexadas</span><span class="ux4-badge">'+cor.PARCIAL+' parciales</span></div>'+
    '<p class="ux4-caption">Cada ficha conserva su unidad original. Una postulación, participación o contrato público NO equivale a una matrícula pagada.</p>'+
    '<details class="ux4-expander" open><summary>Examinar las '+c.senales.length+' fuentes de demanda</summary>'+
    '<ul class="ux4-evidence-list">'+c.senales.map(ux4Evidence).join('')+'</ul></details></section>';
  out+='<section class="ux4-stage"><h3><span>3</span>Sustitutos y cursos ya existentes</h3>'+
    '<p class="ux4-caption">Selección de alternativas para comparar tareas, públicos y oferta propia. No es un catálogo exhaustivo ni una verificación de precios actuales.</p>'+
    '<div class="ux4-warning"><b>Contraevidencia original:</b> '+esc(c.contraevidencia_historica)+'</div>'+
    '<div class="ux4-warning ux4-warning-secondary"><b>Riesgo adicional:</b> '+esc(c.riesgo_diferenciacion)+'</div>'+
    '<details class="ux4-expander"><summary>Ver '+c.ofertas_clave.length+' ofertas y sus fuentes</summary>'+
    '<ul class="ux4-offers-list">'+c.ofertas_clave.map(ux4Offer).join('')+'</ul></details>'+
    (c.ofertas_propias_relacionadas.length?'<p class="ux4-own"><b>Revisar oferta propia:</b> '+
      c.ofertas_propias_relacionadas.map(anchorRecord).join(' ')+'</p>':'')+'</section>';
  out+='<section class="ux4-stage ux4-hypothesis"><h3><span>4</span>Diferenciación propuesta (HIPÓTESIS)</h3>'+
    '<p>'+esc(c.diferenciacion_hipotetica)+'</p>'+
    '<p class="ux4-caption">Puede debilitarse si un recurso gratuito o un curso propio ya entrega el mismo resultado.</p></section>';
  out+='<section class="ux4-stage ux4-test"><h3><span>5</span>Prueba que podría refutarla</h3>'+
    '<span class="ux4-badge ux4-not-done">NO EJECUTADA · validación futura</span>'+
    '<p>'+esc(c.prueba_falsadora_propuesta_no_ejecutada)+'</p>'+
    '<div class="ux4-note"><b>Condición para avanzar:</b> '+esc(c.condicion_para_avanzar_propuesta)+'</div></section>';
  out+='<section class="ux4-stage ux4-decision"><h3><span>6</span>Decisión condicionada</h3>'+
    '<p><b>'+esc(ux4Status[c.posicion_decision])+'.</b> '+esc(c.motivo_decision)+'</p>'+
    '<div class="ux4-links"><button type="button" class="btn btn-outline btn-small" data-open="'+esc(c.concepto_id)+'">Ficha original '+esc(c.concepto_id)+'</button>'+
    '<button type="button" class="btn btn-outline btn-small" data-view="oferta">Revisar Oferta ↗</button>'+
    '<button type="button" class="btn btn-outline btn-small" data-view="demanda">Revisar Demanda ↗</button></div></section>';
  return out+'</article>';
}
function renderConcepts(){
  const ordered=['C003','C002','C001','C004','C005','C006'].map(id=>ux4Map.get(id));
  if(!ux4Map.has(ux4Selected))ux4Selected='C003';
  let out=head('Conclusiones Cruzadas',
    'Una lectura integrada de alternativas, fuentes y límites. Estas prioridades no predicen ventas.',
    'Fase 3 · De la evidencia a decisiones');
  out+='<section class="ux4-hero"><span class="ux4-kicker">Oferta × Demanda × Decisión · corte 23 de noviembre de 2026</span>'+
    '<h2>¿Qué cursos conviene comprobar primero?</h2>'+
    '<p>Dos hipótesis destacan en el ranking anterior. Antes de producirlas, revisa la evidencia, los sustitutos y qué podría invalidar cada propuesta.</p>'+
    '<div class="ux4-metrics"><div><strong>392</strong><span>ofertas registradas</span></div>'+
    '<div><strong>24</strong><span>señales heterogéneas</span></div>'+
    '<div><strong>188</strong><span>ofertas cribadas (14 web)</span></div>'+
    '<div><strong>6</strong><span>conceptos evaluados</span></div></div>'+
    '<p class="ux4-caution"><b>Lo que estas cifras NO miden:</b> alumnos pagadores, ventas, tamaño de mercado ni intención de compra. Otras 204 ofertas no entraron al cribado de UX-11.2.</p></section>';
  out+='<section class="ux4-priorities"><h2>Dos hipótesis para validar primero</h2>'+
    '<p>Referencias de puntajes existentes, no resultados numéricos nuevos.</p>'+
    '<div class="ux4-leaders">'+ordered.slice(0,2).map((c,i)=>
      '<button type="button" class="ux4-leader" data-ux4-select="'+esc(c.concepto_id)+'">'+
      '<span>'+ (i===0?'Primera hipótesis':'Segunda hipótesis') +'</span>'+
      '<strong>'+esc(c.nombre)+'</strong><small>'+esc(ux4Score(c))+'/5 · referencia previa</small>'+
      '<span class="ux4-leader-link">Examinar evidencia y prueba pendiente ↗</span></button>'
    ).join('')+'</div></section>';
  out+='<section class="ux4-navigation"><h2>Explora los seis conceptos</h2>'+
    '<p>Selecciona un concepto para abrir su análisis completo.</p>'+
    '<div class="ux4-selector" aria-label="Seleccionar concepto">'+ordered.map(c=>
      '<button type="button" class="ux4-select'+(ux4Selected===c.concepto_id?' selected':'')+'" '+
      'data-ux4-select="'+esc(c.concepto_id)+'" aria-pressed="'+String(ux4Selected===c.concepto_id)+'" aria-controls="ux4-display">'+
      '<small>'+esc(c.concepto_id)+'</small><strong>'+esc(c.nombre)+'</strong>'+
      '<span>'+esc(ux4Status[c.posicion_decision])+'</span>'+
      '<em>'+esc(ux4Score(c))+'/5 previo</em></button>'
    ).join('')+'</div></section>';
  out+='<div id="ux4-display" class="ux4-display" aria-label="Detalle del concepto seleccionado">'+
    ux4Detail(ux4Map.get(ux4Selected))+'</div>';
  out+='<section class="ux4-method"><h2>Cómo leer el análisis sin sobreinterpretarlo</h2>'+
    '<p>Los 164 pares documentales de UX-11.1 son co-referencias por tema, no 164 oportunidades. En UX-11.2 se clasificaron 77 sustitutos parciales posibles, 46 ofertas adyacentes y 65 descartes documentales. No se revisó cada curso en profundidad.</p>'+
    '<p>UX-11.3 diseñó seis pruebas falsadoras: <strong>ninguna ha sido ejecutada</strong>. En el ranking previo el componente precio/comprador usó 3/5 como supuesto por falta de datos de pago.</p>'+
    '<div class="ux4-links"><button type="button" class="btn btn-outline btn-small" data-view="metodo">Métodos y Fuentes ↗</button>'+
    '<button type="button" class="btn btn-outline btn-small" data-view="busquedas">Bitácora de investigación ↗</button></div></section>';
  return out;
}
document.addEventListener('click',function(ev){
  const btn=ev.target.closest('[data-ux4-select]');
  if(!btn||state.view!=='conceptos')return;
  const id=btn.dataset.ux4Select;
  if(!ux4Map.has(id))return;
  ux4Selected=id;
  const root=document.getElementById('conceptos');
  root.querySelectorAll('.ux4-select').forEach(el=>{
    const active=el.dataset.ux4Select===id;
    el.classList.toggle('selected',active);
    el.setAttribute('aria-pressed',String(active));
  });
  const holder=root.querySelector('#ux4-display');
  if(holder){
    holder.innerHTML=ux4Detail(ux4Map.get(id));
    holder.querySelector('#ux4-detail-heading')?.focus({preventScroll:true});
    holder.scrollIntoView({block:'start',behavior:'smooth'});
  }
});
