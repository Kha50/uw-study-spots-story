# UW Study Spots — GeoNarrative (Lab 7)

## AI Disclosure

I used AI in this assignment only to help debug code that was not running correctly and to identify issues with layout and file linking. AI was not used to write the project content, design the narrative, or complete any prohibited components. I understand the code in this project and am able to explain the implementation, map behavior, and styling decisions.

Live site: https://Kha50.github.io/uw-study-spots-story/

## Topic
A GeoNarrative about popular study locations on the UW Seattle campus.

## Data (external geospatial dataset)
A curated GeoJSON file of UW study spots (points) stored in `data/studyspots.geojson`.

## Two different map views (requirement)
This story uses two different map representations:
- **Point symbols** to show exact study spot locations (best for clicking and seeing details).
- **Heatmap** to show the *concentration* of study options across campus (best for spatial patterns).

These appear in different scenes as you scroll.

## Tech used
- Mapbox GL JS (web mapping)
- Scrollama (scroll-driven storytelling)
- Bootstrap (footer)