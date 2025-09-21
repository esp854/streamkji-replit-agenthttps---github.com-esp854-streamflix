# Content Import Guide

## Overview
This guide explains how to import movies and TV shows from TMDB (The Movie Database) into your StreamFlix platform.

## Automatic Import via Admin Dashboard

### Using the Import Button
1. Navigate to the Admin Dashboard
2. Go to the "Gestion des Contenus" (Content Management) tab
3. Click the "Importer depuis TMDB" (Import from TMDB) button
4. Wait for the import process to complete
5. The system will automatically import:
   - 60 popular movies (3 pages × 20 movies per page)
   - 60 popular TV shows (3 pages × 20 shows per page)

### Searching for Specific Content
1. Navigate to the Admin Dashboard
2. Go to the "Gestion des Contenus" (Content Management) tab
3. Enter a search query (e.g., "Marvel", "Harry Potter") in the search box
4. Click the "Rechercher" (Search) button
5. Browse the search results in the tabs for movies and TV shows
6. Click the "Importer" (Import) button on any content you want to add

### What Gets Imported
For each movie/TV show, the following information is imported:
- `tmdbId` - TMDB identifier
- `title` - Title in French
- `description` - Overview/synopsis
- `posterPath` - Poster image path
- `backdropPath` - Background image path
- `releaseDate` - Release date
- `genres` - Genre IDs
- `language` - Defaulted to "vf" (French)
- `quality` - Defaulted to "hd"
- `mediaType` - "movie" or "tv"
- `rating` - Rating converted to 0-100 scale
- `active` - Set to true by default
- `odyseeUrl` - Empty by default (to be filled later)

## Manual Import Script

### Running the Import Script
You can also run the import script manually:

```bash
cd /path/to/your/project
node server/import-movies.ts
```

This script will:
1. Fetch popular movies from TMDB (5 pages = 100 movies)
2. Fetch popular TV shows from TMDB (5 pages = 100 shows)
3. Add each item to your database if it doesn't already exist
4. Display a summary of what was imported

### Searching for Specific Content via Command Line
You can search for and import specific content using the command line:

```bash
# Import Marvel content
npm run import-marvel

# Search for and import specific content
npx tsx server/import-content.ts "Harry Potter"
```

## Adding Video Links

After importing content, you'll need to add video links:

1. In the Admin Dashboard, go to "Gestion des Contenus"
2. Find the content you want to add a video link to
3. Click the "Ajouter lien" (Add link) button
4. Enter the Zupload URL for the content
5. Save the changes

## Technical Details

### Database Schema
The imported content follows this schema:
```typescript
interface Content {
  id: string;
  tmdbId: number;
  title: string;
  description: string;
  posterPath: string;
  backdropPath: string;
  releaseDate: string;
  genres: string[];
  odyseeUrl: string;
  muxPlaybackId: string;
  muxUrl: string;
  language: string;
  quality: string;
  mediaType: 'movie' | 'tv';
  rating: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
```

### API Endpoints
- `POST /api/admin/import-content` - Import popular content from TMDB (admin only)
- `POST /api/admin/search-content` - Search for content on TMDB (admin only)
- `POST /api/admin/import-content-by-id` - Import specific content by TMDB ID (admin only)
- `GET /api/contents/tmdb/:tmdbId` - Get content by TMDB ID
- `POST /api/admin/content` - Add new content
- `PUT /api/admin/content/:id` - Update existing content

### Rate Limiting
The import process includes built-in rate limiting to prevent overwhelming the TMDB API:
- Small delays between requests
- Caching of API responses
- Error handling for API limits

## Troubleshooting

### Common Issues
1. **TMDB API Key Not Configured**
   - Ensure `TMDB_API_KEY` is set in your environment variables
   - Check your `.env` file

2. **Database Connection Issues**
   - Verify your database connection settings
   - Check that the database is running

3. **Content Already Exists**
   - The system automatically skips content that already exists
   - Check the console output for details

### Logs
Import operations are logged to the console and can be viewed in:
- Server logs
- Browser developer console (for dashboard imports)

## Best Practices

1. **Regular Imports**
   - Run imports periodically to keep content fresh
   - Consider scheduling automatic imports

2. **Content Management**
   - Review imported content for accuracy
   - Add video links promptly for better user experience

3. **Performance**
   - Don't run multiple imports simultaneously
   - Monitor system resources during imports

4. **Data Quality**
   - Verify that imported content displays correctly
   - Check that images load properly
   - Test video playback after adding links