import type { Curso, Juego, Plan } from '@/types';

export const CURSOS: Curso[] = [
  { id: 'adopcion-digital', title: 'Adopción Digital', desc: 'Introducción al mundo digital para familias. Aprende a integrar la tecnología de forma segura y positiva en el día a día.', tag: 'familia', icon: '📱' },
  { id: 'dibujo-neuroplasticidad', title: 'Dibujo pro Neuroplasticidad', desc: 'Desarrolla creatividad y conexiones neuronales a través del dibujo. Técnicas artísticas con base científica.', tag: 'dibujo', icon: '🎨' },
  { id: 'alfabetizacion-padres', title: 'Alfabetización para Padres', desc: 'Herramientas digitales esenciales para padres. Desde configurar controles parentales hasta entender las redes sociales.', tag: 'familia', icon: '👨‍👩‍👧' },
  { id: 'curso-gemini', title: 'Curso de Gemini', desc: 'Aprende a usar Google Gemini para potenciar tu productividad, creatividad y aprendizaje.', tag: 'ia', icon: '✦' },
  { id: 'curso-chatgpt', title: 'Curso de ChatGPT', desc: 'Domina ChatGPT desde cero. Prompts efectivos, casos de uso prácticos y automatización de tareas.', tag: 'ia', icon: '🤖' },
  { id: 'curso-claude', title: 'Curso de Claude', desc: 'Explora las capacidades de Claude para análisis, escritura, programación y razonamiento avanzado.', tag: 'ia', icon: '🧠' },
  { id: 'curso-python', title: 'Curso de Python', desc: 'Programación desde cero con Python. Variables, funciones, proyectos prácticos y pensamiento computacional.', tag: 'tech', icon: '🐍' },
];

export const JUEGOS: Juego[] = [
  { id: 'cocodigo', title: 'CoCoding', desc: 'Aprende programación de forma colaborativa. Resuelve desafíos de código con otros jugadores en tiempo real.', icon: '💻' },
  { id: 'paintup', title: 'PaintUp', desc: 'Desafíos de dibujo cronometrados. Mejora tu técnica artística mientras compites y te diviertes.', icon: '🎨' },
  { id: 'metodos', title: 'Métodos de Estudio', desc: 'Gamifica tu aprendizaje. Técnicas como Pomodoro, Feynman y Leitner convertidas en juegos interactivos.', icon: '📖' },
];

export const PLANES: Plan[] = [
  {
    name: 'Basic', price: '$6.000', period: '/mes', featured: false, available: true,
    features: ['Acceso a todos los cursos', 'Videos exclusivos premium', 'Progreso guardado', 'Comunidad del blog', 'Soporte por email'],
  },
  {
    name: 'Pro', price: '$55.000', period: '/año', savings: 'Ahorras $17.000 vs mensual', featured: true, available: false,
    features: ['Todo lo del plan Basic', 'Acceso anticipado a nuevos cursos', 'Descargas offline', 'Certificados de finalización', 'Soporte prioritario'],
  },
];

export const FAQ = [
  { q: '¿Puedo cancelar en cualquier momento?', a: 'Sí, puedes cancelar tu suscripción cuando quieras desde tu cuenta de MercadoPago. No hay permanencia mínima.' },
  { q: '¿Qué métodos de pago aceptan?', a: 'Aceptamos tarjetas de débito y crédito a través de MercadoPago. No necesitas tener una cuenta de MercadoPago para suscribirte.' },
  { q: '¿Qué incluye el contenido premium?', a: 'Videos exclusivos, cursos completos con material descargable, progreso guardado entre sesiones y acceso a la comunidad.' },
  { q: '¿Puedo compartir mi cuenta?', a: 'Cada suscripción es personal. Estamos trabajando en un plan familiar para el futuro.' },
];
