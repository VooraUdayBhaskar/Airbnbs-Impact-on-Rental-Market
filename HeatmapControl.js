import React, { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";
import "leaflet.heat";

const HeatmapControl = ({ showHeatmap, setShowHeatmap, points }) => {
  const map = useMap();

  useEffect(() => {
    let heatLayer;

    if (showHeatmap) {
      // Add heatmap layer
      heatLayer = L.heatLayer(
        points.map((point) => [point.latitude, point.longitude, 0.5]), // Add intensity (default: 0.5)
        {
          radius: 25,
          blur: 15,
          maxZoom: 17,
        }
      ).addTo(map);
    }

    return () => {
      if (heatLayer) {
        map.removeLayer(heatLayer); // Remove heatmap when toggled off
      }
    };
  }, [showHeatmap, map, points]);

  useEffect(() => {
    const customControl = L.Control.extend({
      options: {
        position: "topleft",
      },
      onAdd: function () {
        const container = L.DomUtil.create("div", "leaflet-bar leaflet-control leaflet-control-custom");
        container.style.backgroundColor = "white";
        container.style.width = "30px";
        container.style.height = "30px";
        container.style.cursor = "pointer";
        container.style.backgroundImage = "url('https://img.icons8.com/ios-filled/50/000000/fire-element.png')";
        container.style.backgroundSize = "20px";
        container.style.backgroundPosition = "center";
        container.style.backgroundRepeat = "no-repeat";
        container.title = "Toggle Heatmap";

        container.onclick = function () {
          setShowHeatmap((prev) => !prev);
        };

        return container;
      },
    });

    map.addControl(new customControl());

    return () => {
      const existingControls = document.querySelectorAll(".leaflet-control-custom");
      existingControls.forEach((control) => control.remove());
    };
  }, [map, setShowHeatmap]);

  return null;
};

export default HeatmapControl;
