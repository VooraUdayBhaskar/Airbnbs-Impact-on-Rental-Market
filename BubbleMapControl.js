import React, { useEffect } from "react";
import L from "leaflet";
import { useMap } from "react-leaflet";

const BubbleMapControl = ({ showBubbleMap, setShowBubbleMap, data }) => {
  const map = useMap();

  // Define color scale for price ranges
  const getColorForPrice = (price) => {
    if (price < 500) return "green"; // Low price
    if (price < 1000) return "yellow"; // Medium price
    if (price < 2000) return "orange"; // High price
    return "red"; // Very high price
  };

  useEffect(() => {
    let bubbleLayer;

    if (showBubbleMap) {
      // Create a layer group for bubbles
      bubbleLayer = L.layerGroup(
        data.map((entry) => {
          if (entry.price && entry.latitude && entry.longitude) {
            const radius = Math.sqrt(entry.price) * 0.1; // Adjust scaling factor for bubbles
            const color = getColorForPrice(entry.price); // Get color for price range

            const bubble = L.circleMarker([entry.latitude, entry.longitude], {
              radius: radius, // Bubble size proportional to price
              color: color, // Dynamic color based on price range
              weight: 1,
              fillColor: color,
              fillOpacity: 0.8,
            });

            // Add hover popup to show price
            bubble.bindPopup(`Price: $${entry.price.toFixed(2)}`);

            return bubble;
          }
          return null;
        })
      );

      bubbleLayer.addTo(map);
    }

    return () => {
      if (bubbleLayer) {
        map.removeLayer(bubbleLayer); // Remove bubble layer on toggle off
      }
    };
  }, [showBubbleMap, map, data]);

  useEffect(() => {
    // Add custom control for Bubble Map toggle
    const customControl = L.Control.extend({
      options: { position: "topleft" },
      onAdd: function () {
        const container = L.DomUtil.create(
          "div",
          "leaflet-bar leaflet-control leaflet-control-custom"
        );
        container.style.backgroundColor = "white";
        container.style.width = "30px";
        container.style.height = "30px";
        container.style.cursor = "pointer";
        container.style.backgroundImage =
          "url('https://img.icons8.com/ios-filled/50/000000/fire-element.png')";
        container.style.backgroundSize = "20px";
        container.style.backgroundPosition = "center";
        container.style.backgroundRepeat = "no-repeat";
        container.title = "Toggle Bubble Map";

        container.onclick = function () {
          setShowBubbleMap((prev) => !prev);
        };

        return container;
      },
    });

    const bubbleControl = new customControl();
    map.addControl(bubbleControl);

    return () => {
      map.removeControl(bubbleControl); // Cleanup on unmount
    };
  }, [map, setShowBubbleMap]);

  return null;
};

export default BubbleMapControl;
