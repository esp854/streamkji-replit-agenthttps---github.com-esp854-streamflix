// Static fallback data for when TMDB API is completely unavailable
// This ensures the app always has content to display

export const STATIC_MOVIES = [
  {
    id: 1,
    title: "Action Movie 1",
    overview: "Un film d'action palpitant avec des cascades spectaculaires.",
    release_date: "2023-01-15",
    vote_average: 7.8,
    poster_path: "/placeholder-poster.jpg",
    backdrop_path: "/placeholder-backdrop.jpg",
    genre_ids: [28, 12, 878],
    adult: false,
    original_language: "fr",
    original_title: "Action Movie 1",
    popularity: 1500.5,
    video: false,
    vote_count: 1250
  },
  {
    id: 2,
    title: "Comédie Française",
    overview: "Une comédie légère qui vous fera rire aux éclats.",
    release_date: "2023-02-20",
    vote_average: 6.9,
    poster_path: "/placeholder-poster.jpg",
    backdrop_path: "/placeholder-backdrop.jpg",
    genre_ids: [35, 10749],
    adult: false,
    original_language: "fr",
    original_title: "Comédie Française",
    popularity: 1200.3,
    video: false,
    vote_count: 890
  },
  {
    id: 3,
    title: "Drame Émotionnel",
    overview: "Un drame poignant sur la vie et les relations humaines.",
    release_date: "2023-03-10",
    vote_average: 8.2,
    poster_path: "/placeholder-poster.jpg",
    backdrop_path: "/placeholder-backdrop.jpg",
    genre_ids: [18, 10749],
    adult: false,
    original_language: "fr",
    original_title: "Drame Émotionnel",
    popularity: 980.7,
    video: false,
    vote_count: 2100
  },
  {
    id: 4,
    title: "Film d'Horreur",
    overview: "Un thriller horrifique qui vous tiendra en haleine.",
    release_date: "2023-04-05",
    vote_average: 7.1,
    poster_path: "/placeholder-poster.jpg",
    backdrop_path: "/placeholder-backdrop.jpg",
    genre_ids: [27, 53],
    adult: false,
    original_language: "fr",
    original_title: "Film d'Horreur",
    popularity: 1350.2,
    video: false,
    vote_count: 750
  }
];

export const STATIC_TV_SHOWS = [
  {
    id: 1,
    name: "Série Policière",
    overview: "Une série captivante sur des enquêtes criminelles complexes.",
    first_air_date: "2022-09-15",
    vote_average: 8.5,
    poster_path: "/placeholder-poster.jpg",
    backdrop_path: "/placeholder-backdrop.jpg",
    genre_ids: [80, 18, 9648],
    adult: false,
    original_language: "fr",
    original_name: "Série Policière",
    popularity: 1800.8,
    origin_country: ["FR"],
    vote_count: 3200
  },
  {
    id: 2,
    name: "Comédie Sitcom",
    overview: "Une sitcom drôle sur la vie quotidienne d'une famille moderne.",
    first_air_date: "2022-10-20",
    vote_average: 7.6,
    poster_path: "/placeholder-poster.jpg",
    backdrop_path: "/placeholder-backdrop.jpg",
    genre_ids: [35, 10751],
    adult: false,
    original_language: "fr",
    original_name: "Comédie Sitcom",
    popularity: 1450.4,
    origin_country: ["FR"],
    vote_count: 1800
  },
  {
    id: 3,
    name: "Drame Historique",
    overview: "Une série historique sur des événements marquants de l'histoire.",
    first_air_date: "2022-11-10",
    vote_average: 8.8,
    poster_path: "/placeholder-poster.jpg",
    backdrop_path: "/placeholder-backdrop.jpg",
    genre_ids: [18, 36],
    adult: false,
    original_language: "fr",
    original_name: "Drame Historique",
    popularity: 2100.6,
    origin_country: ["FR"],
    vote_count: 4500
  }
];

export const STATIC_GENRES = [
  { id: 28, name: "Action" },
  { id: 12, name: "Aventure" },
  { id: 16, name: "Animation" },
  { id: 35, name: "Comédie" },
  { id: 80, name: "Crime" },
  { id: 99, name: "Documentaire" },
  { id: 18, name: "Drame" },
  { id: 10751, name: "Familial" },
  { id: 14, name: "Fantastique" },
  { id: 36, name: "Histoire" },
  { id: 27, name: "Horreur" },
  { id: 10402, name: "Musique" },
  { id: 9648, name: "Mystère" },
  { id: 10749, name: "Romance" },
  { id: 878, name: "Science-Fiction" },
  { id: 10770, name: "Téléfilm" },
  { id: 53, name: "Thriller" },
  { id: 10752, name: "Guerre" },
  { id: 37, name: "Western" }
];

// Function to get static data based on endpoint
export function getStaticFallbackData(endpoint: string) {
  if (endpoint.includes('/trending') || endpoint.includes('/popular')) {
    return {
      page: 1,
      results: STATIC_MOVIES,
      total_pages: 1,
      total_results: STATIC_MOVIES.length
    };
  }

  if (endpoint.includes('/tv/popular') || endpoint.includes('/tv/')) {
    return {
      page: 1,
      results: STATIC_TV_SHOWS,
      total_pages: 1,
      total_results: STATIC_TV_SHOWS.length
    };
  }

  if (endpoint.includes('/genre/')) {
    return {
      page: 1,
      results: STATIC_MOVIES.filter(movie =>
        movie.genre_ids.includes(parseInt(endpoint.split('/genre/')[1]))
      ),
      total_pages: 1,
      total_results: STATIC_MOVIES.length
    };
  }

  // Default fallback
  return {
    page: 1,
    results: STATIC_MOVIES.slice(0, 2),
    total_pages: 1,
    total_results: 2
  };
}