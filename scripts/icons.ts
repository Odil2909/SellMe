const paths: Record<string, string> = {
  search: '<circle cx="11" cy="11" r="7"></circle><path d="m20 20-4-4"></path>',
  heart: '<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"></path>',
  compare: '<path d="M8 4H4v4"></path><path d="M4 8c1.2-2.3 3.2-3.5 6-3.5"></path><path d="M16 20h4v-4"></path><path d="M20 16c-1.2 2.3-3.2 3.5-6 3.5"></path><path d="M5 12h14"></path>',
  pin: '<path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z"></path><circle cx="12" cy="10" r="2.5"></circle>',
  bed: '<path d="M3 7v13"></path><path d="M21 7v13"></path><path d="M3 15h18"></path><path d="M5 10h6a2 2 0 0 1 2 2v3H5z"></path><path d="M13 12a2 2 0 0 1 2-2h3v5h-5z"></path>',
  area: '<rect x="4" y="4" width="16" height="16" rx="2"></rect><path d="M9 4v4H4M20 15h-4v5"></path>',
  arrow: '<path d="M5 12h14"></path><path d="m13 6 6 6-6 6"></path>',
  menu: '<path d="M4 7h16M4 12h16M4 17h16"></path>',
  close: '<path d="m6 6 12 12M18 6 6 18"></path>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.4 19.4 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7l.4 2.8a2 2 0 0 1-.6 1.7L7.1 10a16 16 0 0 0 6 6l1.8-1.8a2 2 0 0 1 1.7-.6l2.8.4a2 2 0 0 1 1.6 1.9Z"></path>',
  home: '<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-6v-7h-4v7H4a1 1 0 0 1-1-1z"></path>',
  sparkle: '<path d="m12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3Z"></path><path d="m19 14 .9 2.1L22 17l-2.1.9L19 20l-.9-2.1L16 17l2.1-.9L19 14Z"></path>',
  check: '<path d="m5 12 4 4L19 6"></path>',
  clock: '<circle cx="12" cy="12" r="9"></circle><path d="M12 7v5l3 2"></path>',
  office: '<rect x="4" y="3" width="16" height="18" rx="2"></rect><path d="M9 7h1m4 0h1M9 11h1m4 0h1M9 15h1m4 0h1M10 21v-3h4v3"></path>',
  chart: '<path d="M4 19V5M4 19h17"></path><path d="m7 15 4-4 3 2 6-7"></path>',
  shield: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"></path><path d="m9 12 2 2 4-4"></path>',
  user: '<path d="M20 21a8 8 0 0 0-16 0"></path><circle cx="12" cy="8" r="4"></circle>',
  filter: '<path d="M4 7h16M7 12h10m-7 5h4"></path>',
  plus: '<path d="M12 5v14M5 12h14"></path>',
  camera: '<path d="M14 5H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2-2Z"></path><circle cx="12" cy="13" r="3"></circle>',
  sparkles: '<path d="m12 3 1.5 5.5L19 10l-5.5 1.5L12 17l-1.5-5.5L5 10l5.5-1.5L12 3Z"></path><path d="m19 15 .8 2.2L22 18l-2.2.8L19 21l-.8-2.2L15 18l2.2-.8L19 15Z"></path>',
  message: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8A8.5 8.5 0 0 1 8.7 4a8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.4Z"></path>',
  building: '<rect x="3" y="4" width="18" height="17" rx="2"></rect><path d="M8 8h2m4 0h2M8 12h2m4 0h2M8 16h2m4 0h2M11 21v-3h3v3"></path>',
  star: '<path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-3-5.6 3 1.1-6.2L3 9.6l6.2-.9L12 3Z"></path>',
  back: '<path d="m15 18-6-6 6-6"></path>',
  trash: '<path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6"></path>',
  trend: '<path d="m3 17 6-6 4 4 8-9"></path><path d="M15 6h6v6"></path>',
  wand: '<path d="m15 4 5 5M4 20l11-11M5 5l1 2 2 1-2 1-1 2-1-2-2-1 2-1 1-2Zm12 10 1.4 2.6L21 19l-2.6 1.4L17 23l-1.4-2.6L13 19l2.6-1.4L17 15Z"></path>'
};

export function icon(name: string, size = 20, cls = '') {
  return `<svg class="icon ${cls}" width="${size}" height="${size}" viewBox="0 0 24 24" aria-hidden="true">${paths[name] || paths.home}</svg>`;
}
