import {defineConfig} from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(() => {


    return {
        resolve: {
            alias: [
                {
                    find: '@sdk',
                    replacement: path.resolve(__dirname, '../sdk')
                }
            ]
        },
        plugins: [react()],
        server: {
            proxy: {
                '/api': {
                    target: "http://127.0.0.1:3213",
                    changeOrigin: false,
                    secure: false,
                },
                '/.well-known': {
                    target: "http://127.0.0.1:3213",
                    changeOrigin: false,
                    secure: false,
                }
            },
            port: 49000
        },
    }
})
