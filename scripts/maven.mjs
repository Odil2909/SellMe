import { existsSync } from 'node:fs';
import { mkdir, rename, rm } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { createWriteStream } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { pipeline } from 'node:stream/promises';

const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const version='3.9.9';
const cacheDir=resolve(root,'node_modules/.cache/maven');
const mavenHome=resolve(cacheDir,`apache-maven-${version}`);
const executable=resolve(mavenHome,'bin/mvn');

async function commandExists(command){return await new Promise(resolveResult=>{const child=spawn(command,['-v'],{stdio:'ignore'});child.once('error',()=>resolveResult(false));child.once('exit',code=>resolveResult(code===0));});}
export async function maven(){
  if(await commandExists('mvn'))return 'mvn';
  if(existsSync(executable))return executable;
  await mkdir(cacheDir,{recursive:true});
  const archive=resolve(cacheDir,`apache-maven-${version}-bin.tar.gz`);const partial=`${archive}.part`;
  const url=`https://archive.apache.org/dist/maven/maven-3/${version}/binaries/apache-maven-${version}-bin.tar.gz`;
  let response;
  try{response=await fetch(url,{signal:AbortSignal.timeout(120000)});}catch(error){throw new Error(`Maven не установлен, а скачать его не удалось (${error.message}). Установите Maven 3.9+ и повторите npm run dev.`);}
  if(!response.ok||!response.body)throw new Error(`Не удалось скачать Maven (${response.status}). Установите Maven 3.9+ и повторите команду.`);
  await pipeline(response.body,createWriteStream(partial));await rename(partial,archive);
  const extracted=await new Promise((resolveResult,reject)=>{const child=spawn('tar',['-xzf',archive,'-C',cacheDir],{stdio:'inherit'});child.once('error',reject);child.once('exit',code=>code===0?resolveResult(true):reject(new Error('Не удалось распаковать Maven.')));});
  if(!extracted)throw new Error('Не удалось подготовить Maven.');await rm(archive,{force:true});return executable;
}
export async function runMaven(args){const bin=await maven();const localRepo=resolve(root,'node_modules/.cache/maven-repository');return await new Promise((resolveResult,reject)=>{const childEnv={...process.env};delete childEnv.DEBUG;const child=spawn(bin,['-q','-Dmaven.repo.local='+localRepo,'-f',resolve(root,'backend/pom.xml'),...args],{cwd:root,stdio:'inherit',env:childEnv});const stop=signal=>child.kill(signal);process.once('SIGINT',stop);process.once('SIGTERM',stop);child.once('error',reject);child.once('exit',code=>{process.off('SIGINT',stop);process.off('SIGTERM',stop);if(code===0)resolveResult();else reject(new Error(`Maven завершился с кодом ${code??1}`));});});}
