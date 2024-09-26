import { build } from 'esbuild';
import { fileURLToPath } from 'url';
import Vue from 'unplugin-vue/esbuild';
// import VueJsx from 'unplugin-vue-jsx/esbuild';
import { sassPlugin } from 'esbuild-sass-plugin';
import progress from 'esbuild-plugin-progress';
// import vueMacros from 'unplugin-vue-macros/esbuild';
import alias from 'esbuild-plugin-alias';
import path from 'path';
import fs from 'fs';
import { clean } from './script/clean.js';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// 判断当前环境
const libraryName = 'index.js';

// 处理vue文件中的注释, style中的注释会导致 VueMacros 构建失败
const filterCommentsPlugin = () => ({
  name: 'filter-comments',
  setup(build) {
    build.onLoad({ filter: /.vue$/ }, async (args) => {
      let source = await fs.promises.readFile(args.path, 'utf8');
      if (/\.vue$/.test(args.path)) {
        // 使用正则表达式移除所有注释
        source = source.replace(/<!--[\s\S]*?-->|\/\*[\s\S]*?\*\/|\/\/.*/g, '');
      }
      return {
        contents: source,
        loader: 'text'
      };
    });
  }
});

const buildTimePlugin = (startTime) => {
  console.log('Build started...');
  return {
    name: 'build-time',
    setup(build) {
      build.onEnd(() => {
        const outputDir = 'es'; // 根据需要调整输出目录
        const oldPath = path.resolve(outputDir, 'index.css');
        const newPath = path.join(outputDir, 'style.css');
        if (fs.existsSync(oldPath)) {
          fs.renameSync(oldPath, newPath);
        }
        if (fs.existsSync(path.resolve(outputDir, 'index.js'))) {
          const newContent = fs.readFileSync(
            path.resolve(outputDir, 'index.js'),
            'utf-8'
          );
          fs.writeFileSync(
            path.resolve(outputDir, 'index.js'),
            newContent.replace(/__DEV__/g, 'true'),
            'utf-8'
          );
        }
        const endTime = Date.now();
        console.log(
          `Build completed in ${(endTime - startTime) / 1000} seconds.`
        );
      });
    }
  };
};

const getReflectPath = () => path.resolve(__dirname, './src');
// 打包组件库
async function buildLibrary() {
  // 全量打包
  await build({
    entryPoints: ['./src/*.ts'],
    outdir: 'es',
    bundle: true,
    format: 'esm',
    tsconfig: 'tsconfig.json',
    // treeShaking: true,
    // minify: true,
    external: ['vue'],
    loader: {
      '.eot': 'file',
      '.svg': 'file',
      '.ttf': 'file',
      '.woff': 'file',
      '.png': 'file',
      '.jpg': 'file',
      '.jpeg': 'file',
      '.gif': 'file'
    },
    jsxFactory: 'h',
    jsxFragment: 'Fragment',
    plugins: [
      filterCommentsPlugin(),
      alias({
        '@': getReflectPath()
      }),
      vueMacros({
        plugins: {
          vue: Vue({
            style: {
              trim: true
            }
          }),
          vueJsx: VueJsx({}) // 如果需要
        }
      }),
      sassPlugin({
        sourceMap: true, // 如果需要 source map
        precompile: (source, _pathName, isRoot) => {
          const additionalData = `@import "${getReflectPath()}/styles/_px2rem.scss";\n`;
          return isRoot ? `${additionalData}${source}` : source;
        },
        sassOptions: {
          outputStyle: 'compressed', // 'compressed' 会移除注释
          sourceMap: true
        }
      }),
      progress(),
      buildTimePlugin(new Date().valueOf())
    ]
  });
}

// 启动函数
const start = async () => {
  await clean();
  buildLibrary();
};

start();
