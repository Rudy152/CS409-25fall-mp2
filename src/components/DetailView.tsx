import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Movie, MovieDetails } from '../types/Movie';
import { getMovieDetails, getPosterUrl, getTopRatedMovies } from '../services/tmdbApi';
import './DetailView.css';

const DetailView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadMovies = useCallback(async () => {
    // Try to get movies from navigation state first
    const stateMovies = (location.state as any)?.movies;
    if (stateMovies && stateMovies.length > 0) {
      setMovies(stateMovies);
    } else {
      // Load top rated movies
      const allMovies: Movie[] = [];
      for (let page = 1; page <= 13; page++) {
        const pageMovies = await getTopRatedMovies(page);
        allMovies.push(...pageMovies);
        if (allMovies.length >= 250) break;
      }
      setMovies(allMovies.slice(0, 250));
    }
  }, [location.state]);

  const loadMovieDetails = useCallback(async (movieId: number) => {
    setLoading(true);
    const details = await getMovieDetails(movieId);
    setMovie(details);
    
    // Find current index
    const index = movies.findIndex((m) => m.id === movieId);
    setCurrentIndex(index);
    setLoading(false);
  }, [movies]);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  useEffect(() => {
    if (id && movies.length > 0) {
      loadMovieDetails(parseInt(id));
    }
  }, [id, movies, loadMovieDetails]);

  const handlePrevious = () => {
    if (currentIndex > 0) {
      const prevMovie = movies[currentIndex - 1];
      navigate(`/detail/${prevMovie.id}`, { state: { movies } });
    }
  };

  const handleNext = () => {
    if (currentIndex < movies.length - 1) {
      const nextMovie = movies[currentIndex + 1];
      navigate(`/detail/${nextMovie.id}`, { state: { movies } });
    }
  };

  if (loading || !movie) {
    return <div className="loading">Loading movie details...</div>;
  }

  const rank = movies.findIndex((m) => m.id === movie.id) + 1;

  return (
    <div className="detail-view">
      <div className="detail-container">
        <div className="detail-navigation">
          <button
            className="nav-btn"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
          >
            &lt;
          </button>
          <button
            className="nav-btn"
            onClick={handleNext}
            disabled={currentIndex === movies.length - 1}
          >
            &gt;
          </button>
        </div>

        <div className="detail-content">
          <div className="detail-header">
            <h1 className="detail-title">{movie.title}</h1>
            <p className="detail-rank">Rank: {rank}</p>
          </div>

          <div className="detail-body">
            <img
              src={getPosterUrl(movie.poster_path, 'w500')}
              alt={movie.title}
              className="detail-poster"
            />

            <div className="detail-info">
              <p className="detail-overview">{movie.overview}</p>

              <div className="detail-meta">
                <p>
                  <strong>Released:</strong>{' '}
                  {new Date(movie.release_date).toLocaleDateString('en-US', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </p>
                <p>
                  <strong>Runtime:</strong> {movie.runtime} min
                </p>
                {movie.genres && movie.genres.length > 0 && (
                  <p>
                    <strong>Genres:</strong> {movie.genres.map((g) => g.name).join(', ')}
                  </p>
                )}
                <p>
                  <strong>Rating:</strong> ★ {movie.vote_average.toFixed(1)} / 10
                </p>
                <p>
                  <strong>Votes:</strong> {movie.vote_count.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetailView;

