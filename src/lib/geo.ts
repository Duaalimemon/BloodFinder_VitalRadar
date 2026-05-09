import { geohashForLocation, distanceBetween } from 'geofire-common';

export const getGeohash = (lat: number, lng: number) => {
  return geohashForLocation([lat, lng]);
};

export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  return distanceBetween([lat1, lng1], [lat2, lng2]);
};
