// Base de datos simplificada de códigos CIE-11
// En producción, esto debería conectarse a una API o base de datos completa

export const CIE11_DATABASE: Record<string, string> = {
  // Enfermedades cardiovasculares
  "BA00": "Hipertensión esencial (primaria)",
  "BA01": "Hipertensión secundaria",
  "BA02": "Crisis hipertensiva",
  "BA40": "Cardiopatía isquémica crónica",
  "BA41": "Infarto agudo de miocardio",
  "BA42": "Angina de pecho",
  "BA60": "Arritmia cardíaca",
  "BA61": "Fibrilación auricular",
  "BB00": "Insuficiencia cardíaca",
  "BB01": "Cardiomiopatía",
  "BC40": "Enfermedad vascular periférica",
  
  // Enfermedades respiratorias
  "CA20": "Asma",
  "CA21": "Asma bronquial",
  "CA22": "Estado asmático",
  "CA23": "Enfermedad pulmonar obstructiva crónica (EPOC)",
  "CA24": "Bronquitis crónica",
  "CA25": "Enfisema",
  "CA40": "Neumonía",
  "CA41": "Bronquitis aguda",
  "CA50": "Tuberculosis pulmonar",
  
  // Enfermedades endocrinas y metabólicas
  "5A10": "Diabetes mellitus tipo 1",
  "5A11": "Diabetes mellitus tipo 2",
  "5A12": "Diabetes gestacional",
  "5A13": "Prediabetes",
  "5A40": "Hipotiroidismo",
  "5A41": "Hipertiroidismo",
  "5A60": "Obesidad",
  "5A61": "Sobrepeso",
  "5C80": "Hiperlipidemia",
  "5C81": "Hipercolesterolemia",
  
  // Enfermedades del sistema digestivo
  "DA20": "Gastritis",
  "DA21": "Úlcera gástrica",
  "DA22": "Úlcera duodenal",
  "DA40": "Enfermedad por reflujo gastroesofágico (ERGE)",
  "DA60": "Síndrome de intestino irritable",
  "DA80": "Enfermedad de Crohn",
  "DA81": "Colitis ulcerosa",
  "DB30": "Hepatitis viral",
  "DB31": "Hepatitis B",
  "DB32": "Hepatitis C",
  "DB90": "Cirrosis hepática",
  
  // Enfermedades musculoesqueléticas
  "FA20": "Artritis reumatoide",
  "FA21": "Artrosis",
  "FA22": "Osteoartritis",
  "FA40": "Osteoporosis",
  "FA60": "Lumbalgia",
  "FA61": "Cervicalgia",
  "FA70": "Fibromialgia",
  "FA80": "Gota",
  "FB50": "Tendinitis",
  "FB51": "Bursitis",
  "FB52": "Esguince",
  "FB80": "Fractura",
  
  // Enfermedades neurológicas
  "8A20": "Epilepsia",
  "8A21": "Crisis convulsivas",
  "8A40": "Migraña",
  "8A41": "Cefalea tensional",
  "8A80": "Enfermedad de Parkinson",
  "8A81": "Enfermedad de Alzheimer",
  "8B20": "Neuropatía periférica",
  
  // Enfermedades mentales y del comportamiento
  "6A70": "Depresión",
  "6A71": "Trastorno depresivo mayor",
  "6A72": "Trastorno depresivo recurrente",
  "6B00": "Trastorno de ansiedad",
  "6B01": "Trastorno de ansiedad generalizada",
  "6B02": "Trastorno de pánico",
  "6B20": "Trastorno obsesivo-compulsivo",
  "6B40": "Trastorno bipolar",
  "6B60": "Esquizofrenia",
  "6C40": "Trastorno por déficit de atención e hiperactividad (TDAH)",
  
  // Enfermedades dermatológicas
  "EA00": "Dermatitis atópica",
  "EA01": "Dermatitis de contacto",
  "EA20": "Psoriasis",
  "EA40": "Acné",
  "EA80": "Urticaria",
  
  // Enfermedades renales y urinarias
  "GB40": "Insuficiencia renal crónica",
  "GB41": "Insuficiencia renal aguda",
  "GB60": "Infección del tracto urinario",
  "GB80": "Cálculos renales",
  
  // Enfermedades hematológicas
  "3A00": "Anemia",
  "3A01": "Anemia ferropénica",
  "3A02": "Anemia megaloblástica",
  "3A20": "Leucemia",
  "3A40": "Trombocitopenia",
  
  // Enfermedades infecciosas
  "1C62": "COVID-19",
  "1E50": "VIH/SIDA",
  "1C60": "Influenza",
  "1E70": "Dengue",
  "1E80": "Malaria",
  "1F00": "Zika",
  "1F01": "Chikungunya",
  
  // Enfermedades oftalmológicas
  "9B00": "Miopía",
  "9B01": "Hipermetropía",
  "9B02": "Astigmatismo",
  "9B10": "Cataratas",
  "9B20": "Glaucoma",
  "9B40": "Conjuntivitis",
  
  // Enfermedades otorrinolaringológicas
  "AB00": "Otitis media",
  "AB01": "Otitis externa",
  "AB20": "Sinusitis",
  "AB40": "Faringitis",
  "AB41": "Amigdalitis",
  "AB60": "Rinitis alérgica",
  
  // Neoplasias (cánceres)
  "2C10": "Cáncer de mama",
  "2C20": "Cáncer de pulmón",
  "2C30": "Cáncer de colon",
  "2C40": "Cáncer de próstata",
  "2C50": "Cáncer de estómago",
  "2C60": "Cáncer de piel",
  "2C70": "Leucemia",
  "2C80": "Linfoma",
  
  // Enfermedades ginecológicas
  "GA00": "Síndrome de ovario poliquístico",
  "GA20": "Endometriosis",
  "GA40": "Miomas uterinos",
  "GA60": "Infecciones vaginales",
  
  // Alergias
  "4A80": "Alergia alimentaria",
  "4A81": "Alergia a medicamentos",
  "4A82": "Alergia al polen",
  "4A83": "Alergia a los ácaros",
  
  // Otras condiciones comunes
  "NE00": "Ninguna enfermedad diagnosticada",
  "NE01": "No aplica",
};

export function buscarEnfermedadPorCodigo(codigo: string): string | null {
  const codigoNormalizado = codigo.toUpperCase().trim();
  return CIE11_DATABASE[codigoNormalizado] || null;
}

export function buscarCodigosPorNombre(nombre: string): Array<{ codigo: string; nombre: string }> {
  const nombreNormalizado = nombre.toLowerCase();
  const resultados: Array<{ codigo: string; nombre: string }> = [];
  
  for (const [codigo, nombreEnfermedad] of Object.entries(CIE11_DATABASE)) {
    if (nombreEnfermedad.toLowerCase().includes(nombreNormalizado)) {
      resultados.push({ codigo, nombre: nombreEnfermedad });
    }
  }
  
  return resultados;
}
