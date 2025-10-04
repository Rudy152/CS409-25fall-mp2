import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie, Genre } from '../types/Movie';
import { getTopRatedMovies, getGenres, getPosterUrl } from '../services/tmdbApi';
import './GalleryView.css';

const GalleryView: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadData = useCallback(async () => {
    setLoading(true);
    const [genresData] = await Promise.all([getGenres()]);
    setGenres(genresData);

    const allMovies: Movie[] = [];
    for (let page = 1; page <= 13; page++) {
      const pageMovies = await getTopRatedMovies(page);
      allMovies.push(...pageMovies);
      if (allMovies.length >= 250) break;
    }
    setMovies(allMovies.slice(0, 250));
    setLoading(false);
  }, []);

  const filterMovies = useCallback(() => {
    if (selectedGenres.length === 0) {
      setFilteredMovies(movies);
    } else {
      const filtered = movies.filter((movie) =>
        selectedGenres.every((genreId) => movie.genre_ids.includes(genreId))
      );
      setFilteredMovies(filtered);
    }
  }, [movies, selectedGenres]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    filterMovies();
  }, [filterMovies]);

  const toggleGenre = (genreId: number) => {
    setSelectedGenres((prev) => {
      if (prev.includes(genreId)) {
        return prev.filter((id) => id !== genreId);
      } else {
        return [...prev, genreId];
      }
    });
  };

  const handleMovieClick = (movieId: number) => {
    navigate(`/detail/${movieId}`, { state: { movies: filteredMovies } });
  };

  if (loading) {
    return <div className="loading">Loading gallery...</div>;
  }

  return (
    <div className="gallery-view">
      <div className="genre-filters">
        <button
          className={selectedGenres.length === 0 ? 'genre-btn active' : 'genre-btn'}
          onClick={() => setSelectedGenres([])}
        >
          All
        </button>
        {genres.map((genre) => (
          <button
            key={genre.id}
            className={selectedGenres.includes(genre.id) ? 'genre-btn active' : 'genre-btn'}
            onClick={() => toggleGenre(genre.id)}
          >
            {genre.name}
          </button>
        ))}
      </div>

      <div className="gallery-grid">
        {filteredMovies.map((movie) => (
          <div
            key={movie.id}
            className="gallery-item"
            onClick={() => handleMovieClick(movie.id)}
          >
            <img
              src={getPosterUrl(movie.poster_path, 'w500')}
              alt={movie.title}
              className="gallery-poster"
            />
            <div className="gallery-overlay">
              <h3 className="gallery-title">{movie.title}</h3>
              <p className="gallery-rating">★ {movie.vote_average.toFixed(1)}</p>
            </div>
          </div>
        ))}
      </div>

      {filteredMovies.length === 0 && (
        <div className="no-results">No movies found for selected genres</div>
      )}
    </div>
  );
};

export default GalleryView;

