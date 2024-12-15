import React, { useState } from "react";
import { MapContainer, TileLayer, GeoJSON } from "react-leaflet";
import * as d3 from "d3";
import "leaflet/dist/leaflet.css";

const NeighborhoodAnalysis = ({ geojsonData }) => {
  const [neighborhoodColors, setNeighborhoodColors] = useState({});
  const [neighborhoodLabels, setNeighborhoodLabels] = useState({});

  const analyzeSpecificNeighborhood = async (neighborhood, layer) => {
    try {
      const rentalData = await d3.csv("/filled_prices_dataset.csv");
      const airbnbData = await d3.csv("/filtered_listings.csv");

      const neighborhoodToZipMap = d3.group(
        airbnbData,
        (d) => d.neighbourhood.trim().toLowerCase()
      );

      const matchingZipcodes = (neighborhoodToZipMap.get(neighborhood) || []).map(
        (item) => String(item.zip_code).trim()
      );

      if (!matchingZipcodes.length) {
        console.warn(`No ZIP codes for ${neighborhood}`);
        neighborhoodLabels[neighborhood] = "No Data";
        setNeighborhoodLabels({ ...neighborhoodLabels });
        layer.bindTooltip(
          `<strong>${neighborhood}</strong><br>Recommendation: No Data`,
          { permanent: true, className: "custom-tooltip" }
        ).openTooltip();
        return;
      }

      const rentalPrices = rentalData
        .filter((item) => matchingZipcodes.includes(String(item.RegionName).trim()))
        .map((item) => ({
          december: parseFloat(item["31-12-2023"]),
          march: parseFloat(item["31-03-2024"]),
          june: parseFloat(item["30-06-2024"]),
        }))
        .filter(
          (price) =>
            !isNaN(price.december) &&
            !isNaN(price.march) &&
            !isNaN(price.june)
        );

      const airbnbPrices = {
        december: d3.mean(
          airbnbData
            .filter((d) => matchingZipcodes.includes(String(d.zip_code).trim()))
            .map((d) => parseFloat(d["31-12-2023"]))
        ),
        march: d3.mean(
          airbnbData
            .filter((d) => matchingZipcodes.includes(String(d.zip_code).trim()))
            .map((d) => parseFloat(d["31-03-2024"]))
        ),
        june: d3.mean(
          airbnbData
            .filter((d) => matchingZipcodes.includes(String(d.zip_code).trim()))
            .map((d) => parseFloat(d["30-06-2024"]))
        ),
      };

      if (!rentalPrices.length || Object.values(airbnbPrices).some((price) => isNaN(price))) {
        console.warn(`No rental or Airbnb data for ${neighborhood}`);
        neighborhoodLabels[neighborhood] = "No Data";
        setNeighborhoodLabels({ ...neighborhoodLabels });
        layer.bindTooltip(
          `<strong>${neighborhood}</strong><br>Recommendation: No Data`,
          { permanent: true, className: "custom-tooltip" }
        ).openTooltip();
        return;
      }

      const averageRentalPrices = {
        december: d3.mean(rentalPrices.map((p) => p.december)),
        march: d3.mean(rentalPrices.map((p) => p.march)),
        june: d3.mean(rentalPrices.map((p) => p.june)),
      };

      const rentalTrend =
        averageRentalPrices.june > averageRentalPrices.march &&
        averageRentalPrices.march > averageRentalPrices.december;
      const rentalDecrease =
        averageRentalPrices.june < averageRentalPrices.march &&
        averageRentalPrices.march < averageRentalPrices.december;

      const airbnbTrend =
        airbnbPrices.june > airbnbPrices.march && airbnbPrices.march > airbnbPrices.december;
      const airbnbDecrease =
        airbnbPrices.june < airbnbPrices.march && airbnbPrices.march < airbnbPrices.december;

      let recommendation;
      if (rentalTrend && airbnbTrend) {
        neighborhoodColors[neighborhood] = "pink";
        neighborhoodLabels[neighborhood] = "Invest";
        recommendation = "Invest";
      } else if (rentalDecrease && airbnbDecrease) {
        neighborhoodColors[neighborhood] = "red";
        neighborhoodLabels[neighborhood] = "Don't Invest";
        recommendation = "Don't Invest";
      } else {
        neighborhoodColors[neighborhood] = "orange";
        neighborhoodLabels[neighborhood] = "Caution";
        recommendation = "Caution";
      }

      setNeighborhoodColors({ ...neighborhoodColors });
      setNeighborhoodLabels({ ...neighborhoodLabels });

      layer.bindTooltip(
        `<strong>${neighborhood}</strong><br>Recommendation: ${recommendation}`,
        { permanent: true, className: "custom-tooltip" }
      ).openTooltip();

      layer.setStyle({
        color: neighborhoodColors[neighborhood],
        weight: 2,
        opacity: 0.7,
      });
    } catch (error) {
      console.error(`Error analyzing ${neighborhood}:`, error);
    }
  };

  const getNeighborhoodStyle = (feature) => ({
    color: neighborhoodColors[feature.properties.neighbourhood.trim().toLowerCase()] || "blue",
    weight: 2,
    opacity: 0.7,
  });

  return (
    <MapContainer
      center={[41.8781, -87.6298]}
      zoom={10}
      style={{ height: "600px", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {geojsonData && (
        <GeoJSON
          data={geojsonData}
          style={getNeighborhoodStyle}
          onEachFeature={(feature, layer) => {
            const neighborhood = feature.properties.neighbourhood.trim().toLowerCase();

            layer.bindPopup(`
              <div>
                <strong>${feature.properties.neighbourhood}</strong>
                <br />
                <button id="analyze-${neighborhood}">Run Analysis</button>
              </div>
            `);

            layer.on("popupopen", () => {
              document
                .getElementById(`analyze-${neighborhood}`)
                .addEventListener("click", () => {
                  analyzeSpecificNeighborhood(neighborhood, layer);
                });
            });
          }}
        />
      )}
    </MapContainer>
  );
};

export default NeighborhoodAnalysis;
