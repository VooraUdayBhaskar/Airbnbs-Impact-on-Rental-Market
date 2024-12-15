import React, { useEffect } from "react";
import L from "leaflet";
import { useMap, GeoJSON } from "react-leaflet";
import chroma from "chroma-js";

const ChoroplethControl = ({ showChoropleth, setShowChoropleth, geojsonData, data }) => {
  const map = useMap();

  useEffect(() => {
    const customControl = L.Control.extend({
      options: { position: "topleft" },
      onAdd: function () {
        const container = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
        container.style.backgroundColor = "white";
        container.style.width = "30px";
        container.style.height = "30px";
        container.style.cursor = "pointer";
        container.style.backgroundImage = "url('https://img.icons8.com/ios-filled/50/000000/palette.png')";
        container.style.backgroundSize = "20px";
        container.style.backgroundPosition = "center";
        container.style.backgroundRepeat = "no-repeat";
        container.title = "Toggle Choropleth";

        container.onclick = function () {
          setShowChoropleth((prev) => !prev);
        };

        return container;
      },
    });

    map.addControl(new customControl());

    return () => {
      const controls = document.querySelectorAll(".leaflet-control-custom");
      controls.forEach((control) => control.remove());
    };
  }, [map, setShowChoropleth]);

  // Define the color scale
  const getColor = (value) => {
    const scale = chroma.scale(["#f2f0f7", "#d4b9da", "#980043"]).domain([0, 50]); // Adjust domain for your data range
    return scale(value || 0).hex(); // Default to 0 if value is undefined
  };

  // Define the style for each GeoJSON feature
  const getStyle = (feature) => {
    const neighborhood = feature.properties.neighbourhood; // Match the GeoJSON property
    const count = data[neighborhood] || 0; // Get the density for the neighborhood
    return {
      fillColor: getColor(count),
      weight: 1,
      color: "black",
      fillOpacity: 0.7,
    };
  };

  return (
    <>
      {showChoropleth && geojsonData && (
        <GeoJSON
          data={geojsonData}
          style={getStyle}
          onEachFeature={(feature, layer) => {
            const neighborhood = feature.properties.neighbourhood; // Match with density
            const count = data[neighborhood] || 0;
            layer.bindPopup(`<strong>${neighborhood}</strong><br>Listings: ${count}`);
          }}
        />
      )}
    </>
  );
};

export default ChoroplethControl;
