// vite.config.mts
/* eslint import/no-unresolved: "off" */
import * as path from 'path';
import inject from 'file:///home/tonyngo/Projects/finance-app/node_modules/@rollup/plugin-inject/dist/es/index.js';
import basicSsl from 'file:///home/tonyngo/Projects/finance-app/node_modules/@vitejs/plugin-basic-ssl/dist/index.mjs';
import react from 'file:///home/tonyngo/Projects/finance-app/node_modules/@vitejs/plugin-react-swc/index.mjs';
import { visualizer } from 'file:///home/tonyngo/Projects/finance-app/node_modules/rollup-plugin-visualizer/dist/plugin/index.js';
import {
  defineConfig,
  loadEnv,
} from 'file:///home/tonyngo/Projects/finance-app/node_modules/vite/dist/node/index.js';
import { VitePWA } from 'file:///home/tonyngo/Projects/finance-app/node_modules/vite-plugin-pwa/dist/index.js';
import viteTsconfigPaths from 'file:///home/tonyngo/Projects/finance-app/node_modules/vite-tsconfig-paths/dist/index.mjs';
var addWatchers = () => ({
  name: 'add-watchers',
  configureServer(server) {
    server.watcher
      .add([
        path.resolve('../loot-core/lib-dist/electron/*.js'),
        path.resolve('../loot-core/lib-dist/browser/*.js'),
      ])
      .on('all', function () {
        for (const wsc of server.ws.clients) {
          wsc.send(JSON.stringify({ type: 'static-changed' }));
        }
      });
  },
});
var injectShims = () => {
  const buildShims = path.resolve('./src/build-shims.js');
  const commonInject = {
    exclude: ['src/setupTests.js'],
    global: [buildShims, 'global'],
  };
  return [
    {
      name: 'inject-build-process',
      config: () => ({
        // rename process.env in build mode so it doesn't get set to an empty object up by the vite:define plugin
        // this isn't needed in serve mode, because vite:define doesn't empty it in serve mode. And defines also happen last anyways in serve mode.
        define: {
          'process.env': `_process.env`,
        },
      }),
      apply: 'build',
    },
    {
      ...inject({
        ...commonInject,
        process: [buildShims, 'process'],
      }),
      enforce: 'post',
      apply: 'serve',
    },
    {
      ...inject({
        ...commonInject,
        _process: [buildShims, 'process'],
      }),
      enforce: 'post',
      apply: 'build',
    },
  ];
};
var vite_config_default = defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const devHeaders = {
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Embedder-Policy': 'require-corp',
  };
  if (process.env.REVIEW_ID) {
    process.env.REACT_APP_REVIEW_ID = process.env.REVIEW_ID;
  }
  let resolveExtensions = [
    '.web.js',
    '.web.jsx',
    '.web.ts',
    '.web.tsx',
    '.mjs',
    '.js',
    '.mts',
    '.ts',
    '.jsx',
    '.tsx',
    '.json',
  ];
  if (env.IS_GENERIC_BROWSER) {
    resolveExtensions = [
      '.browser.js',
      '.browser.jsx',
      '.browser.ts',
      '.browser.tsx',
      ...resolveExtensions,
    ];
  }
  return {
    base: '/',
    envPrefix: 'REACT_APP_',
    build: {
      target: 'es2022',
      sourcemap: true,
      outDir: mode === 'desktop' ? 'build-electron' : 'build',
      assetsDir: 'static',
      manifest: true,
      assetsInlineLimit: 0,
      chunkSizeWarningLimit: 1500,
      rollupOptions: {
        output: {
          assetFileNames: assetInfo => {
            const info = assetInfo.name.split('.');
            let extType = info[info.length - 1];
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType)) {
              extType = 'img';
            } else if (/woff|woff2/.test(extType)) {
              extType = 'media';
            }
            return `static/${extType}/[name].[hash][extname]`;
          },
          chunkFileNames: 'static/js/[name].[hash].chunk.js',
          entryFileNames: 'static/js/[name].[hash].js',
        },
      },
    },
    server: {
      host: true,
      headers: mode === 'development' ? devHeaders : void 0,
      port: +env.PORT || 5173,
      open: env.BROWSER
        ? ['chrome', 'firefox', 'edge', 'browser', 'browserPrivate'].includes(
            env.BROWSER,
          )
        : true,
      watch: {
        disableGlobbing: false,
      },
    },
    resolve: {
      extensions: resolveExtensions,
    },
    plugins: [
      // electron (desktop) builds do not support PWA
      mode === 'desktop'
        ? void 0
        : VitePWA({
            registerType: 'prompt',
            workbox: {
              globPatterns: [
                '**/*.{js,css,html,txt,wasm,sql,sqlite,ico,png,woff2,webmanifest}',
              ],
              ignoreURLParametersMatching: [/^v$/],
              navigateFallback: '/index.html',
              navigateFallbackDenylist: [
                /^\/account\/.*$/,
                /^\/admin\/.*$/,
                /^\/secret\/.*$/,
                /^\/openid\/.*$/,
              ],
            },
          }),
      injectShims(),
      addWatchers(),
      react({
        plugins: [
          [
            '@swc/plugin-react-remove-properties',
            { properties: ['^data-debug'] },
          ],
        ],
        devTarget: 'es2022',
      }),
      viteTsconfigPaths({ root: '../..' }),
      visualizer({ template: 'raw-data' }),
      !!env.HTTPS && basicSsl(),
    ],
    test: {
      include: ['src/**/*.{test,spec}.?(c|m)[jt]s?(x)'],
      environment: 'jsdom',
      globals: true,
      setupFiles: './src/setupTests.js',
    },
  };
});
export { vite_config_default as default };
//# sourceMappingURL=data:application/json;base64,ewogICJ2ZXJzaW9uIjogMywKICAic291cmNlcyI6IFsidml0ZS5jb25maWcubXRzIl0sCiAgInNvdXJjZXNDb250ZW50IjogWyJjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfZGlybmFtZSA9IFwiL2hvbWUvdG9ueW5nby9Qcm9qZWN0cy9maW5hbmNlLWFwcC9wYWNrYWdlcy9kZXNrdG9wLWNsaWVudFwiO2NvbnN0IF9fdml0ZV9pbmplY3RlZF9vcmlnaW5hbF9maWxlbmFtZSA9IFwiL2hvbWUvdG9ueW5nby9Qcm9qZWN0cy9maW5hbmNlLWFwcC9wYWNrYWdlcy9kZXNrdG9wLWNsaWVudC92aXRlLmNvbmZpZy5tdHNcIjtjb25zdCBfX3ZpdGVfaW5qZWN0ZWRfb3JpZ2luYWxfaW1wb3J0X21ldGFfdXJsID0gXCJmaWxlOi8vL2hvbWUvdG9ueW5nby9Qcm9qZWN0cy9maW5hbmNlLWFwcC9wYWNrYWdlcy9kZXNrdG9wLWNsaWVudC92aXRlLmNvbmZpZy5tdHNcIjsvLyBAdHMtc3RyaWN0LWlnbm9yZVxuaW1wb3J0ICogYXMgcGF0aCBmcm9tICdwYXRoJztcblxuaW1wb3J0IGluamVjdCBmcm9tICdAcm9sbHVwL3BsdWdpbi1pbmplY3QnO1xuaW1wb3J0IGJhc2ljU3NsIGZyb20gJ0B2aXRlanMvcGx1Z2luLWJhc2ljLXNzbCc7XG5pbXBvcnQgcmVhY3QgZnJvbSAnQHZpdGVqcy9wbHVnaW4tcmVhY3Qtc3djJztcbmltcG9ydCB7IHZpc3VhbGl6ZXIgfSBmcm9tICdyb2xsdXAtcGx1Z2luLXZpc3VhbGl6ZXInO1xuLy8vIDxyZWZlcmVuY2UgdHlwZXM9XCJ2aXRlc3RcIiAvPlxuaW1wb3J0IHsgZGVmaW5lQ29uZmlnLCBsb2FkRW52LCBQbHVnaW4gfSBmcm9tICd2aXRlJztcbmltcG9ydCB7IFZpdGVQV0EgfSBmcm9tICd2aXRlLXBsdWdpbi1wd2EnO1xuaW1wb3J0IHZpdGVUc2NvbmZpZ1BhdGhzIGZyb20gJ3ZpdGUtdHNjb25maWctcGF0aHMnO1xuXG5jb25zdCBhZGRXYXRjaGVycyA9ICgpOiBQbHVnaW4gPT4gKHtcbiAgbmFtZTogJ2FkZC13YXRjaGVycycsXG4gIGNvbmZpZ3VyZVNlcnZlcihzZXJ2ZXIpIHtcbiAgICBzZXJ2ZXIud2F0Y2hlclxuICAgICAgLmFkZChbXG4gICAgICAgIHBhdGgucmVzb2x2ZSgnLi4vbG9vdC1jb3JlL2xpYi1kaXN0L2VsZWN0cm9uLyouanMnKSxcbiAgICAgICAgcGF0aC5yZXNvbHZlKCcuLi9sb290LWNvcmUvbGliLWRpc3QvYnJvd3Nlci8qLmpzJyksXG4gICAgICBdKVxuICAgICAgLm9uKCdhbGwnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGZvciAoY29uc3Qgd3NjIG9mIHNlcnZlci53cy5jbGllbnRzKSB7XG4gICAgICAgICAgd3NjLnNlbmQoSlNPTi5zdHJpbmdpZnkoeyB0eXBlOiAnc3RhdGljLWNoYW5nZWQnIH0pKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gIH0sXG59KTtcblxuLy8gSW5qZWN0IGJ1aWxkIHNoaW1zIHVzaW5nIHRoZSBpbmplY3QgcGx1Z2luXG5jb25zdCBpbmplY3RTaGltcyA9ICgpOiBQbHVnaW5bXSA9PiB7XG4gIGNvbnN0IGJ1aWxkU2hpbXMgPSBwYXRoLnJlc29sdmUoJy4vc3JjL2J1aWxkLXNoaW1zLmpzJyk7XG4gIGNvbnN0IGNvbW1vbkluamVjdCA9IHtcbiAgICBleGNsdWRlOiBbJ3NyYy9zZXR1cFRlc3RzLmpzJ10sXG4gICAgZ2xvYmFsOiBbYnVpbGRTaGltcywgJ2dsb2JhbCddLFxuICB9O1xuXG4gIHJldHVybiBbXG4gICAge1xuICAgICAgbmFtZTogJ2luamVjdC1idWlsZC1wcm9jZXNzJyxcbiAgICAgIGNvbmZpZzogKCkgPT4gKHtcbiAgICAgICAgLy8gcmVuYW1lIHByb2Nlc3MuZW52IGluIGJ1aWxkIG1vZGUgc28gaXQgZG9lc24ndCBnZXQgc2V0IHRvIGFuIGVtcHR5IG9iamVjdCB1cCBieSB0aGUgdml0ZTpkZWZpbmUgcGx1Z2luXG4gICAgICAgIC8vIHRoaXMgaXNuJ3QgbmVlZGVkIGluIHNlcnZlIG1vZGUsIGJlY2F1c2Ugdml0ZTpkZWZpbmUgZG9lc24ndCBlbXB0eSBpdCBpbiBzZXJ2ZSBtb2RlLiBBbmQgZGVmaW5lcyBhbHNvIGhhcHBlbiBsYXN0IGFueXdheXMgaW4gc2VydmUgbW9kZS5cbiAgICAgICAgZGVmaW5lOiB7XG4gICAgICAgICAgJ3Byb2Nlc3MuZW52JzogYF9wcm9jZXNzLmVudmAsXG4gICAgICAgIH0sXG4gICAgICB9KSxcbiAgICAgIGFwcGx5OiAnYnVpbGQnLFxuICAgIH0sXG4gICAge1xuICAgICAgLi4uaW5qZWN0KHtcbiAgICAgICAgLi4uY29tbW9uSW5qZWN0LFxuICAgICAgICBwcm9jZXNzOiBbYnVpbGRTaGltcywgJ3Byb2Nlc3MnXSxcbiAgICAgIH0pLFxuICAgICAgZW5mb3JjZTogJ3Bvc3QnLFxuICAgICAgYXBwbHk6ICdzZXJ2ZScsXG4gICAgfSxcbiAgICB7XG4gICAgICAuLi5pbmplY3Qoe1xuICAgICAgICAuLi5jb21tb25JbmplY3QsXG4gICAgICAgIF9wcm9jZXNzOiBbYnVpbGRTaGltcywgJ3Byb2Nlc3MnXSxcbiAgICAgIH0pLFxuICAgICAgZW5mb3JjZTogJ3Bvc3QnLFxuICAgICAgYXBwbHk6ICdidWlsZCcsXG4gICAgfSxcbiAgXTtcbn07XG5cbi8vIGh0dHBzOi8vdml0ZWpzLmRldi9jb25maWcvXG5cbmV4cG9ydCBkZWZhdWx0IGRlZmluZUNvbmZpZyhhc3luYyAoeyBtb2RlIH0pID0+IHtcbiAgY29uc3QgZW52ID0gbG9hZEVudihtb2RlLCBwcm9jZXNzLmN3ZCgpLCAnJyk7XG4gIGNvbnN0IGRldkhlYWRlcnMgPSB7XG4gICAgJ0Nyb3NzLU9yaWdpbi1PcGVuZXItUG9saWN5JzogJ3NhbWUtb3JpZ2luJyxcbiAgICAnQ3Jvc3MtT3JpZ2luLUVtYmVkZGVyLVBvbGljeSc6ICdyZXF1aXJlLWNvcnAnLFxuICB9O1xuXG4gIC8vIEZvcndhcmQgTmV0bGlmeSBlbnYgdmFyaWFibGVzXG4gIGlmIChwcm9jZXNzLmVudi5SRVZJRVdfSUQpIHtcbiAgICBwcm9jZXNzLmVudi5SRUFDVF9BUFBfUkVWSUVXX0lEID0gcHJvY2Vzcy5lbnYuUkVWSUVXX0lEO1xuICB9XG5cbiAgbGV0IHJlc29sdmVFeHRlbnNpb25zID0gW1xuICAgICcud2ViLmpzJyxcbiAgICAnLndlYi5qc3gnLFxuICAgICcud2ViLnRzJyxcbiAgICAnLndlYi50c3gnLFxuICAgICcubWpzJyxcbiAgICAnLmpzJyxcbiAgICAnLm10cycsXG4gICAgJy50cycsXG4gICAgJy5qc3gnLFxuICAgICcudHN4JyxcbiAgICAnLmpzb24nLFxuICBdO1xuXG4gIGlmIChlbnYuSVNfR0VORVJJQ19CUk9XU0VSKSB7XG4gICAgcmVzb2x2ZUV4dGVuc2lvbnMgPSBbXG4gICAgICAnLmJyb3dzZXIuanMnLFxuICAgICAgJy5icm93c2VyLmpzeCcsXG4gICAgICAnLmJyb3dzZXIudHMnLFxuICAgICAgJy5icm93c2VyLnRzeCcsXG4gICAgICAuLi5yZXNvbHZlRXh0ZW5zaW9ucyxcbiAgICBdO1xuICB9XG5cbiAgcmV0dXJuIHtcbiAgICBiYXNlOiAnLycsXG4gICAgZW52UHJlZml4OiAnUkVBQ1RfQVBQXycsXG4gICAgYnVpbGQ6IHtcbiAgICAgIHRhcmdldDogJ2VzMjAyMicsXG4gICAgICBzb3VyY2VtYXA6IHRydWUsXG4gICAgICBvdXREaXI6IG1vZGUgPT09ICdkZXNrdG9wJyA/ICdidWlsZC1lbGVjdHJvbicgOiAnYnVpbGQnLFxuICAgICAgYXNzZXRzRGlyOiAnc3RhdGljJyxcbiAgICAgIG1hbmlmZXN0OiB0cnVlLFxuICAgICAgYXNzZXRzSW5saW5lTGltaXQ6IDAsXG4gICAgICBjaHVua1NpemVXYXJuaW5nTGltaXQ6IDE1MDAsXG4gICAgICByb2xsdXBPcHRpb25zOiB7XG4gICAgICAgIG91dHB1dDoge1xuICAgICAgICAgIGFzc2V0RmlsZU5hbWVzOiBhc3NldEluZm8gPT4ge1xuICAgICAgICAgICAgY29uc3QgaW5mbyA9IGFzc2V0SW5mby5uYW1lLnNwbGl0KCcuJyk7XG4gICAgICAgICAgICBsZXQgZXh0VHlwZSA9IGluZm9baW5mby5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgIGlmICgvcG5nfGpwZT9nfHN2Z3xnaWZ8dGlmZnxibXB8aWNvL2kudGVzdChleHRUeXBlKSkge1xuICAgICAgICAgICAgICBleHRUeXBlID0gJ2ltZyc7XG4gICAgICAgICAgICB9IGVsc2UgaWYgKC93b2ZmfHdvZmYyLy50ZXN0KGV4dFR5cGUpKSB7XG4gICAgICAgICAgICAgIGV4dFR5cGUgPSAnbWVkaWEnO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGBzdGF0aWMvJHtleHRUeXBlfS9bbmFtZV0uW2hhc2hdW2V4dG5hbWVdYDtcbiAgICAgICAgICB9LFxuICAgICAgICAgIGNodW5rRmlsZU5hbWVzOiAnc3RhdGljL2pzL1tuYW1lXS5baGFzaF0uY2h1bmsuanMnLFxuICAgICAgICAgIGVudHJ5RmlsZU5hbWVzOiAnc3RhdGljL2pzL1tuYW1lXS5baGFzaF0uanMnLFxuICAgICAgICB9LFxuICAgICAgfSxcbiAgICB9LFxuICAgIHNlcnZlcjoge1xuICAgICAgaG9zdDogdHJ1ZSxcbiAgICAgIGhlYWRlcnM6IG1vZGUgPT09ICdkZXZlbG9wbWVudCcgPyBkZXZIZWFkZXJzIDogdW5kZWZpbmVkLFxuICAgICAgcG9ydDogK2Vudi5QT1JUIHx8IDUxNzMsXG4gICAgICBvcGVuOiBlbnYuQlJPV1NFUlxuICAgICAgICA/IFsnY2hyb21lJywgJ2ZpcmVmb3gnLCAnZWRnZScsICdicm93c2VyJywgJ2Jyb3dzZXJQcml2YXRlJ10uaW5jbHVkZXMoXG4gICAgICAgICAgICBlbnYuQlJPV1NFUixcbiAgICAgICAgICApXG4gICAgICAgIDogdHJ1ZSxcbiAgICAgIHdhdGNoOiB7XG4gICAgICAgIGRpc2FibGVHbG9iYmluZzogZmFsc2UsXG4gICAgICB9LFxuICAgIH0sXG4gICAgcmVzb2x2ZToge1xuICAgICAgZXh0ZW5zaW9uczogcmVzb2x2ZUV4dGVuc2lvbnMsXG4gICAgfSxcbiAgICBwbHVnaW5zOiBbXG4gICAgICAvLyBlbGVjdHJvbiAoZGVza3RvcCkgYnVpbGRzIGRvIG5vdCBzdXBwb3J0IFBXQVxuICAgICAgbW9kZSA9PT0gJ2Rlc2t0b3AnXG4gICAgICAgID8gdW5kZWZpbmVkXG4gICAgICAgIDogVml0ZVBXQSh7XG4gICAgICAgICAgICByZWdpc3RlclR5cGU6ICdwcm9tcHQnLFxuICAgICAgICAgICAgd29ya2JveDoge1xuICAgICAgICAgICAgICBnbG9iUGF0dGVybnM6IFtcbiAgICAgICAgICAgICAgICAnKiovKi57anMsY3NzLGh0bWwsdHh0LHdhc20sc3FsLHNxbGl0ZSxpY28scG5nLHdvZmYyLHdlYm1hbmlmZXN0fScsXG4gICAgICAgICAgICAgIF0sXG4gICAgICAgICAgICAgIGlnbm9yZVVSTFBhcmFtZXRlcnNNYXRjaGluZzogWy9ediQvXSxcbiAgICAgICAgICAgICAgbmF2aWdhdGVGYWxsYmFjazogJy9pbmRleC5odG1sJyxcbiAgICAgICAgICAgICAgbmF2aWdhdGVGYWxsYmFja0RlbnlsaXN0OiBbXG4gICAgICAgICAgICAgICAgL15cXC9hY2NvdW50XFwvLiokLyxcbiAgICAgICAgICAgICAgICAvXlxcL2FkbWluXFwvLiokLyxcbiAgICAgICAgICAgICAgICAvXlxcL3NlY3JldFxcLy4qJC8sXG4gICAgICAgICAgICAgICAgL15cXC9vcGVuaWRcXC8uKiQvLFxuICAgICAgICAgICAgICBdLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICB9KSxcbiAgICAgIGluamVjdFNoaW1zKCksXG4gICAgICBhZGRXYXRjaGVycygpLFxuICAgICAgcmVhY3Qoe1xuICAgICAgICBwbHVnaW5zOiBbXG4gICAgICAgICAgW1xuICAgICAgICAgICAgJ0Bzd2MvcGx1Z2luLXJlYWN0LXJlbW92ZS1wcm9wZXJ0aWVzJyxcbiAgICAgICAgICAgIHsgcHJvcGVydGllczogWydeZGF0YS1kZWJ1ZyddIH0sXG4gICAgICAgICAgXSxcbiAgICAgICAgXSxcbiAgICAgICAgZGV2VGFyZ2V0OiAnZXMyMDIyJyxcbiAgICAgIH0pLFxuICAgICAgdml0ZVRzY29uZmlnUGF0aHMoeyByb290OiAnLi4vLi4nIH0pLFxuICAgICAgdmlzdWFsaXplcih7IHRlbXBsYXRlOiAncmF3LWRhdGEnIH0pLFxuICAgICAgISFlbnYuSFRUUFMgJiYgYmFzaWNTc2woKSxcbiAgICBdLFxuICAgIHRlc3Q6IHtcbiAgICAgIGluY2x1ZGU6IFsnc3JjLyoqLyoue3Rlc3Qsc3BlY30uPyhjfG0pW2p0XXM/KHgpJ10sXG4gICAgICBlbnZpcm9ubWVudDogJ2pzZG9tJyxcbiAgICAgIGdsb2JhbHM6IHRydWUsXG4gICAgICBzZXR1cEZpbGVzOiAnLi9zcmMvc2V0dXBUZXN0cy5qcycsXG4gICAgfSxcbiAgfTtcbn0pO1xuIl0sCiAgIm1hcHBpbmdzIjogIjtBQUNBLFlBQVksVUFBVTtBQUV0QixPQUFPLFlBQVk7QUFDbkIsT0FBTyxjQUFjO0FBQ3JCLE9BQU8sV0FBVztBQUNsQixTQUFTLGtCQUFrQjtBQUUzQixTQUFTLGNBQWMsZUFBdUI7QUFDOUMsU0FBUyxlQUFlO0FBQ3hCLE9BQU8sdUJBQXVCO0FBRTlCLElBQU0sY0FBYyxPQUFlO0FBQUEsRUFDakMsTUFBTTtBQUFBLEVBQ04sZ0JBQWdCLFFBQVE7QUFDdEIsV0FBTyxRQUNKLElBQUk7QUFBQSxNQUNFLGFBQVEscUNBQXFDO0FBQUEsTUFDN0MsYUFBUSxvQ0FBb0M7QUFBQSxJQUNuRCxDQUFDLEVBQ0EsR0FBRyxPQUFPLFdBQVk7QUFDckIsaUJBQVcsT0FBTyxPQUFPLEdBQUcsU0FBUztBQUNuQyxZQUFJLEtBQUssS0FBSyxVQUFVLEVBQUUsTUFBTSxpQkFBaUIsQ0FBQyxDQUFDO0FBQUEsTUFDckQ7QUFBQSxJQUNGLENBQUM7QUFBQSxFQUNMO0FBQ0Y7QUFHQSxJQUFNLGNBQWMsTUFBZ0I7QUFDbEMsUUFBTSxhQUFrQixhQUFRLHNCQUFzQjtBQUN0RCxRQUFNLGVBQWU7QUFBQSxJQUNuQixTQUFTLENBQUMsbUJBQW1CO0FBQUEsSUFDN0IsUUFBUSxD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
