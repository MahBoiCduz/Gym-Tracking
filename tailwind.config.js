export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        // Discipline & Drive palette (see DESIGN.md)
        'night-gym': '#0f172a',
        'pit-dark': '#1e293b',
        'iron-mid': '#334155',
        'drive': '#2563eb',
        'drive-hover': '#3b82f6',
        'coach': '#059669',
        // Macro roles (nutrition) — mapped onto the brand palette
        'macro-kcal': '#2563eb',
        'macro-protein': '#059669',
        'macro-carb': '#d97706',
        'macro-fat': '#e11d48',
      },
      zIndex: {
        sticky: '20',
        banner: '30',
        'modal-backdrop': '40',
        modal: '50',
        toast: '60',
      },
    },
  },
  plugins: [],
}
