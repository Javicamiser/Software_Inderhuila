import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { User, Phone, Trophy, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useCatalogos } from "@/app/hooks/useCatalogos";
import VacunasHistoriaClinica from '@/app/components/features/archivos/VacunasHistoriaClinica';

// ============================================================================
// TIPOS
// ============================================================================

type FormDataPersonales = {
  nombreCompleto: string;
  fechaNacimiento: string;
  genero: string;
  otroGenero?: string;
  tipoDocumento: string;
  numeroDocumento: string;
  nacionalidad: string;
  departamento?: string;
  ciudad?: string;
  estrato?: string;
  etnia?: string;
  telefono: string;
  correoElectronico: string;
  direccion: string;
  disciplina: string;
};

// ============================================================================
// CONSTANTES
// ============================================================================

const PAISES = [
  "Colombia", "Argentina", "Bolivia", "Brasil", "Chile", "Costa Rica", "Cuba",
  "Ecuador", "El Salvador", "Guatemala", "Honduras", "México", "Nicaragua",
  "Panamá", "Paraguay", "Perú", "República Dominicana", "Uruguay", "Venezuela",
  "España", "Estados Unidos", "Otro"
];

const DEPARTAMENTOS = [
  "Amazonas", "Antioquia", "Arauca", "Atlántico", "Bolívar", "Boyacá", "Caldas",
  "Caquetá", "Casanare", "Cauca", "Cesar", "Chocó", "Córdoba", "Cundinamarca",
  "Guainía", "Guaviare", "Huila", "La Guajira", "Magdalena", "Meta", "Nariño",
  "Norte de Santander", "Putumayo", "Quindío", "Risaralda", "San Andrés y Providencia",
  "Santander", "Sucre", "Tolima", "Valle del Cauca", "Vaupés", "Vichada"
];

const CIUDADES_POR_DEPARTAMENTO: Record<string, string[]> = {
  "Amazonas": [
    "El Encanto", "La Chorrera", "La Pedrera", "La Victoria", "Leticia",
    "Mirití-Paraná", "Puerto Alegría", "Puerto Arica", "Puerto Nariño",
    "Puerto Santander", "Tarapacá"
  ],
  "Antioquia": [
    "Abejorral", "Abriaquí", "Alejandría", "Amagá", "Amalfi", "Andes",
    "Angelópolis", "Angostura", "Anorí", "Anzá", "Apartadó", "Arboletes",
    "Argelia", "Armenia", "Barbosa", "Bello", "Belmira", "Betania", "Betulia",
    "Briceño", "Buriticá", "Cáceres", "Caicedo", "Caldas", "Campamento",
    "Cañasgordas", "Caracolí", "Caramanta", "Carepa", "El Carmen de Viboral",
    "Carolina", "Caucasia", "Chigorodó", "Cisneros", "Ciudad Bolívar", "Cocorná",
    "Concepción", "Concordia", "Copacabana", "Dabeiba", "Donmatías", "Ebéjico",
    "El Bagre", "El Peñol", "El Retiro", "El Santuario", "Entrerríos", "Envigado",
    "Fredonia", "Frontino", "Giraldo", "Girardota", "Gómez Plata", "Granada",
    "Guadalupe", "Guarne", "Guatapé", "Heliconia", "Hispania", "Itagüí",
    "Ituango", "Jardín", "Jericó", "La Ceja", "La Estrella", "La Pintada",
    "La Unión", "Liborina", "Maceo", "Marinilla", "Medellín", "Medio Atrato",
    "Montebello", "Murindó", "Mutatá", "Nariño", "Nechí", "Necoclí", "Olaya",
    "Peque", "Pueblorrico", "Puerto Berrío", "Puerto Nare", "Puerto Triunfo",
    "Remedios", "Rionegro", "Sabanalarga", "Sabaneta", "Salgar",
    "San Andrés de Cuerquia", "San Carlos", "San Francisco", "San Jerónimo",
    "San José de la Montaña", "San Juan de Urabá", "San Luis",
    "San Pedro de los Milagros", "San Pedro de Urabá", "San Rafael", "San Roque",
    "San Vicente Ferrer", "Santa Bárbara", "Santa Fe de Antioquia",
    "Santa Rosa de Osos", "Santo Domingo", "Segovia", "Sonsón", "Sopetrán",
    "Támesis", "Tarazá", "Tarso", "Titiribí", "Toledo", "Turbo", "Uramita",
    "Urrao", "Valdivia", "Valparaíso", "Vegachí", "Venecia", "Vigía del Fuerte",
    "Yalí", "Yarumal", "Yolombó", "Yondó", "Zaragoza"
  ],
  "Arauca": [
    "Arauca", "Arauquita", "Cravo Norte", "Fortul", "Puerto Rondón",
    "Saravena", "Tame"
  ],
  "Atlántico": [
    "Baranoa", "Barranquilla", "Campo de la Cruz", "Candelaria", "Galapa",
    "Juan de Acosta", "Luruaco", "Malambo", "Manatí", "Palmar de Varela",
    "Piojó", "Polonuevo", "Ponedera", "Puerto Colombia", "Repelón",
    "Sabanagrande", "Sabanalarga", "Santa Lucía", "Santo Tomás", "Soledad",
    "Suan", "Tubará", "Usiacurí"
  ],
  "Bolívar": [
    "Achí", "Altos del Rosario", "Arenal", "Arjona", "Arroyohondo",
    "Barranco de Loba", "Calamar", "Cantagallo", "Cartagena de Indias",
    "Cicuco", "Clemencia", "Córdoba", "El Carmen de Bolívar", "El Guamo",
    "El Peñón", "Hatillo de Loba", "Magangué", "Mahates", "Margarita",
    "María la Baja", "Montecristo", "Morales", "Norosí", "Pinillos",
    "Regidor", "Río Viejo", "San Cristóbal", "San Estanislao", "San Fernando",
    "San Jacinto", "San Jacinto del Cauca", "San Juan Nepomuceno",
    "San Martín de Loba", "San Pablo", "Santa Catalina", "Santa Rosa",
    "Santa Rosa del Sur", "Simití", "Soplaviento", "Talaigua Nuevo",
    "Tiquisio", "Turbaco", "Turbaná", "Villanueva", "Zambrano"
  ],
  "Boyacá": [
    "Almeida", "Aquitania", "Arcabuco", "Belén", "Berbeo", "Betéitiva",
    "Boavita", "Boyacá", "Briceño", "Buenavista", "Busbanzá", "Caldas",
    "Campohermoso", "Cerinza", "Chinavita", "Chiquinquirá", "Chíquiza",
    "Chivor", "Chivatá", "Ciénaga", "Cómbita", "Coper", "Corrales",
    "Covarachía", "Cubará", "Cucaita", "Cuítiva", "Chita", "Chitaraque",
    "Duitama", "El Cocuy", "El Espino", "Firavitoba", "Floresta",
    "Gachantivá", "Gámezá", "Garagoa", "Guacamayas", "Guateque", "Guayatá",
    "Güicán", "Iza", "Jenesano", "La Capilla", "La Victoria", "La Uvita",
    "Labranzagrande", "Macanal", "Maripí", "Miraflores", "Mongua", "Monguí",
    "Moniquirá", "Motavita", "Muzo", "Nobsa", "Nuevo Colón", "Oicatá",
    "Otanche", "Pachavita", "Páez", "Paipa", "Pajarito", "Panqueba", "Pauna",
    "Paya", "Paz de Río", "Pesca", "Pisba", "Puerto Boyacá", "Quípama",
    "Ramiriquí", "Ráquira", "Rondón", "Saboyá", "Sáchica", "Samacá",
    "San Eduardo", "San José de Pare", "San Luis de Gaceno", "San Mateo",
    "San Miguel de Sema", "San Pablo de Borbur", "Santa María",
    "Santa Rosa de Viterbo", "Santa Sofía", "Santana", "Sativanorte",
    "Sativasur", "Siachoque", "Soatá", "Socha", "Socotá", "Somondoco",
    "Sora", "Soracá", "Sotaquirá", "Susacón", "Sutamarchán", "Sutatenza",
    "Tasco", "Tenza", "Tibaná", "Tibasosa", "Tinjacá", "Tipacoque", "Toca",
    "Togüí", "Tópaga", "Tota", "Tunja", "Tununguá", "Turmequé", "Tuta",
    "Tutazá", "Úmbita", "Ventaquemada", "Villa de Leyva", "Viracachá", "Zentiza"
  ],
  "Caldas": [
    "Aguadas", "Anserma", "Aranzazu", "Belalcázar", "Chinchiná", "Filadelfia",
    "La Dorada", "La Merced", "Manizales", "Manzanares", "Marmato", "Marquetalia",
    "Marulanda", "Neira", "Norcasia", "Pácora", "Palestina", "Pensilvania",
    "Riosucio", "Risaralda", "Salamina", "Samaná", "San José", "Supía",
    "Victoria", "Villamaría", "Viterbo"
  ],
  "Caquetá": [
    "Albania", "Belén de los Andaquíes", "Cartagena del Chairá", "Curillo",
    "El Doncello", "El Paujil", "Florencia", "La Montañita", "Milán", "Morelia",
    "Puerto Rico", "San José del Fragua", "San Vicente del Caguán", "Solano",
    "Solita", "Valparaíso"
  ],
  "Casanare": [
    "Aguazul", "Chámeza", "Hato Corozal", "La Salina", "Maní", "Monterrey",
    "Nunchía", "Orocué", "Paz de Ariporo", "Pore", "Recetor", "Sabanalarga",
    "Sácama", "San Luis de Palenque", "Támara", "Tauramena", "Trinidad",
    "Villanueva", "Yopal"
  ],
  "Cauca": [
    "Almaguer", "Argelia", "Balboa", "Bolívar", "Buenos Aires", "Cajibío",
    "Caldono", "Caloto", "Corinto", "El Tambo", "Florencia", "Guachené",
    "Guapí", "Inzá", "Jambaló", "La Sierra", "La Vega", "López de Micay",
    "Mercaderes", "Miranda", "Morales", "Padilla", "Páez", "Patía", "Piamonte",
    "Piendamó", "Popayán", "Puerto Tejada", "Puracé", "Rosas", "San Sebastián",
    "Santa Rosa", "Santander de Quilichao", "Silvia", "Sotará", "Suárez",
    "Sucre", "Timbío", "Timbiquí", "Toribío", "Totoró", "Villa Rica"
  ],
  "Cesar": [
    "Aguachica", "Agustín Codazzi", "Astrea", "Becerril", "Bosconia",
    "Chimichagua", "Chiriguaná", "Curumaní", "El Copey", "El Paso", "Gamarra",
    "González", "La Gloria", "La Jagua de Ibirico", "La Paz",
    "Manaure Balcón del Cesar", "Pailitas", "Pelaya", "Pueblo Bello",
    "Río de Oro", "San Alberto", "San Diego", "San Martín", "Tamalameque",
    "Valledupar"
  ],
  "Chocó": [
    "Acandí", "Alto Baudó", "Bagadó", "Bahía Solano", "Bajo Baudó",
    "Belén de Bajirá", "Bojayá", "Cantón de San Pablo", "Carmen del Darién",
    "Cértegui", "Condoto", "El Atrato", "El Carmen de Atrato",
    "El Litoral del San Juan", "Istmina", "Juradó", "Lloró", "Medio Atrato",
    "Medio Baudó", "Medio San Juan", "Novita", "Nuquí", "Quibdó", "Río Iró",
    "Río Quito", "Riosucio", "San José del Palmar", "Sipí", "Tadó", "Unguía",
    "Unión Panamericana"
  ],
  "Córdoba": [
    "Ayapel", "Buenavista", "Canalete", "Cereté", "Chimá", "Chinú",
    "Ciénaga de Oro", "Cotorra", "La Apartada", "Lorica", "Los Córdobas",
    "Momil", "Moñitos", "Montelíbano", "Montería", "Planeta Rica",
    "Pueblo Nuevo", "Puerto Escondido", "Puerto Libertador", "Purísima",
    "Sahagún", "San Andrés de Sotavento", "San Antero", "San Bernardo del Viento",
    "San Carlos", "San José de Uré", "San Pelayo", "Tierralta", "Tuchín",
    "Valencia"
  ],
  "Cundinamarca": [
    "Agua de Dios", "Albán", "Anapoima", "Anolaima", "Apulo", "Arbeláez",
    "Beltrán", "Bituima", "Bojacá", "Cabrera", "Cachipay", "Cajicá",
    "Caparrapí", "Cáqueza", "Carmen de Carupa", "Chaguaní", "Chía", "Chipaque",
    "Choachí", "Chocontá", "Cogua", "Cota", "Cucunubá", "El Colegio",
    "El Peñón", "El Rosal", "Facatativá", "Fómeque", "Fosca", "Funza",
    "Fúquene", "Fusagasugá", "Gachalá", "Gachancipá", "Gachetá", "Gama",
    "Girardot", "Granada", "Guachetá", "Guaduas", "Guasca", "Guataquí",
    "Guatavita", "Guayabal de Síquima", "Guayabetal", "Gutiérrez", "Jerusalén",
    "Junín", "La Calera", "La Mesa", "La Palma", "La Peña", "La Vega",
    "Lenguazaque", "Machetá", "Madrid", "Manta", "Medina", "Mosquera",
    "Nariño", "Nemocón", "Nilo", "Nimaima", "Nocaima", "Pacho", "Paime",
    "Pandi", "Paratebueno", "Pasca", "Puerto Salgar", "Pulí", "Quebradanegra",
    "Quetame", "Quipile", "Ricaurte", "San Antonio del Tequendama",
    "San Bernardo", "San Cayetano", "San Francisco", "San Juan de Rioseco",
    "Sasaima", "Sesquilé", "Sibaté", "Silvania", "Simijaca", "Soacha", "Sopó",
    "Subachoque", "Suesca", "Supatá", "Susa", "Sutatausa", "Tabio", "Tausa",
    "Tena", "Tenjo", "Tibacuy", "Tibirita", "Tocaima", "Tocancipá", "Topaipí",
    "Ubalá", "Ubaque", "Ubaté", "Une", "Útica", "Venecia", "Vergara", "Vianí",
    "Villagómez", "Villapinzón", "Villeta", "Viotá", "Yacopí", "Zipacón",
    "Zipaquirá"
  ],
  "Guainía": [
    "Inírida", "Barranco Minas", "Mapiripana", "San Felipe", "Puerto Colombia",
    "La Guadalupe", "Cacahual", "Pana Pana", "Morichal"
  ],
  "Guaviare": [
    "Calamar", "El Retorno", "Miraflores", "San José del Guaviare"
  ],
  "Huila": [
    "Acevedo", "Agrado", "Aipe", "Algeciras", "Altamira", "Baraya",
    "Campoalegre", "Colombia", "Elías", "Garzón", "Gigante", "Guadalupe",
    "Hobo", "Íquira", "Isnos", "La Argentina", "La Plata", "Nátaga", "Neiva",
    "Paicol", "Palermo", "Palestina", "Pital", "Pitalito", "Rivera",
    "Saladoblanco", "San Agustín", "Santa María", "Suaza", "Tarqui", "Tesalia",
    "Tello", "Teruel", "Timaná", "Villavieja", "Yaguará"
  ],
  "La Guajira": [
    "Albania", "Barrancas", "Dibulla", "Distracción", "El Molino", "Fonseca",
    "Hatonuevo", "La Jagua del Pilar", "Maicao", "Manaure", "Riohacha",
    "San Juan del Cesar", "Uribia", "Urumita", "Villanueva"
  ],
  "Magdalena": [
    "Algarrobo", "Aracataca", "Ariguaní", "Cerro de San Antonio", "Chivolo",
    "Ciénaga", "Concordia", "El Banco", "El Piñón", "El Retén", "Fundación",
    "Guamal", "Nueva Granada", "Pedraza", "Pinto", "Pijiño del Carmen",
    "Pivijay", "Plato", "Puebloviejo", "Remolino", "Sabanas de San Ángel",
    "Salamina", "San Sebastián de Buenavista", "San Zenón", "Santa Ana",
    "Santa Bárbara de Pinto", "Santa Marta", "Sitionuevo", "Tenerife",
    "Zapayán", "Zona Bananera"
  ],
  "Meta": [
    "Acacías", "Barranca de Upía", "Cabuyaro", "Castilla la Nueva", "Cubarral",
    "Cumaral", "El Calvario", "El Castillo", "El Dorado", "Fuente de Oro",
    "Granada", "Guamal", "La Macarena", "La Uribe", "Lejanías", "Mapiripán",
    "Mesetas", "Puerto Concordia", "Puerto Gaitán", "Puerto Lleras",
    "Puerto López", "Puerto Rico", "Restrepo", "San Carlos de Guaroa",
    "San Juan de Arama", "San Juanito", "San Martín", "Villavicencio",
    "Vista Hermosa"
  ],
  "Nariño": [
    "Albán", "Aldana", "Ancuyá", "Arboleda", "Barbacoas", "Belén", "Buesaco",
    "Chachagüí", "Colón", "Consacá", "Contadero", "Córdoba", "Cuaspud",
    "Cumbal", "Cumbitara", "El Charco", "El Peñol", "El Rosario",
    "El Tablón de Gómez", "El Tambo", "Francisco Pizarro", "Funes",
    "Guachucal", "Guaitarilla", "Gualmatán", "Iles", "Imúes", "Ipiales",
    "La Cruz", "La Florida", "La Llanada", "La Tola", "La Unión", "Leiva",
    "Linares", "Los Andes", "Magüí Payán", "Mallama", "Mosquera", "Nariño",
    "Olaya Herrera", "Ospina", "Pasto", "Policarpa", "Potosí", "Providencia",
    "Puerres", "Pupiales", "Ricaurte", "Roberto Payán", "Samaniego",
    "San Bernardo", "San Lorenzo", "San Pablo", "San Pedro de Cartago",
    "Sandoná", "Santa Bárbara", "Santacruz", "Sapuyes", "Taminango", "Tangua",
    "Tumaco", "Túquerres", "Yacuanquer"
  ],
  "Norte de Santander": [
    "Ábrego", "Arboledas", "Bochalema", "Bucarasica", "Cácota", "Cáchira",
    "Chinácota", "Chitagá", "Convención", "Cúcuta", "Cucutilla", "Durania",
    "El Carmen", "El Tarra", "El Zulia", "Gramalote", "Hacarí", "Herrán",
    "La Esperanza", "La Playa de Belén", "Labateca", "Los Patios", "Lourdes",
    "Mutiscua", "Ocaña", "Pamplona", "Pamplonita", "Puerto Santander",
    "Ragonvalia", "Salazar de Las Palmas", "San Calixto", "San Cayetano",
    "Santiago", "Sardinata", "Silos", "Teorama", "Tibú", "Toledo",
    "Villa Caro", "Villa del Rosario"
  ],
  "Putumayo": [
    "Colón", "Mocoa", "Orito", "Puerto Asís", "Puerto Caicedo",
    "Puerto Guzmán", "Puerto Leguízamo", "San Francisco", "San Miguel",
    "Santiago", "Sibundoy", "Valle del Guamuez", "Villagarzón"
  ],
  "Quindío": [
    "Armenia", "Buenavista", "Calarcá", "Circasia", "Córdoba", "Filandia",
    "Génova", "La Tebaida", "Montenegro", "Pijao", "Quimbaya", "Salento"
  ],
  "Risaralda": [
    "Apía", "Balboa", "Belén de Umbría", "Dosquebradas", "Guática", "La Celia",
    "La Virginia", "Marsella", "Mistrató", "Pereira", "Pueblo Rico", "Quinchía",
    "Santa Rosa de Cabal", "Santuario"
  ],
  "San Andrés y Providencia": [
    "Providencia y Santa Catalina Islas", "San Andrés"
  ],
  "Santander": [
    "Aguada", "Albania", "Aratoca", "Barbosa", "Barichara", "Barrancabermeja",
    "Betulia", "Bolívar", "Bucaramanga", "Cabrera", "California", "Capitanejo",
    "Carcasí", "Cepitá", "Cerrito", "Charalá", "Charta", "Chima", "Chipatá",
    "Cimitarra", "Concepción", "Confines", "Contratación", "Coromoro", "Curití",
    "El Carmen de Chucurí", "El Guacamayo", "El Peñón", "El Playón", "Encino",
    "Enciso", "Florián", "Floridablanca", "Galán", "Gámbita", "Girón", "Guaca",
    "Guadalupe", "Guapotá", "Guavatá", "Güepsa", "Hato", "Jesús María",
    "Jordán", "La Belleza", "La Paz", "Landázuri", "Lebrija", "Los Santos",
    "Macaravita", "Málaga", "Matanza", "Mogotes", "Molagavita", "Ocamonte",
    "Oiba", "Onzaga", "Palmar", "Palmas del Socorro", "Páramo", "Piedecuesta",
    "Pinchote", "Puente Nacional", "Puerto Parra", "Puerto Wilches", "Rionegro",
    "Sabana de Torres", "San Andrés", "San Benito", "San Gil", "San Joaquín",
    "San José de Miranda", "San Miguel", "San Vicente de Chucurí",
    "Santa Bárbara", "Santa Helena del Opón", "Simacota", "Socorro", "Suaita",
    "Sucre", "Suratá", "Tona", "Valle de San José", "Vélez", "Vetas",
    "Villanueva", "Zapatoca"
  ],
  "Sucre": [
    "Buenavista", "Cairito", "Chalán", "Colosó", "Corozal", "Coveñas",
    "El Roble", "Galeras", "Guaranda", "La Unión", "Los Palmitos", "Majagual",
    "Morroa", "Ovejas", "Palmito", "Sampués", "San Benito Abad",
    "San Juan de Betulia", "San Marcos", "San Onofre", "San Pedro", "Sincé",
    "Sincelejo", "Sucre", "Tolú", "Toluviejo"
  ],
  "Tolima": [
    "Alpujarra", "Alvarado", "Ambalema", "Anzoátegui", "Armero (Guayabal)",
    "Ataco", "Cajamarca", "Carmen de Apicalá", "Casabianca", "Chaparral",
    "Coello", "Coyaima", "Cunday", "Dolores", "Espinal", "Falán", "Flandes",
    "Fresno", "Guamo", "Herveo", "Honda", "Ibagué", "Icononzo", "Lérida",
    "Líbano", "Mariquita", "Melgar", "Murillo", "Natagaima", "Ortega",
    "Palocabildo", "Piedras", "Planadas", "Prado", "Purificación", "Rioblanco",
    "Roncesvalles", "Rovira", "Saldaña", "San Antonio", "San Luis",
    "Santa Isabel", "Suárez", "Valle de San Juan", "Venadillo", "Villahermosa",
    "Villarrica"
  ],
  "Valle del Cauca": [
    "Alcalá", "Andalucía", "Ansermanuevo", "Argelia", "Bolívar", "Buenaventura",
    "Bugalagrande", "Buga", "Caicedonia", "Cali", "Calima (Darién)",
    "Candelaria", "Cartago", "Dagua", "El Águila", "El Cairo", "El Cerrito",
    "El Dovio", "Florida", "Ginebra", "Guacarí", "Jamundí", "La Cumbre",
    "La Unión", "La Victoria", "Obando", "Palmira", "Pradera", "Restrepo",
    "Riofrío", "Roldanillo", "San Pedro", "Sevilla", "Toro", "Trujillo",
    "Tuluá", "Ulloa", "Versalles", "Vijes", "Yotoco", "Yumbo", "Zarzal"
  ],
  "Vaupés": [
    "Carurú", "Mitú", "Taraira", "Papunahua", "Yavaraté", "Pacoa"
  ],
  "Vichada": [
    "Cumaribo", "La Primavera", "Puerto Carreño", "Santa Rosalía"
  ],
};

const DISCIPLINAS = [
  "Pesas",
  "Natación",
  "Subacuático",
  "Lucha"
];

const MAPEO_CATALOGOS = {
  tipoDocumento: {
    cedula_ciudadania: "Cédula de ciudadanía",
    cedula_extranjeria: "Cédula de extranjerÍa",
    pasaporte: "Pasaporte",
    nit: "NIT",
    tarjeta_identidad: "Tarjeta de identidad",
    pep: "Permiso Especial de Permanencia",
  },
  genero: {
    masculino: "Masculino",
    femenino: "Femenino",
    otro: "Otro",
  },
  estado: {
    activo: "Activo",
    inactivo: "Inactivo",
  },
};

type Props = {
  onSubmit?: (data: any) => Promise<void>;
  onCancel?: () => void;
};

// ============================================================================
// COMPONENTE
// ============================================================================

export function RegistroDeportista({ onSubmit: propOnSubmit, onCancel: propOnCancel }: Props = {}) {
  const [paso, setPaso] = useState<1 | 2>(1);
  const [edad, setEdad] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deportistaId, setDeportistaId] = useState<string>("");
  const [errorDuplicado, setErrorDuplicado] = useState<string>("");
  
  const { tiposDocumento, sexos, estados } = useCatalogos();

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
    reset,
  } = useForm<FormDataPersonales>({
    defaultValues: {
      genero: "",
      tipoDocumento: "",
      nacionalidad: "",
      disciplina: "",
      departamento: "",
      ciudad: "",
      estrato: "",
      etnia: "",
    },
  });

  const fechaNacimiento = watch("fechaNacimiento");
  const nacionalidad = watch("nacionalidad");
  const departamento = watch("departamento");
  const genero = watch("genero");
  const numeroDocumento = watch("numeroDocumento");

  useEffect(() => {
    if (fechaNacimiento) {
      const hoy = new Date();
      const nacimiento = new Date(fechaNacimiento);
      let edadCalculada = hoy.getFullYear() - nacimiento.getFullYear();
      const mes = hoy.getMonth() - nacimiento.getMonth();
      
      if (mes < 0 || (mes === 0 && hoy.getDate() < nacimiento.getDate())) {
        edadCalculada--;
      }
      
      setEdad(edadCalculada >= 0 ? edadCalculada : null);
    } else {
      setEdad(null);
    }
  }, [fechaNacimiento]);

  // Limpiar error de duplicado cuando el usuario cambia el documento
  useEffect(() => {
    if (errorDuplicado) {
      setErrorDuplicado("");
    }
  }, [numeroDocumento]);

  // Limpiar ciudad cuando cambia el departamento
  useEffect(() => {
    setValue("ciudad", "");
  }, [departamento, setValue]);

  // =========================================================================
  // PASO 1: DATOS PERSONALES
  // =========================================================================

  const onSubmitPaso1 = async (data: FormDataPersonales) => {
    try {
      setIsLoading(true);
      setErrorDuplicado("");
      
      console.log("Buscando IDs de catálogos...");
      
      const nombreTipoDoc = MAPEO_CATALOGOS.tipoDocumento[data.tipoDocumento as keyof typeof MAPEO_CATALOGOS.tipoDocumento];
      const nombreGenero = MAPEO_CATALOGOS.genero[data.genero as keyof typeof MAPEO_CATALOGOS.genero];
      const nombreEstado = MAPEO_CATALOGOS.estado["activo" as keyof typeof MAPEO_CATALOGOS.estado];
      
      const tipoDocId = tiposDocumento.find((c) => c.nombre === nombreTipoDoc)?.id;
      const sexoId = sexos.find((c) => c.nombre === nombreGenero)?.id;
      const estadoId = estados.find((c) => c.nombre === nombreEstado)?.id;
      
      console.log("IDs encontrados:", { tipoDocId, sexoId, estadoId });
      
      if (!tipoDocId || !sexoId || !estadoId) {
        toast.error("No se encontraron todos los catálogos necesarios");
        console.error("Catálogos no encontrados:", { tipoDocId, sexoId, estadoId });
        setIsLoading(false);
        return;
      }
      
      const partes = data.nombreCompleto.trim().split(" ");
      const nombres = partes.slice(0, -1).join(" ") || partes[0];
      const apellidos = partes[partes.length - 1] || "";
      
      const datosAEnviar = {
        tipo_documento_id: tipoDocId,
        numero_documento: data.numeroDocumento,
        nombres: nombres,
        apellidos: apellidos,
        fecha_nacimiento: data.fechaNacimiento,
        sexo_id: sexoId,
        telefono: data.telefono,
        email: data.correoElectronico,
        direccion: data.direccion,
        estado_id: estadoId,
        tipo_deporte: data.disciplina,
      };
      
      console.log("Enviando al servidor:", JSON.stringify(datosAEnviar, null, 2));
      
      const response = await fetch('http://localhost:8000/api/v1/deportistas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosAEnviar),
      });
      
      console.log("Status HTTP:", response.status);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error del servidor:", errorData);
        const mensajeError = errorData.detail || errorData.message || "Error " + response.status;
        throw new Error(mensajeError);
      }

      const responseData = await response.json();
      console.log("Respuesta del servidor:", responseData);
      
      const id = responseData.id ? String(responseData.id) : null;
      
      if (!id) {
        throw new Error("No se recibió el ID del deportista");
      }
      
      console.log("ID del deportista:", id);
      setDeportistaId(id);
      toast.success("Datos personales registrados correctamente");
      setPaso(2);
    } catch (error: any) {
      console.error("Error en onSubmitPaso1:", error.message);
      if (error.message && error.message.toLowerCase().includes("ya existe")) {
        setErrorDuplicado(error.message);
        toast.error(error.message, { duration: 6000 });
      } else {
        toast.error("Error: " + error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const esColombia = nacionalidad === "Colombia";
  const ciudadesDisponibles = departamento ? CIUDADES_POR_DEPARTAMENTO[departamento] || [] : [];

  const handleCancel = async () => {
    try {
      if (deportistaId) {
        console.log("Eliminando deportista:", deportistaId);
        await fetch("http://localhost:8000/api/v1/deportistas/" + deportistaId, {
          method: 'DELETE',
        });
      }
      
      setDeportistaId("");
      setErrorDuplicado("");
      setPaso(1);
      reset();
      
      if (propOnCancel) {
        propOnCancel();
      }
    } catch (error) {
      console.error("Error al cancelar registro:", error);
      toast.error("Error al cancelar el registro");
    }
  };

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className="max-w-4xl mx-auto p-6 py-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        {/* Indicador de pasos */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4 flex-1">
            <div className={paso >= 1 ? "w-8 h-8 rounded-full flex items-center justify-center font-bold bg-blue-600 text-white" : "w-8 h-8 rounded-full flex items-center justify-center font-bold bg-gray-300 text-gray-600"}>
              1
            </div>
            <span className={paso >= 2 ? "flex-1 h-1 bg-blue-600" : "flex-1 h-1 bg-gray-300"}></span>
            <div className={paso >= 2 ? "w-8 h-8 rounded-full flex items-center justify-center font-bold bg-blue-600 text-white" : "w-8 h-8 rounded-full flex items-center justify-center font-bold bg-gray-300 text-gray-600"}>
              2
            </div>
          </div>
        </div>

        {/* PASO 1: Datos Personales */}
        {paso === 1 && (
          <form onSubmit={handleSubmit(onSubmitPaso1)} className="space-y-8">
            <h1 className="text-center mb-8 text-blue-600 text-3xl font-bold">Paso 1: Datos Personales</h1>

            <div className="space-y-5">
              <h2 className="flex items-center gap-2 pb-2 border-b-2 border-blue-500">
                <User className="w-5 h-5 text-blue-600" />
                Información General
              </h2>

              <div>
                <label className="block mb-2">Nombre completo <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  className={errors.nombreCompleto ? "w-full px-4 py-2 border rounded-md border-red-500" : "w-full px-4 py-2 border rounded-md border-gray-300"}
                  placeholder="Ingrese el nombre completo"
                  {...register("nombreCompleto", { required: "Requerido" })}
                />
                {errors.nombreCompleto && <p className="text-red-500 mt-1">{errors.nombreCompleto.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Fecha de nacimiento <span className="text-red-500">*</span></label>
                  <input
                    type="date"
                    className={errors.fechaNacimiento ? "w-full px-4 py-2 border rounded-md border-red-500" : "w-full px-4 py-2 border rounded-md border-gray-300"}
                    max={new Date().toISOString().split("T")[0]}
                    {...register("fechaNacimiento", { required: "Requerido" })}
                  />
                  {errors.fechaNacimiento && <p className="text-red-500 mt-1">{errors.fechaNacimiento.message}</p>}
                </div>
                <div>
                  <label className="block mb-2">Edad</label>
                  <div className="w-full px-4 py-2 border border-gray-300 rounded-md bg-gray-50">
                    {edad !== null ? edad + " años" : "-"}
                  </div>
                </div>
              </div>

              <div>
                <label className="block mb-2">Género <span className="text-red-500">*</span></label>
                <select
                  className={errors.genero ? "w-full px-4 py-2 border rounded-md border-red-500" : "w-full px-4 py-2 border rounded-md border-gray-300"}
                  {...register("genero", { required: "Requerido" })}
                >
                  <option value="">Seleccione...</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
            </div>

            <div className="space-y-5">
              <h2 className="flex items-center gap-2 pb-2 border-b-2 border-blue-500">
                <Trophy className="w-5 h-5 text-blue-600" />
                Documento e Información Deportiva
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block mb-2">Tipo de documento <span className="text-red-500">*</span></label>
                  <select className="w-full px-4 py-2 border rounded-md" {...register("tipoDocumento", { required: "Requerido" })}>
                    <option value="">Seleccione...</option>
                    <option value="cedula_ciudadania">Cédula de ciudadanía</option>
                    <option value="pasaporte">Pasaporte</option>
                    <option value="nit">NIT</option>
                  </select>
                </div>
                <div>
                  <label className="block mb-2">Número de documento <span className="text-red-500">*</span></label>
                  <input
                    type="text"
                    className={errorDuplicado ? "w-full px-4 py-2 border rounded-md border-red-500 bg-red-50" : "w-full px-4 py-2 border rounded-md"}
                    {...register("numeroDocumento", { required: "Requerido" })}
                  />
                  {errorDuplicado && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-300 rounded-md flex items-start gap-2">
                      <span className="text-red-500 text-lg mt-0.5">⚠️</span>
                      <div>
                        <p className="text-red-700 font-semibold text-sm">{errorDuplicado}</p>
                        <p className="text-red-600 text-xs mt-1">Verifique el numero de documento o busque al deportista en el listado.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block mb-2">Disciplina <span className="text-red-500">*</span></label>
                <select className="w-full px-4 py-2 border rounded-md" {...register("disciplina", { required: "Requerido" })}>
                  <option value="">Seleccione...</option>
                  {DISCIPLINAS.map(function(disciplina) {
                    return <option key={disciplina} value={disciplina}>{disciplina}</option>;
                  })}
                </select>
              </div>
            </div>

            <div className="space-y-5">
              <h2 className="flex items-center gap-2 pb-2 border-b-2 border-blue-500">
                <Phone className="w-5 h-5 text-blue-600" />
                Contacto y Ubicación
              </h2>

              <div>
                <label className="block mb-2">Teléfono <span className="text-red-500">*</span></label>
                <input type="tel" className="w-full px-4 py-2 border rounded-md" {...register("telefono", { required: "Requerido" })} />
              </div>

              <div>
                <label className="block mb-2">Email <span className="text-red-500">*</span></label>
                <input type="email" className="w-full px-4 py-2 border rounded-md" {...register("correoElectronico", { required: "Requerido" })} />
              </div>

              <div>
                <label className="block mb-2">Dirección <span className="text-red-500">*</span></label>
                <input type="text" className="w-full px-4 py-2 border rounded-md" {...register("direccion", { required: "Requerido" })} />
              </div>

              <div>
                <label className="block mb-2">Nacionalidad <span className="text-red-500">*</span></label>
                <select className="w-full px-4 py-2 border rounded-md" {...register("nacionalidad", { required: "Requerido" })}>
                  <option value="">Seleccione...</option>
                  {PAISES.map(function(pais) {
                    return <option key={pais} value={pais}>{pais}</option>;
                  })}
                </select>
              </div>

              {esColombia && (
                <>
                  <div>
                    <label className="block mb-2">Departamento</label>
                    <select className="w-full px-4 py-2 border rounded-md" {...register("departamento")}>
                      <option value="">Seleccione...</option>
                      {DEPARTAMENTOS.map(function(dept) {
                        return <option key={dept} value={dept}>{dept}</option>;
                      })}
                    </select>
                  </div>
                  {departamento && ciudadesDisponibles.length > 0 && (
                    <div>
                      <label className="block mb-2">Ciudad / Municipio</label>
                      <select className="w-full px-4 py-2 border rounded-md" {...register("ciudad")}>
                        <option value="">Seleccione...</option>
                        {ciudadesDisponibles.map(function(ciudad) {
                          return <option key={ciudad} value={ciudad}>{ciudad}</option>;
                        })}
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700 font-medium"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white py-3 px-6 rounded-md hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                Siguiente
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </form>
        )}

        {/* PASO 2: Vacunas */}
        {paso === 2 && (
          <div className="space-y-8">
            <h1 className="text-center mb-8 text-blue-600 text-3xl font-bold">Paso 2: Registro de Vacunas</h1>
            
            <p className="text-gray-600 text-center mb-6">
              Complete el registro de vacunas del deportista. Puede cargar certificados en PDF, JPG o PNG.
            </p>

            {deportistaId && deportistaId !== "" ? (
              <VacunasHistoriaClinica
                deportista_id={deportistaId}
                readonly={false}
              />
            ) : (
              <div className="text-center py-8 bg-yellow-50 rounded-lg border border-yellow-200">
                <p className="text-yellow-800 font-medium">Cargando información del deportista...</p>
              </div>
            )}

            <div className="flex gap-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 text-white py-3 px-6 rounded-md hover:bg-red-700 font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={function() { setPaso(1); }}
                className="flex-1 flex items-center justify-center gap-2 bg-gray-300 text-gray-700 py-3 px-6 rounded-md hover:bg-gray-400 font-medium"
              >
                <ChevronLeft className="w-5 h-5" />
                Anterior
              </button>
              <button
                onClick={async function() {
                  if (propOnSubmit) {
                    await propOnSubmit({ deportistaId });
                  } else {
                    toast.success("Registro completado!");
                  }
                }}
                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-md hover:bg-green-700 font-medium"
              >
                Finalizar Registro
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default RegistroDeportista;