import L from 'leaflet';
import { icon } from './icons';

export interface MapListing {
  id?: string;
  category?: string;
  title?: string;
  city?: string;
  district?: string;
  deal?: string;
  price?: number | string;
  area?: number | string;
  rooms?: number | string;
  floor?: number | string;
  floors?: number | string;
  condition?: string;
  description?: string;
  status?: string;
  lat?: number | string;
  lng?: number | string;
}

const cityCenters: Record<string, L.LatLngTuple> = {
  'Ташкент': [41.3111, 69.2797],
  'Самарканд': [39.6542, 66.9597],
  'Бухара': [39.7747, 64.4286],
  'Андижан': [40.7821, 72.3442],
  'Наманган': [40.9983, 71.6726],
  'Фергана': [40.3864, 71.7864],
  'Нукус': [42.4619, 59.6166],
  'Другой город': [41.3111, 69.2797]
};

const mapIconNames: Record<string, string> = {
  'Квартира': 'building',
  'Дом': 'home',
  'Земля': 'area',
  'Гараж': 'home',
  'Коммерция': 'office',
  'Офис': 'office',
  'Склад': 'building'
};

function markerIcon(category: string, approximate = false) {
  const iconName = mapIconNames[category] || 'building';
  return L.divIcon({
    className: 'property-map-icon',
    html: `<span class="property-map-marker property-map-marker-${iconName}${approximate ? ' property-map-marker-approximate' : ''}">${icon(iconName, 19)}</span>`,
    iconSize: [38, 44],
    iconAnchor: [19, 40],
    popupAnchor: [0, -37]
  });
}

function createMap(element: HTMLElement, center: L.LatLngTuple, zoom: number) {
  const map = L.map(element, { scrollWheelZoom: false }).setView(center, zoom);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  return map;
}

export function mountPropertyMap(element: HTMLElement, listings: MapListing[]) {
  const hasCoordinates = (item: MapListing) =>
    Number.isFinite(Number(item.lat)) &&
    Number.isFinite(Number(item.lng)) &&
    item.lat !== '' &&
    item.lng !== '';
  const approximateCounts = new Map<string, number>();
  listings.forEach(item => {
    const city = item.city || '';
    if (!hasCoordinates(item) && cityCenters[city]) {
      approximateCounts.set(city, (approximateCounts.get(city) || 0) + 1);
    }
  });
  const approximateIndexes = new Map<string, number>();
  const positionedListings = listings.flatMap(item => {
    if (hasCoordinates(item)) {
      return [{ item, position: [Number(item.lat), Number(item.lng)] as L.LatLngTuple, approximate: false }];
    }
    const city = item.city || '';
    const center = cityCenters[city];
    if (!center) return [];
    const index = approximateIndexes.get(city) || 0;
    approximateIndexes.set(city, index + 1);
    const columns = Math.ceil(Math.sqrt(approximateCounts.get(city) || 1));
    const rows = Math.ceil((approximateCounts.get(city) || 1) / columns);
    const column = index % columns;
    const row = Math.floor(index / columns);
    const position: L.LatLngTuple = [
      center[0] + (row - (rows - 1) / 2) * 0.0025,
      center[1] + (column - (columns - 1) / 2) * 0.003
    ];
    return [{ item, position, approximate: true }];
  });
  const map = createMap(element, cityCenters['Ташкент'], 12);
  const bounds: L.LatLngTuple[] = [];
  let approximateCount = 0;

  positionedListings.forEach(({ item, position, approximate }) => {
    bounds.push(position);
    if (approximate) approximateCount += 1;
    const marker = L.marker(position, { icon: markerIcon(item.category || '', approximate) }).addTo(map);
    const popup = document.createElement('div');
    const title = document.createElement('strong');
    title.textContent = item.title || 'Объявление Makon';
    const address = document.createElement('p');
    address.textContent = [item.city, item.district].filter(Boolean).join(', ');
    popup.append(title, address);
    if (approximate) {
      const locationNote = document.createElement('p');
      locationNote.className = 'approximate-map-location';
      locationNote.textContent = 'Примерное расположение в центре города; это не точный адрес.';
      popup.append(locationNote);
    }
    if (item.price) {
      const price = document.createElement('span');
      price.textContent = `${item.price} $${item.deal === 'Аренда' ? ' / мес.' : ''}`;
      popup.append(price, document.createElement('br'));
    }
    if (item.id && !item.id.startsWith('local-')) {
      const link = document.createElement('a');
      link.href = `./property.html?id=${encodeURIComponent(item.id)}`;
      link.textContent = 'Открыть объявление';
      popup.append(link);
    }
    marker.bindPopup(popup);
  });

  if (bounds.length > 1) map.fitBounds(bounds, { padding: [30, 30], maxZoom: 14 });
  else if (bounds.length === 1) map.setView(bounds[0], 14);
  requestAnimationFrame(() => map.invalidateSize());
  return { map, markerCount: positionedListings.length, approximateCount };
}

export function mountLocationPicker(
  element: HTMLElement,
  form: HTMLFormElement,
  initialCity: string,
  initialLat = '',
  initialLng = '',
  category = 'Дом'
) {
  const latField = form.elements.namedItem('lat') as HTMLInputElement;
  const lngField = form.elements.namedItem('lng') as HTMLInputElement;
  const map = createMap(
    element,
    initialLat && initialLng
      ? [Number(initialLat), Number(initialLng)]
      : cityCenters[initialCity] || cityCenters['Ташкент'],
    initialLat && initialLng ? 16 : 12
  );
  let marker: L.Marker | undefined;

  const selectLocation = (position: L.LatLng) => {
    latField.value = position.lat.toFixed(6);
    lngField.value = position.lng.toFixed(6);
    if (marker) marker.setLatLng(position);
    else marker = L.marker(position, { icon: markerIcon(category) }).addTo(map);
    form.dispatchEvent(new Event('input', { bubbles: true }));
  };

  if (initialLat && initialLng) {
    marker = L.marker([Number(initialLat), Number(initialLng)], { icon: markerIcon(category) }).addTo(map);
  }
  map.on('click', event => selectLocation(event.latlng));
  requestAnimationFrame(() => map.invalidateSize());
  return {
    map,
    setCity(city: string) {
      if (!latField.value && !lngField.value) {
        map.setView(cityCenters[city] || cityCenters['Ташкент'], 12);
      }
    }
  };
}
