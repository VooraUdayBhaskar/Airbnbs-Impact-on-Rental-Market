import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Papa from "papaparse";
import L from "leaflet";
import HeatmapControl from "./HeatmapControl";
import ChoroplethControl from "./ChoroplethControl";
import NeighborhoodGraphs from "./NeighborhoodGraphs";
import NeighborhoodAnalysis from "./NeighborhoodAnalysis";
import * as d3 from "d3";
import "./App.css";

// Set default marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const App = () => {
  const [data, setData] = useState([]); // Airbnb data from CSV
  const [geojsonData, setGeojsonData] = useState(null); // GeoJSON data
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null); // Selected neighborhood
  const [highlightedListings, setHighlightedListings] = useState([]); // Listings for the selected neighborhood
  const [showGraphs, setShowGraphs] = useState(false); // Graph modal toggle
  const [showHeatmap, setShowHeatmap] = useState(false); // Heatmap toggle state
  const [showChoropleth, setShowChoropleth] = useState(false); // Choropleth toggle state
  const [showNeighborhoodAnalysis, setShowNeighborhoodAnalysis] = useState(false); // Neighborhood analysis toggle
  const [rentalPrices, setRentalPrices] = useState([]);
  const [airbnbPrices, setAirbnbPrices] = useState([]);

  // Load Airbnb CSV data
  useEffect(() => {
    Papa.parse("/filtered_listings.csv", {
      download: true,
      header: true,
      complete: (result) => {
        const locations = result.data.map((row) => ({
          id: row.id,
          latitude: parseFloat(row.latitude),
          longitude: parseFloat(row.longitude),
          neighbourhood: row.neighbourhood,
        }));
        setData(locations.filter((loc) => loc.latitude && loc.longitude));
      },
    });
  }, []);

  // Load GeoJSON data
  useEffect(() => {
    fetch("/neighbourhoods.geojson")
      .then((response) => response.json())
      .then((data) => setGeojsonData(data))
      .catch((error) => console.error("Error loading GeoJSON:", error));
  }, []);

  // Fetch data for graphs when a neighborhood is selected
  const fetchNeighborhoodData = async (neighborhood) => {
    try {
      const rentalData = await d3.csv("/filled_prices_dataset.csv");
      const airbnbData = await d3.csv("/filtered_listings.csv");

      const matchingZipcodes = airbnbData
        .filter((item) => String(item.neighbourhood).trim() === String(neighborhood).trim())
        .map((item) => String(item.zip_code).trim());

      const rentalPrices = rentalData
        .filter((item) => matchingZipcodes.includes(String(item.RegionName).trim()))
        .map((item) => ({
          december: parseFloat(item["31-12-2023"]),
          march: parseFloat(item["31-03-2024"]),
          june: parseFloat(item["30-06-2024"]),
        }));

      const meanRentalPrices = [
        d3.mean(rentalPrices, (d) => d.december),
        d3.mean(rentalPrices, (d) => d.march),
        d3.mean(rentalPrices, (d) => d.june),
      ];

      const meanAirbnbPrices = [
        d3.mean(
          airbnbData
            .filter((d) => matchingZipcodes.includes(String(d.zip_code).trim()))
            .map((d) => parseFloat(d["31-12-2023"]))
        ),
        d3.mean(
          airbnbData
            .filter((d) => matchingZipcodes.includes(String(d.zip_code).trim()))
            .map((d) => parseFloat(d["31-03-2024"]))
        ),
        d3.mean(
          airbnbData
            .filter((d) => matchingZipcodes.includes(String(d.zip_code).trim()))
            .map((d) => parseFloat(d["30-06-2024"]))
        ),
      ];

      setRentalPrices(meanRentalPrices);
      setAirbnbPrices(meanAirbnbPrices);
    } catch (error) {
      console.error("Error fetching neighborhood data:", error);
    }
  };

  // Handle "View Listings"
  const handleViewListings = (neighborhood) => {
    const listings = data.filter((loc) => loc.neighbourhood === neighborhood);
    setHighlightedListings(listings);
    setSelectedNeighborhood(neighborhood);
  };

  return (
    <div className="App">
      <h1>Neighborhood Visualization</h1>
      <MapContainer center={[41.8781, -87.6298]} zoom={10} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {geojsonData && (
          <GeoJSON
            data={geojsonData}
            onEachFeature={(feature, layer) => {
              const neighborhood = feature.properties.neighbourhood;
              layer.bindPopup(
                `<strong>${neighborhood}</strong><br>
                 <button id="view-listings-${neighborhood}">View Listings</button>
                 <button id="view-graphs-${neighborhood}">View Graphs</button>`
              );

              layer.on("popupopen", () => {
                document
                  .getElementById(`view-listings-${neighborhood}`)
                  .addEventListener("click", () => handleViewListings(neighborhood));

                document
                  .getElementById(`view-graphs-${neighborhood}`)
                  .addEventListener("click", () => {
                    fetchNeighborhoodData(neighborhood);
                    setSelectedNeighborhood(neighborhood);
                    setShowGraphs(true);
                  });
              });
            }}
          />
        )}
        {highlightedListings.map((listing, idx) => (
          <Marker key={idx} position={[listing.latitude, listing.longitude]}>
            <Popup>
              <strong>Listing ID: {listing.id}</strong>
              <br />
              Neighborhood: {listing.neighbourhood}
            </Popup>
          </Marker>
        ))}
        <HeatmapControl
          showHeatmap={showHeatmap}
          setShowHeatmap={setShowHeatmap}
          points={data}
        />
        <ChoroplethControl
          showChoropleth={showChoropleth}
          setShowChoropleth={setShowChoropleth}
          geojsonData={geojsonData}
          data={data.reduce((acc, loc) => {
            acc[loc.neighbourhood] = (acc[loc.neighbourhood] || 0) + 1;
            return acc;
          }, {})}
        />
      </MapContainer>

      {/* Toggle for Neighborhood Analysis */}
      <div style={{ textAlign: "center", margin: "20px" }}>
        <button
          onClick={() => setShowNeighborhoodAnalysis(!showNeighborhoodAnalysis)}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer",
            backgroundColor: showNeighborhoodAnalysis ? "#007bff" : "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "5px",
          }}
        >
          {showNeighborhoodAnalysis ? "Hide Neighborhood Analysis" : "Show Neighborhood Analysis"}
        </button>
      </div>

      {/* Render Neighborhood Analysis */}
      {showNeighborhoodAnalysis && <NeighborhoodAnalysis geojsonData={geojsonData} />}

      {/* Render Graphs */}
      {showGraphs && (
        <NeighborhoodGraphs
          isOpen={showGraphs}
          onClose={() => setShowGraphs(false)}
          neighborhood={selectedNeighborhood || ""}
          rentalPrices={rentalPrices}
          airbnbPrices={airbnbPrices}
        />
      )}
    </div>
  );
};

export default App;
