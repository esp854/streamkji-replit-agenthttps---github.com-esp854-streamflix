# Import Marvel Content Guide

## Overview
This guide explains how to import Marvel movies and TV series into your StreamFlix platform.

## Methods to Import Marvel Content

### 1. Using the Admin Dashboard (Recommended)

1. Navigate to the Admin Dashboard
2. Go to the "Gestion des Contenus" (Content Management) tab
3. In the search section, enter "Marvel" in the search box
4. Click the "Rechercher" (Search) button
5. Browse through the search results for movies and TV shows
6. Click the "Importer" (Import) button on any Marvel content you want to add

### 2. Using Command Line

You can also import Marvel content using the command line:

```bash
# Import Marvel content
npm run import-marvel
```

Or search for specific Marvel content:

```bash
# Import specific Marvel content
npx tsx server/import-content.ts "Marvel Studios"
```

### 3. Using the General Import Function

The existing import function will also import popular Marvel content:

```bash
# Import all popular content (including Marvel)
npm run import-content
```

## What Gets Imported

For each Marvel movie/TV show, the following information is imported:
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

## Adding Video Links

After importing Marvel content, you'll need to add video links:

1. In the Admin Dashboard, go to "Gestion des Contenus"
2. Find the imported Marvel content
3. Click the "Ajouter lien" (Add link) button
4. Enter the video URL (Odysee, YouTube, or Vimeo)
5. Click "Ajouter le lien" (Add link)

## Popular Marvel Content

The system will automatically import popular Marvel content including:
- Marvel Cinematic Universe (MCU) movies
- Marvel TV series like "WandaVision", "Loki", "Moon Knight", etc.
- Animated Marvel series
- Marvel documentaries

## Troubleshooting

If you encounter issues:

1. Make sure your TMDB_API_KEY is properly configured in your .env file
2. Check that you have internet connectivity
3. Verify that you're using an admin account
4. Check the server logs for any error messages

## Manual Import

If you need to manually add Marvel content:

1. Find the TMDB ID of the Marvel content you want to add
2. In the Admin Dashboard, click "Ajouter un contenu" (Add content)
3. Fill in the TMDB ID and other required information
4. Click "Ajouter le contenu" (Add content)