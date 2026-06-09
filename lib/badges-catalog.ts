/** Metadatos UI para tipos de insignia (tabla `badges` + catálogo). */
export const BADGE_CATALOG: Record<
  string,
  { name: string; description: string; points: number }
> = {
  FIRST_TRAINING: {
    name: "Primera Capacitación",
    description: "Completaste tu primera capacitación",
    points: 100,
  },
  STREAK_5: {
    name: "Racha de 5",
    description: "Completa 5 capacitaciones seguidas",
    points: 200,
  },
  STREAK_10: {
    name: "Racha de 10",
    description: "Completa 10 capacitaciones seguidas",
    points: 400,
  },
  TOP_SCORER: {
    name: "Mejor Puntuación",
    description: "Obtén la mejor puntuación del mes",
    points: 500,
  },
  PERFECT_SCORE: {
    name: "Puntuación Perfecta",
    description: "Obtén 100% en una evaluación",
    points: 300,
  },
  EARLY_BIRD: {
    name: "Madrugador",
    description: "Completa una capacitación antes de la fecha límite",
    points: 150,
  },
  TEAM_PLAYER: {
    name: "Jugador de Equipo",
    description: "Ayuda a compañeros en sus capacitaciones",
    points: 250,
  },
};
