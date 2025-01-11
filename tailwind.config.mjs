/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./public/**/*.html", // Added to include any HTML files in the public folder
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: "#0B4F6C", // Example: Dark blue
        secondary: "#DCC6BC", // Example: Cream
        accent: "#FFBB02", // Example: Yellow
        neutral: "#1D1D1D", // Example: Dark gray/black
        success: "#28a745", // Green for success
        danger: "#dc3545", // Red for errors
        warning: "#ffc107", // Yellow for warnings
        info: "#17a2b8", // Light blue for informational messages
      },
    },
  },
  plugins: [],
};
