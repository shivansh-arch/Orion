export default {
  server: {
    port: 5173,
    proxy: {
      '/auth': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/chat': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
      '/conversations': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
};
