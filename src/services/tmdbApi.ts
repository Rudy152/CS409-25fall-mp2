import axios from 'axios';
import { Movie, MovieDetails, Genre } from '../types/Movie';

const API_KEY = '19f2a697e180e475dd33222da9e1dcc1';
const BASE_URL = 'https://api.themoviedb.org/3';
export const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p';

const tmdbApi = axios.create({
  baseURL: BASE_URL,
  params: {
    api_key: API_KEY,
  },
});

export const getTopRatedMovies = async (page: number = 1): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get('/movie/top_rated', {
      params: { page },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching top rated movies:', error);
    return [];
  }
};

export const getMovieDetails = async (movieId: number): Promise<MovieDetails | null> => {
  try {
    const response = await tmdbApi.get(`/movie/${movieId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
};

export const getGenres = async (): Promise<Genre[]> => {
  try {
    const response = await tmdbApi.get('/genre/movie/list');
    return response.data.genres;
  } catch (error) {
    console.error('Error fetching genres:', error);
    return [];
  }
};

export const getMoviesByGenre = async (genreId: number): Promise<Movie[]> => {
  try {
    const response = await tmdbApi.get('/discover/movie', {
      params: {
        with_genres: genreId,
        sort_by: 'popularity.desc',
      },
    });
    return response.data.results;
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    return [];
  }
};

export const getPosterUrl = (path: string | null, size: string = 'w500'): string => {
  if (!path) return '/placeholder.png';
  return `${IMAGE_BASE_URL}/${size}${path}`;
};

