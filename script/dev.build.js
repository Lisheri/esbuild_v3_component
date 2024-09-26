#!/usr/bin/env node
import * as fs from 'fs';
import * as path from 'path';
import watch from 'watch';
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const entryPath = path.resolve(__dirname, '../es');

const pathKey = '@/';
const alias = {
  [pathKey]: `${entryPath}/`
}


const accessAndMkdir = (dir) => {
  try {
    if (!fs.accessSync(dir)) {
      fs.mkdirSync(dir);
    }
  } catch (e) {
    if (e.code === 'ENOENT') {
      fs.mkdirSync(dir);
    }
  }
};

const accessAndWriteFile = (path, file) => {
  fs.writeFileSync(path, file, 'utf8');
}

function transformFile(dir, outputDir) {
  const arr = fs.readdirSync(dir);
  // 从prevPath读取, 写入到currentPath中
  arr.forEach(function (item) {
    const prevPath = path.join(dir, item);
    const currentPath = path.join(outputDir, item);
    
    const stats = fs.statSync(prevPath);
    if (stats.isDirectory()) {
      accessAndMkdir(currentPath);
      transformFile(prevPath, currentPath);
    } else {
      let res = fs.readFileSync(prevPath, 'utf8');
      res = res.replace(/@\/(\S*)/g, (_match, p1) => {
        // 处理@/路径映射
        return alias[pathKey] + p1;
      });
      if (!prevPath.includes('d.ts')) {
        // 处理__DEV__
        res = res.replace(/__DEV__/g, 'true');
      }
      // 处理对应文件
      accessAndWriteFile(currentPath, res);
    }
  });
}

const entry = path.resolve(__dirname, '../src');

watch.watchTree(entry, function () {
  console.time('start transform path');
  accessAndMkdir(entryPath);
  transformFile(entry, entryPath);
  console.timeEnd('start transform path');
});
