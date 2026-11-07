import React, { useEffect, useState } from "react";
import { CircleMarker, MapContainer, Popup, TileLayer } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface ListingMapProps {
    location: string;
    country: string;
}

interface Coordinates {
    latitude: number;
    longitude: number;
}

type MapState =
    | { status: "loading" }
    | { status: "ready"; coordinates: Coordinates }
    | { status: "error"; message: string };

export const ListingMap: React.FC<ListingMapProps> = ({
    location,
    country,
}) => {
    const [mapState, setMapState] = useState<MapState>({ status: "loading" });
    const searchLocation = `${location}, ${country}`;

    useEffect(() => {
        const controller = new AbortController();
        const query = encodeURIComponent(searchLocation);

        setMapState({ status: "loading" });
        fetch(
            `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${query}`,
            { signal: controller.signal },
        )
            .then((response) => {
                if (!response.ok) {
                    throw new Error("Location lookup failed.");
                }
                return response.json();
            })
            .then((results: Array<{ lat: string; lon: string }>) => {
                const result = results[0];
                const latitude = Number(result?.lat);
                const longitude = Number(result?.lon);

                if (
                    !result ||
                    !Number.isFinite(latitude) ||
                    !Number.isFinite(longitude)
                ) {
                    throw new Error("Location could not be found on the map.");
                }

                setMapState({
                    status: "ready",
                    coordinates: { latitude, longitude },
                });
            })
            .catch((error: unknown) => {
                if (error instanceof DOMException && error.name === "AbortError") {
                    return;
                }
                console.error("Failed to geocode listing location:", error);
                setMapState({
                    status: "error",
                    message:
                        error instanceof Error
                            ? error.message
                            : "Location could not be found on the map.",
                });
            });

        return () => controller.abort();
    }, [searchLocation]);

    if (mapState.status === "loading") {
        return (
            <div className="listing-map listing-map-placeholder">
                <p>Loading map for {searchLocation}...</p>
            </div>
        );
    }

    if (mapState.status === "error") {
        return (
            <div className="listing-map listing-map-placeholder listing-map-error">
                <p>{mapState.message}</p>
                <span>Location: {searchLocation}</span>
            </div>
        );
    }

    const position: [number, number] = [
        mapState.coordinates.latitude,
        mapState.coordinates.longitude,
    ];

    return (
        <div className="listing-map">
            <MapContainer
                center={position}
                zoom={12}
                scrollWheelZoom={false}
                className="listing-map-container"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <CircleMarker
                    center={position}
                    radius={10}
                    pathOptions={{
                        color: "#fe424d",
                        fillColor: "#fe424d",
                        fillOpacity: 0.8,
                    }}
                >
                    <Popup>{searchLocation}</Popup>
                </CircleMarker>
            </MapContainer>
        </div>
    );
};
