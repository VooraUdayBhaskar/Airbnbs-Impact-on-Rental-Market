import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, GeoJSON } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import Papa from "papaparse";
import L from "leaflet";
import HeatmapControl from "./HeatmapControl";
import ChoroplethControl from "./ChoroplethControl";
import NeighborhoodGraphs from "./NeighborhoodGraphs";
import * as d3 from 'd3'; // Install d3 for CSV processing: `npm install d3`


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
  const [selectedNeighborhood, setSelectedNeighborhood] = useState(null); // Selected neighborhood for focus
  const [highlightedListings, setHighlightedListings] = useState([]); // Listings for the selected neighborhood
  const [showGraphs, setShowGraphs] = useState(false); // Graph modal toggle
  const [rentalPrices, setRentalPrices] = useState([]);
  const [airbnbPrices, setAirbnbPrices] = useState([]);
  const [showHeatmap, setShowHeatmap] = useState(false); // Heatmap toggle state
const [showChoropleth, setShowChoropleth] = useState(false); // Choropleth toggle state


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

  // Fetch rental and Airbnb prices for graphs
 

  const fetchNeighborhoodData = async (neighborhood) => {
    try {
      // Fetch rental prices dataset
      const rentalData = await d3.csv("/filled_prices_dataset.csv");
      console.log("Rental Data Loaded:", rentalData);
  
      // Fetch Airbnb listings dataset (used as a mapping table)
      const airbnbData = await d3.csv("/filtered_listings.csv");
      console.log("Airbnb Data Loaded:", airbnbData);
  
      // Get all zip codes for the selected neighborhood
      const matchingZipcodes = airbnbData
        .filter((item) => String(item.neighbourhood).trim() === String(neighborhood).trim())
        .map((item) => String(item.zip_code).trim());
  
      console.log("Matching Zipcodes for Neighborhood:", matchingZipcodes);
  
      // Filter rental prices by matching zip codes
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
  
      console.log("Mean Rental Prices:", meanRentalPrices);
  
      // Group Airbnb prices by zip_code
      const airbnbGroupedByZipcode = d3.groups(airbnbData, (d) => String(d.zip_code).trim());
      const meanPricesByZipcode = airbnbGroupedByZipcode.map(([zip_code, listings]) => ({
        zip_code,
        december: d3.mean(listings, (listing) => parseFloat(listing["31-12-2023"])),
        march: d3.mean(listings, (listing) => parseFloat(listing["31-03-2024"])),
        june: d3.mean(listings, (listing) => parseFloat(listing["30-06-2024"])),
      }));
  
      console.log("Mean Prices by Zipcode:", meanPricesByZipcode);
  
      // Match Airbnb prices to the selected neighborhood based on zip codes
      const neighborhoodAirbnbPrices = meanPricesByZipcode
        .filter((entry) => matchingZipcodes.includes(entry.zip_code))
        .map((entry) => ({
          december: entry.december,
          march: entry.march,
          june: entry.june,
        }));
  
      console.log("Filtered Airbnb Prices for Neighborhood:", neighborhoodAirbnbPrices);
  
      const meanAirbnbPrices = [
        d3.mean(neighborhoodAirbnbPrices, (d) => d.december),
        d3.mean(neighborhoodAirbnbPrices, (d) => d.march),
        d3.mean(neighborhoodAirbnbPrices, (d) => d.june),
      ];
  
      console.log("Mean Airbnb Prices:", meanAirbnbPrices);
  
      // Set state with processed data
      setRentalPrices(meanRentalPrices);
      setAirbnbPrices(meanAirbnbPrices);
    } catch (error) {
      console.error("Error fetching neighborhood data:", error);
    }
  };
  
  
  

  // Handle "View Listings"
  const handleViewListings = (neighborhood) => {
    const listings = data.filter((loc) => loc.neighbourhood === neighborhood);
    setHighlightedListings(listings); // Highlight listings
    setSelectedNeighborhood(neighborhood); // Focus on the neighborhood
  };

  // Handle "View Graphs"
  const handleViewGraphs = (neighborhood) => {
    console.log("Selected Neighborhood for Graphs:", neighborhood); // Debugging
    setSelectedNeighborhood(neighborhood); // Update selected neighborhood
    fetchNeighborhoodData(neighborhood); // Fetch data for the graphs
    setShowGraphs(true); // Open the graph modal
};

  

  // GeoJSON layer styling
  const getNeighborhoodStyle = (feature) => ({
    color:
      selectedNeighborhood === feature.properties.neighbourhood
        ? "green"
        : "blue", // Highlight selected neighborhood in green
    weight: selectedNeighborhood === feature.properties.neighbourhood ? 3 : 2,
    opacity: 0.7,
  });

  return (
    <div className="App">
      <h1>Neighborhood Visualization</h1>
      <MapContainer center={[41.8781, -87.6298]} zoom={10} style={{ height: "600px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        {geojsonData && (
          <GeoJSON
            data={geojsonData}
            style={getNeighborhoodStyle}
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
                  .addEventListener("click", () =>
                    handleViewListings(neighborhood)
                  );

                document
                  .getElementById(`view-graphs-${neighborhood}`)
                  .addEventListener("click", () =>
                    handleViewGraphs(neighborhood)
                  );
              });
            }}
          />
        )}
        {/* Render Highlighted Listings */}
        {highlightedListings.map((listing, idx) => (
          <Marker key={idx} position={[listing.latitude, listing.longitude]}>
            <Popup>
              <strong>Listing ID: {listing.id}</strong>
              <br />
              Neighborhood: {listing.neighbourhood}
            </Popup>
          </Marker>
        ))}
        <HeatmapControl showHeatmap={showHeatmap} setShowHeatmap={setShowHeatmap} points={data} />
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

      {/* Neighborhood Graphs */}
      <NeighborhoodGraphs
  isOpen={showGraphs} // Show only when "View Graphs" is clicked
  onClose={() => setShowGraphs(false)} // Close the graph box
  neighborhood={selectedNeighborhood || ""} // Pass the selected neighborhood
  rentalPrices={rentalPrices}
  airbnbPrices={airbnbPrices}
/>

    </div>
  );
};

export default App;