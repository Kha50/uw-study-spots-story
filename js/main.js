/* global scrollama, mapboxgl, MAPBOX_TOKEN */

let map;
const scroller = scrollama();

function HUD(text) {
  const el = document.getElementById("hud-text");
  if (el) el.textContent = text;
}

function adjustStoryboardSize() {
  if (map) map.resize();
}
window.addEventListener("resize", adjustStoryboardSize);

async function loadGeoJSON(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to load ${url}`);
  return await res.json();
}

(async function init() {
  mapboxgl.accessToken = MAPBOX_TOKEN;

  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/light-v10",
    center: [-122.309, 47.656],
    zoom: 14.3,
    pitch: 0
  });

  map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }), "top-right");

  const spots = await loadGeoJSON("data/studyspots.geojson");

  map.on("load", () => {
    // Source
    map.addSource("studyspots", {
      type: "geojson",
      data: spots
    });

    // Layers
    const pointsLayer = {
      id: "spots-points",
      type: "circle",
      source: "studyspots",
      paint: {
        "circle-radius": 7,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#ffffff",
        "circle-color": [
          "match",
          ["get", "noise"],
          "quiet", "#4c78a8",
          "mixed", "#f58518",
          "social", "#e45756",
          "#72b7b2"
        ],
        "circle-opacity": 0.9
      }
    };

    const heatLayer = {
      id: "spots-heat",
      type: "heatmap",
      source: "studyspots",
      maxzoom: 17,
      paint: {
        "heatmap-intensity": 1.1,
        "heatmap-radius": 35,
        "heatmap-opacity": 0.85
      }
    };

    const quietFilterLayer = {
      id: "spots-quiet",
      type: "circle",
      source: "studyspots",
      filter: ["==", ["get", "noise"], "quiet"],
      paint: {
        "circle-radius": 10,
        "circle-stroke-width": 2,
        "circle-stroke-color": "#000000",
        "circle-color": "#2ca02c",
        "circle-opacity": 0.9
      }
    };

    function showLayer(id, layerDef) {
      if (!map.getLayer(id)) map.addLayer(layerDef);
    }

    function hideLayer(id) {
      if (map.getLayer(id)) map.removeLayer(id);
    }

    // Popup helpers
    function attachPopup(layerId) {
      map.on("click", layerId, (e) => {
        const f = e.features && e.features[0];
        if (!f) return;
        const p = f.properties;

        new mapboxgl.Popup()
          .setLngLat(f.geometry.coordinates)
          .setHTML(`
            <div style="max-width:220px">
              <b>${p.name}</b><br/>
              <div><i>${p.vibe}</i></div>
              <div><b>Best for:</b> ${p.best_for}</div>
              <div><b>Noise:</b> ${p.noise}</div>
            </div>
          `)
          .addTo(map);
      });

      map.on("mouseenter", layerId, () => (map.getCanvas().style.cursor = "pointer"));
      map.on("mouseleave", layerId, () => (map.getCanvas().style.cursor = ""));
    }

    attachPopup("spots-points");
    attachPopup("spots-quiet");

    // Scrollama behavior
    scroller
      .setup({
        step: ".scene",
        offset: 0.33,
        debug: false
      })
      .onStepEnter(({ index }) => {
        document.querySelectorAll(".scene").forEach((el) => el.classList.remove("is-active"));
        const active = document.querySelector(`.scene[data-scene="${index}"]`);
        if (active) active.classList.add("is-active");
        if (index >= 0) document.getElementById("cover").style.visibility = "hidden";

        if (index === 0) {
          HUD("Points (all study spots)");
          hideLayer("spots-heat");
          hideLayer("spots-quiet");
          showLayer("spots-points", pointsLayer);

          map.flyTo({ center: [-122.309, 47.656], zoom: 14.3, pitch: 0, speed: 0.6 });

        } else if (index === 1) {
          HUD("Heatmap (concentration)");
          hideLayer("spots-points");
          hideLayer("spots-quiet");
          showLayer("spots-heat", heatLayer);

          map.flyTo({ center: [-122.309, 47.656], zoom: 14.0, pitch: 0, speed: 0.6 });

        } else if (index === 2) {
          HUD("Quiet spots (filtered)");
          hideLayer("spots-heat");
          hideLayer("spots-points");
          showLayer("spots-quiet", quietFilterLayer);

          map.flyTo({ center: [-122.3088, 47.6562], zoom: 15.0, pitch: 0, speed: 0.6 });

        } else if (index === 3) {
          HUD("Recommendations view");
          hideLayer("spots-heat");
          hideLayer("spots-quiet");
          showLayer("spots-points", pointsLayer);

          map.flyTo({ center: [-122.3083, 47.6558], zoom: 15.4, pitch: 25, speed: 0.6 });
        }
      })
      .onStepExit(({ index, direction }) => {
        if (index === 0 && direction === "up") {
          document.getElementById("cover").style.visibility = "visible";
          HUD("Cover");
        }
      });

    adjustStoryboardSize();
  });
})();