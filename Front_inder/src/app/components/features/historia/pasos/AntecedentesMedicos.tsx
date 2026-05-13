import { useState } from "react";
import { HistoriaClinicaData } from "../HistoriaClinica";
import ComponenteAlergias from './ComponenteAlergias';
import VacunasConArchivos from '@/app/components/features/archivos/VacunasConArchivos';
import { Plus, Trash2, User, Users, AlertCircle, Syringe, Pill, Scissors, AlertTriangle } from "lucide-react";
import { buscarEnfermedadPorCodigo, buscarCodigosPorNombre, buscarPorCodigoParcial } from './cie11Service';

// ── Tokens ────────────────────────────────────────────────────
const T = {
  primary:'#1F4788', primaryLight:'#EEF3FB', primaryMid:'#3b82f6',
  surface:'#ffffff', surfaceAlt:'#f8fafc',
  border:'#e2e8f0', borderLight:'#f1f5f9',
  textPrimary:'#0f172a', textSecondary:'#475569', textMuted:'#94a3b8',
  danger:'#ef4444', dangerBg:'#fee2e2',
  success:'#10b981', successBg:'#f0fdf4',
  teal:'#0f766e', tealBg:'#f0fdfa', tealBorder:'#99f6e4',
  violet:'#6d28d9', violetBg:'#f5f3ff', violetBorder:'#ddd6fe',
  amber:'#b45309', amberBg:'#fffbeb', amberBorder:'#fde68a',
  radius:'12px', radiusSm:'8px',
};

// Colores por sección — suaves y diferenciados
const SEC = {
  personal:   { bg:T.primaryLight,  border:T.primary,  icon:T.primary,  title:T.primary   },
  familiar:   { bg:T.tealBg,        border:T.teal,     icon:T.teal,     title:T.teal      },
  lesiones:   { bg:T.amberBg,       border:T.amber,    icon:T.amber,    title:T.amber     },
  cirugias:   { bg:T.violetBg,      border:T.violet,   icon:T.violet,   title:T.violet    },
  alergias:   { bg:'#fff1f2',       border:'#f43f5e',  icon:'#f43f5e',  title:'#be123c'   },
  medicacion: { bg:'#ecfeff',       border:'#0891b2',  icon:'#0891b2',  title:'#0e7490'   },
  vacunas:    { bg:T.successBg,     border:T.success,  icon:T.success,  title:T.teal      },
};

type VacunaConArchivo = {
  id?: string; nombre_vacuna: string; fecha_administracion?: string;
  observaciones?: string; archivo?: File; nombre_archivo?: string;
  ruta_archivo?: string; tipo_archivo?: string; es_nueva?: boolean;
};

type Props = {
  data: HistoriaClinicaData;
  updateData: (data: Partial<HistoriaClinicaData>) => void;
  onNext: () => void; onPrevious: () => void; onCancel?: () => void;
};

const familiares = ["Padre","Madre","Hermano/a","Abuelo Paterno","Abuela Paterna","Abuelo Materno","Abuela Materna","Tío/a Paterno/a","Tío/a Materno/a","Otro"];

// ── Componentes atómicos ──────────────────────────────────────
const Seccion = ({ titulo, icon, sec, children }: {
  titulo: string; icon: React.ReactNode;
  sec: typeof SEC.personal; children: React.ReactNode;
}) => (
  <div style={{ border:`1px solid ${sec.border}`, borderRadius:T.radius, overflow:'hidden', background:sec.bg }}>
    <div style={{ display:'flex', alignItems:'center', gap:10, padding:'13px 18px', borderBottom:`1px solid ${sec.border}40` }}>
      <div style={{ width:30, height:30, borderRadius:T.radiusSm, background:`${sec.icon}20`, display:'flex', alignItems:'center', justifyContent:'center', color:sec.icon, flexShrink:0 }}>
        {icon}
      </div>
      <h3 style={{ margin:0, fontSize:14, fontWeight:700, color:sec.title }}>{titulo}</h3>
    </div>
    <div style={{ padding:'18px' }}>{children}</div>
  </div>
);

const Campo = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div>
    <label style={{ display:'block', marginBottom:5, fontSize:12, fontWeight:600, color:T.textSecondary }}>{label}</label>
    {children}
  </div>
);

const inputStyle = { width:'100%', padding:'9px 11px', border:`1px solid ${T.border}`, borderRadius:T.radiusSm, fontSize:13, outline:'none', boxSizing:'border-box' as const, background:T.surface };
const textareaStyle = { ...inputStyle, resize:'vertical' as const, fontFamily:'inherit' };
const radioStyle = { accentColor: T.primary, width:14, height:14 };

const ItemAntecedente = ({ codigo, nombre, extra, color, onDelete }: {
  codigo: string; nombre: string; extra?: string; color: string; onDelete: () => void;
}) => (
  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', padding:'10px 13px', background:T.surface, border:`1px solid ${T.borderLight}`, borderLeft:`3px solid ${color}`, borderRadius:T.radiusSm, marginBottom:6 }}>
    <div style={{ flex:1 }}>
      <div style={{ display:'flex', alignItems:'center', gap:8, flexWrap:'wrap' }}>
        <span style={{ fontSize:11, fontWeight:700, fontFamily:'monospace', background:`${color}15`, color, padding:'2px 8px', borderRadius:20 }}>{codigo}</span>
        <span style={{ fontSize:13, fontWeight:600, color:T.textPrimary }}>{nombre}</span>
        {extra && <span style={{ fontSize:11, background:T.surfaceAlt, border:`1px solid ${T.border}`, color:T.textSecondary, padding:'1px 7px', borderRadius:20 }}>{extra}</span>}
      </div>
    </div>
    <button onClick={onDelete} style={{ padding:6, background:T.dangerBg, border:'none', borderRadius:T.radiusSm, cursor:'pointer', color:T.danger, flexShrink:0, marginLeft:8 }}>
      <Trash2 size={13}/>
    </button>
  </div>
);

const Sugerencias = ({ items, color, onSelect }: {
  items: {codigo:string;nombre:string}[]; color: string; onSelect: (c:string, n:string) => void;
}) => (
  <div style={{ position:'absolute', zIndex:20, background:T.surface, border:`1px solid ${color}`, borderRadius:T.radiusSm, boxShadow:'0 8px 24px rgba(0,0,0,0.12)', maxHeight:240, overflowY:'auto', marginTop:4, width:'100%' }}>
    {items.map(s => (
      <button key={s.codigo} type="button" onClick={() => onSelect(s.codigo, s.nombre)}
        style={{ width:'100%', padding:'8px 12px', background:'transparent', border:'none', borderBottom:`1px solid ${T.borderLight}`, cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:8 }}>
        <span style={{ fontSize:11, fontWeight:700, fontFamily:'monospace', background:`${color}15`, color, padding:'2px 7px', borderRadius:20, flexShrink:0 }}>{s.codigo}</span>
        <span style={{ fontSize:12, color:T.textPrimary }}>{s.nombre}</span>
      </button>
    ))}
  </div>
);

const BtnAgregar = ({ label, color, onClick }: { label: string; color: string; onClick: () => void }) => (
  <button type="button" onClick={onClick}
    style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'center', gap:8, padding:'10px 16px', background:color, color:'#fff', border:'none', borderRadius:T.radiusSm, cursor:'pointer', fontSize:13, fontWeight:600 }}>
    <Plus size={14}/> {label}
  </button>
);

const RadioSiNo = ({ name, value, onSi, onNo }: { name: string; value: boolean | null; onSi: () => void; onNo: () => void }) => (
  <div style={{ display:'flex', gap:24, marginBottom:12 }}>
    {[{v:true,l:'Sí',fn:onSi},{v:false,l:'No',fn:onNo}].map(({v,l,fn}) => (
      <label key={l} style={{ display:'flex', alignItems:'center', gap:6, cursor:'pointer', fontSize:13 }}>
        <input type="radio" name={name} checked={value === v} style={radioStyle} onChange={fn}/>
        <span style={{ color:T.textSecondary }}>{l}</span>
      </label>
    ))}
  </div>
);

// ── Componente principal ──────────────────────────────────────
export function AntecedentesMedicos({ data, updateData, onNext, onPrevious, onCancel }: Props) {
  // Personal
  const [codigoP, setCodigoP] = useState(""); const [nombreP, setNombreP] = useState(""); const [obsP, setObsP] = useState("");
  const [errP, setErrP] = useState(""); const [sugNomP, setSugNomP] = useState<{codigo:string;nombre:string}[]>([]); const [showSugNomP, setShowSugNomP] = useState(false);
  const [sugCodP, setSugCodP] = useState<{codigo:string;nombre:string}[]>([]); const [showSugCodP, setShowSugCodP] = useState(false);
  // Familiar
  const [codigoF, setCodigoF] = useState(""); const [nombreF, setNombreF] = useState(""); const [familiar, setFamiliar] = useState(""); const [obsF, setObsF] = useState("");
  const [errF, setErrF] = useState(""); const [sugNomF, setSugNomF] = useState<{codigo:string;nombre:string}[]>([]); const [showSugNomF, setShowSugNomF] = useState(false);
  const [sugCodF, setSugCodF] = useState<{codigo:string;nombre:string}[]>([]); const [showSugCodF, setShowSugCodF] = useState(false);

  const buscarCodigo = async (v: string, setCod: any, setNom: any, setErr: any, setSugCod: any, setShowSugCod: any) => {
    const u = v.toUpperCase(); setCod(u); setErr("");
    if (u.trim()) {
      const e = await buscarEnfermedadPorCodigo(u);
      if (e) { setNom(e?.nombre ?? ""); setSugCod([]); setShowSugCod(false); }
      else {
        const r = await buscarPorCodigoParcial(u);
        if (r.length > 0) { setSugCod(r.map((x:any) => ({ codigo:x.codigo, nombre:x.nombre }))); setShowSugCod(true); }
        else { setErr("Código no encontrado"); setSugCod([]); setShowSugCod(false); }
        setNom("");
      }
    } else { setNom(""); setSugCod([]); setShowSugCod(false); }
  };

  const buscarNombre = (deb: any) => (v: string, setNom: any, setErr: any, setSugNom: any, setShowSugNom: any) => {
    setNom(v); setErr(""); clearTimeout(deb.current);
    if (v.trim().length >= 3) {
      deb.current = setTimeout(async () => {
        const r = await buscarCodigosPorNombre(v);
        if (r.length > 0) { setSugNom(r.map((x:any) => ({ codigo:x.codigo, nombre:x.nombre }))); setShowSugNom(true); }
        else { setSugNom([]); setShowSugNom(false); }
      }, 400);
    } else { setSugNom([]); setShowSugNom(false); }
  };

  const debP = { current: null as any };
  const debF = { current: null as any };

  const agregarPersonal = () => {
    if (!codigoP.trim()) { alert("Ingrese un código CIE-11"); return; }
    if (!nombreP.trim()) { alert("Verifique la enfermedad buscando el código"); return; }
    updateData({ antecedentesPersonales: [...data.antecedentesPersonales, { codigoCIE11: codigoP.trim(), nombreEnfermedad: nombreP, observaciones: obsP }] });
    setCodigoP(""); setNombreP(""); setObsP(""); setErrP(""); setSugNomP([]); setSugCodP([]);
  };

  const agregarFamiliar = () => {
    if (!codigoF.trim()) { alert("Ingrese un código CIE-11"); return; }
    if (!nombreF.trim()) { alert("Verifique la enfermedad"); return; }
    if (!familiar) { alert("Seleccione el familiar afectado"); return; }
    updateData({ antecedentesFamiliares: [...data.antecedentesFamiliares, { codigoCIE11: codigoF.trim(), nombreEnfermedad: nombreF, familiar, observaciones: obsF }] });
    setCodigoF(""); setNombreF(""); setFamiliar(""); setObsF(""); setErrF(""); setSugNomF([]); setSugCodF([]);
  };

  const FormCIE = ({ codigo, nombre, err, sugCod, showSugCod, sugNom, showSugNom, color,
    onCodigo, onNombre, onSelectCod, onSelectNom, onFocusCod, onFocusNom
  }: any) => (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:12 }}>
      <Campo label="Código CIE-11">
        <div style={{ position:'relative' }}>
          <input value={codigo} onChange={e => onCodigo(e.target.value)} onFocus={onFocusCod}
            placeholder="Ej: BA00" style={{ ...inputStyle, textTransform:'uppercase', fontFamily:'monospace' }}/>
          {err && <div style={{ display:'flex', alignItems:'center', gap:5, marginTop:5, fontSize:11, color:T.danger, background:T.dangerBg, padding:'5px 8px', borderRadius:T.radiusSm }}>
            <AlertCircle size={11}/> {err}
          </div>}
          {showSugCod && sugCod.length > 0 && <Sugerencias items={sugCod} color={color} onSelect={onSelectCod}/>}
        </div>
      </Campo>
      <Campo label="Enfermedad">
        <div style={{ position:'relative' }}>
          <input value={nombre} onChange={e => onNombre(e.target.value)} onFocus={onFocusNom}
            placeholder="Escriba el nombre (mínimo 3 caracteres)" style={inputStyle}/>
          {showSugNom && sugNom.length > 0 && <Sugerencias items={sugNom} color={color} onSelect={onSelectNom}/>}
        </div>
      </Campo>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:18 }}>

      {/* ANTECEDENTES PERSONALES */}
      <Seccion titulo="Antecedentes Personales" icon={<User size={15}/>} sec={SEC.personal}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <FormCIE
            codigo={codigoP} nombre={nombreP} err={errP} sugCod={sugCodP} showSugCod={showSugCodP} sugNom={sugNomP} showSugNom={showSugNomP} color={SEC.personal.icon}
            onCodigo={(v:string) => buscarCodigo(v, setCodigoP, setNombreP, setErrP, setSugCodP, setShowSugCodP)}
            onNombre={(v:string) => buscarNombre(debP)(v, setNombreP, setErrP, setSugNomP, setShowSugNomP)}
            onSelectCod={(c:string,n:string) => { setCodigoP(c); setNombreP(n); setShowSugCodP(false); setErrP(""); }}
            onSelectNom={(c:string,n:string) => { setCodigoP(c); setNombreP(n); setShowSugNomP(false); }}
            onFocusCod={() => sugCodP.length > 0 && setShowSugCodP(true)}
            onFocusNom={() => sugNomP.length > 0 && setShowSugNomP(true)}
          />
          <Campo label="Observaciones">
            <textarea value={obsP} onChange={e => setObsP(e.target.value)} rows={2}
              placeholder="Detalles adicionales, fecha de diagnóstico, tratamiento actual..." style={textareaStyle}/>
          </Campo>
          <BtnAgregar label="Agregar Antecedente Personal" color={SEC.personal.icon} onClick={agregarPersonal}/>
        </div>
        {data.antecedentesPersonales.length > 0 && (
          <div style={{ marginTop:14 }}>
            <p style={{ margin:'0 0 7px', fontSize:11, fontWeight:700, color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.05em' }}>Registrados</p>
            {data.antecedentesPersonales.map((a, i) => (
              <ItemAntecedente key={i} codigo={a.codigoCIE11} nombre={a.nombreEnfermedad} color={SEC.personal.icon}
                onDelete={() => updateData({ antecedentesPersonales: data.antecedentesPersonales.filter((_,j) => j!==i) })}/>
            ))}
          </div>
        )}
      </Seccion>

      {/* ANTECEDENTES FAMILIARES */}
      <Seccion titulo="Antecedentes Familiares" icon={<Users size={15}/>} sec={SEC.familiar}>
        <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
          <FormCIE
            codigo={codigoF} nombre={nombreF} err={errF} sugCod={sugCodF} showSugCod={showSugCodF} sugNom={sugNomF} showSugNom={showSugNomF} color={SEC.familiar.icon}
            onCodigo={(v:string) => buscarCodigo(v, setCodigoF, setNombreF, setErrF, setSugCodF, setShowSugCodF)}
            onNombre={(v:string) => buscarNombre(debF)(v, setNombreF, setErrF, setSugNomF, setShowSugNomF)}
            onSelectCod={(c:string,n:string) => { setCodigoF(c); setNombreF(n); setShowSugCodF(false); setErrF(""); }}
            onSelectNom={(c:string,n:string) => { setCodigoF(c); setNombreF(n); setShowSugNomF(false); }}
            onFocusCod={() => sugCodF.length > 0 && setShowSugCodF(true)}
            onFocusNom={() => sugNomF.length > 0 && setShowSugNomF(true)}
          />
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12 }}>
            <Campo label="Familiar afectado">
              <select value={familiar} onChange={e => setFamiliar(e.target.value)} style={{ ...inputStyle, cursor:'pointer' }}>
                <option value="">Seleccione...</option>
                {familiares.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </Campo>
            <Campo label="Observaciones">
              <input value={obsF} onChange={e => setObsF(e.target.value)} placeholder="Detalles adicionales..." style={inputStyle}/>
            </Campo>
          </div>
          <BtnAgregar label="Agregar Antecedente Familiar" color={SEC.familiar.icon} onClick={agregarFamiliar}/>
        </div>
        {data.antecedentesFamiliares.length > 0 && (
          <div style={{ marginTop:14 }}>
            <p style={{ margin:'0 0 7px', fontSize:11, fontWeight:700, color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.05em' }}>Registrados</p>
            {data.antecedentesFamiliares.map((a, i) => (
              <ItemAntecedente key={i} codigo={a.codigoCIE11} nombre={a.nombreEnfermedad} extra={a.familiar} color={SEC.familiar.icon}
                onDelete={() => updateData({ antecedentesFamiliares: data.antecedentesFamiliares.filter((_,j) => j!==i) })}/>
            ))}
          </div>
        )}
      </Seccion>

      {/* LESIONES PREVIAS */}
      <Seccion titulo="Lesiones previas" icon={<AlertTriangle size={15}/>} sec={SEC.lesiones}>
        <RadioSiNo name="lesiones" value={data.lesionesDeportivas}
          onSi={() => updateData({ lesionesDeportivas: true })}
          onNo={() => updateData({ lesionesDeportivas: false, descripcionLesiones: "", fechaUltimaLesion: "" })}/>
        {data.lesionesDeportivas && (
          <div style={{ display:'flex', flexDirection:'column', gap:12, padding:14, background:T.surface, borderRadius:T.radiusSm, border:`1px solid ${T.border}` }}>
            <Campo label="Descripción de lesiones">
              <textarea value={data.descripcionLesiones} rows={3}
                onChange={e => updateData({ descripcionLesiones: e.target.value })}
                placeholder="Describa las lesiones (tipo, gravedad, zona afectada)..." style={textareaStyle}/>
            </Campo>
            <Campo label="Fecha de la última lesión">
              <input type="date" value={data.fechaUltimaLesion}
                onChange={e => updateData({ fechaUltimaLesion: e.target.value })}
                max={new Date().toISOString().split("T")[0]} style={inputStyle}/>
            </Campo>
          </div>
        )}
      </Seccion>

      {/* CIRUGÍAS PREVIAS */}
      <Seccion titulo="Cirugías previas" icon={<Scissors size={15}/>} sec={SEC.cirugias}>
        <RadioSiNo name="cirugias" value={data.cirugiasPrevias}
          onSi={() => updateData({ cirugiasPrevias: true })}
          onNo={() => updateData({ cirugiasPrevias: false, detalleCirugias: "" })}/>
        {data.cirugiasPrevias && (
          <textarea value={data.detalleCirugias} rows={3}
            onChange={e => updateData({ detalleCirugias: e.target.value })}
            placeholder="Detalle las cirugías (tipo, fecha, resultados)..." style={textareaStyle}/>
        )}
      </Seccion>

      {/* ALERGIAS */}
      <Seccion titulo="Alergias" icon={<AlertCircle size={15}/>} sec={SEC.alergias}>
        <RadioSiNo name="alergias" value={data.tieneAlergias}
          onSi={() => updateData({ tieneAlergias: true })}
          onNo={() => updateData({ tieneAlergias: false, alergias: [] })}/>
        <ComponenteAlergias
          tieneAlergias={data.tieneAlergias} alergias={data.alergias}
          onChangeTieneAlergias={value => updateData({ tieneAlergias: value })}
          onChangeAlergias={alergias => updateData({ alergias })}/>
      </Seccion>

      {/* MEDICACIÓN ACTUAL */}
      <Seccion titulo="Medicación actual" icon={<Pill size={15}/>} sec={SEC.medicacion}>
        <RadioSiNo name="medicacion" value={data.tomaMedicacion}
          onSi={() => updateData({ tomaMedicacion: true })}
          onNo={() => updateData({ tomaMedicacion: false, medicacionActual: "" })}/>
        {data.tomaMedicacion && (
          <input value={data.medicacionActual} onChange={e => updateData({ medicacionActual: e.target.value })}
            placeholder="Especifique los medicamentos que toma actualmente..." style={inputStyle}/>
        )}
      </Seccion>

      {/* VACUNAS */}
      <Seccion titulo="Vacunas" icon={<Syringe size={15}/>} sec={SEC.vacunas}>
        <p style={{ margin:'0 0 12px', fontSize:12, color:T.textSecondary }}>Vacunas registradas del deportista con sus certificados</p>
        {data.deportista_id && typeof data.deportista_id === 'string' ? (
          <VacunasConArchivos
            deportista_id={data.deportista_id} vacunas={data.vacunas || []}
            onChangeVacunas={(vacunas: VacunaConArchivo[]) => updateData({ vacunas })} readonly={false}/>
        ) : (
          <p style={{ textAlign:'center', fontSize:12, color:T.textMuted, fontStyle:'italic' }}>Los datos del deportista se cargarán cuando se abra la historia clínica.</p>
        )}
      </Seccion>

    </div>
  );
}