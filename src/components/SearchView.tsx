import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types/Movie';
import { getTopRatedMovies, getPosterUrl } from '../services/tmdbApi';
import './SearchView.css';

type SortField = 'title' | 'vote_average' | 'release_date' | 'popularity';
type SortOrder = 'ascending' | 'descending';

const SearchView: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filteredMovies, setFilteredMovies] = useState<Movie[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortOrder, setSortOrder] = useState<SortOrder>('ascending');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const loadMovies = useCallback(async () => {
    setLoading(true);
    const allMovies: Movie[] = [];
    // Load multiple pages to get top 250
    for (let page = 1; page <= 13; page++) {
      const pageMovies = await getTopRatedMovies(page);
      allMovies.push(...pageMovies);
      if (allMovies.length >= 250) break;
    }
    setMovies(allMovies.slice(0, 250));
    setLoading(false);
  }, []);

  const filterAndSortMovies = useCallback(() => {
    let filtered = [...movies];

    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any;
      let bValue: any;

      switch (sortField) {
        case 'title':
          aValue = a.title.toLowerCase();
          bValue = b.title.toLowerCase();
          break;
        case 'vote_average':
          aValue = a.vote_average;
          bValue = b.vote_average;
          break;
        case 'release_date':
          aValue = new Date(a.release_date).getTime();
          bValue = new Date(b.release_date).getTime();
          break;
        case 'popularity':
          aValue = a.popularity;
          bValue = b.popularity;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortOrder === 'ascending' ? -1 : 1;
      if (aValue > bValue) return sortOrder === 'ascending' ? 1 : -1;
      return 0;
    });

    setFilteredMovies(filtered);
  }, [movies, searchQuery, sortField, sortOrder]);

  useEffect(() => {
    loadMovies();
  }, [loadMovies]);

  useEffect(() => {
    filterAndSortMovies();
  }, [filterAndSortMovies]);

  const handleMovieClick = (movieId: number) => {
    navigate(`/detail/${movieId}`, { state: { movies: filteredMovies } });
  };

  if (loading) {
    return <div className="loading">Loading movies...</div>;
  }

  return (
    <div className="search-view">
      <div className="search-controls">
        <input
          type="text"
          className="search-input"
          placeholder="Search for a movie..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="sort-controls">
          <label>Sort by:</label>
          <select
            className="sort-select"
            value={sortField}
            onChange={(e) => setSortField(e.target.value as SortField)}
          >
            <option value="title">Title</option>
            <option value="vote_average">Rating</option>
            <option value="release_date">Release Date</option>
            <option value="popularity">Popularity</option>
          </select>

          <div className="sort-order">
            <label>
              <input
                type="radio"
                value="ascending"
                checked={sortOrder === 'ascending'}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              />
              ascending
            </label>
            <label>
              <input
                type="radio"
                value="descending"
                checked={sortOrder === 'descending'}
                onChange={(e) => setSortOrder(e.target.value as SortOrder)}
              />
              descending
            </label>
          </div>
        </div>
      </div>

      <div className="movie-list">
        {filteredMovies.map((movie, index) => (
          <div
            key={movie.id}
            className="movie-item"
            onClick={() => handleMovieClick(movie.id)}
          >
            <img
              src={getPosterUrl(movie.poster_path, 'w200')}
              alt={movie.title}
              className="movie-poster-small"
            />
            <div className="movie-info">
              <h3 className="movie-title">{movie.title}</h3>
              <p className="movie-rank">Rank: {movies.indexOf(movie) + 1}</p>
            </div>
          </div>
        ))}
      </div>

      {filteredMovies.length === 0 && (
        <div className="no-results">No movies found</div>
      )}
    </div>
  );
};

export default SearchView;

