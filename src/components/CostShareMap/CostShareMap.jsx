import { useMemo } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import './CostShareMap.css'

// Fix Leaflet default icon issue with bundlers
import L from 'leaflet'
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
})

const SD_CENTER = [44.3, -99.5]
const SD_ZOOM = 7

function getFundingColor(amount) {
  if (amount > 50000) return '#1A6B82'
  if (amount > 20000) return '#2D8FA8'
  if (amount > 10000) return '#4CA5C2'
  return '#8ECFE0'
}

function getRadius(acres) {
  return Math.min(Math.max(acres / 50, 5), 20)
}

function formatCurrency(val) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'USD',
    minimumFractionDigits: 0, maximumFractionDigits: 0,
  }).format(val)
}

export default function CostShareMap({ data }) {
  // Aggregate by farm (group rows by personId to get one marker per farm)
  const farms = useMemo(() => {
    if (!data || data.length === 0) return []

    const farmMap = {}
    data.forEach((r) => {
      const key = r.personId || r.fullName
      if (!key) return
      if (!farmMap[key]) {
        farmMap[key] = {
          fullName: r.fullName,
          farmName: r.farmName,
          lat: r.lat,
          lng: r.longitude,
          totalFunding: 0,
          totalAcres: 0,
          practices: new Set(),
          contracts: new Set(),
          stream: r.stream,
        }
      }
      farmMap[key].totalFunding += r.totalAmount
      farmMap[key].totalAcres += r.practiceAcres
      if (r.bmp) farmMap[key].practices.add(r.bmp)
      if (r.contractId) farmMap[key].contracts.add(r.contractId)
      // Use the most recent valid coordinates
      if (r.lat && r.longitude) {
        farmMap[key].lat = r.lat
        farmMap[key].lng = r.longitude
      }
    })

    return Object.values(farmMap).filter((f) => f.lat && f.lng)
  }, [data])

  if (farms.length === 0) {
    return <div className="chart-empty">No location data available</div>
  }

  return (
    <div className="costshare-map-wrapper">
      <MapContainer
        center={SD_CENTER}
        zoom={SD_ZOOM}
        className="costshare-map"
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {farms.map((farm, i) => (
          <CircleMarker
            key={i}
            center={[farm.lat, farm.lng]}
            radius={getRadius(farm.totalAcres)}
            pathOptions={{
              color: getFundingColor(farm.totalFunding),
              fillColor: getFundingColor(farm.totalFunding),
              fillOpacity: 0.7,
              weight: 1,
            }}
          >
            <Popup>
              <div className="map-popup">
                <div className="map-popup-name">{farm.fullName}</div>
                {farm.farmName && <div className="map-popup-farm">{farm.farmName}</div>}
                <div className="map-popup-details">
                  <div>Funding: <strong>{formatCurrency(farm.totalFunding)}</strong></div>
                  <div>Acres: <strong>{Math.round(farm.totalAcres).toLocaleString()}</strong></div>
                  <div>Contracts: <strong>{farm.contracts.size}</strong></div>
                  {farm.stream && <div>Stream: <strong>{farm.stream}</strong></div>}
                </div>
                {farm.practices.size > 0 && (
                  <div className="map-popup-practices">
                    <strong>Practices:</strong>
                    <ul>
                      {Array.from(farm.practices).map((p) => (
                        <li key={p}>{p}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </Popup>
          </CircleMarker>
        ))}
      </MapContainer>
      <div className="map-legend">
        <span className="map-legend-item"><span className="map-legend-dot" style={{ background: '#1A6B82' }} />&gt;$50k</span>
        <span className="map-legend-item"><span className="map-legend-dot" style={{ background: '#2D8FA8' }} />$20-50k</span>
        <span className="map-legend-item"><span className="map-legend-dot" style={{ background: '#4CA5C2' }} />$10-20k</span>
        <span className="map-legend-item"><span className="map-legend-dot" style={{ background: '#8ECFE0' }} />&lt;$10k</span>
      </div>
    </div>
  )
}
