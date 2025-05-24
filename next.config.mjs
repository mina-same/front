/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
        domains: ['cdn.sanity.io', 'images.unsplash.com'], // Add 'cdn.sanity.io' and 'images.unsplash.com' to the list of allowed domains
    },
};
export default nextConfig;
