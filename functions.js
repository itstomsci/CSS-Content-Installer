const {
  setExternalVBSLocation,
  promisified: { list }
} = require('regedit');
const { readFileSync, existsSync, createWriteStream } = require('fs-extra');
const { join } = require('path');
const { parse } = require('vdf');
const { get } = require('superagent');

setExternalVBSLocation('resources/regedit/vbs');

const getSteamDirectoryPath = async () => {
  const entries = await list([
    'HKLM\\SOFTWARE\\Valve\\Steam',
    'HKLM\\SOFTWARE\\WOW6432Node\\Valve\\Steam'
  ]);

  const firstEntry = entries['HKLM\\SOFTWARE\\Valve\\Steam'];

  const secondEntry = entries['HKLM\\SOFTWARE\\WOW6432Node\\Valve\\Steam'];

  if (firstEntry && firstEntry.exists)
    return firstEntry.values.InstallPath.value;
  else if (secondEntry && secondEntry.exists)
    return secondEntry.values.InstallPath.value;
  else return null;
};

const getSteamLibraryDirectoryPaths = steamAppsDirectoryPath => {
  const file = readFileSync(
    join(steamAppsDirectoryPath, 'libraryfolders.vdf'),
    'utf-8'
  );

  const fileParsed = parse(file);

  const directories = [];

  Object.entries(fileParsed.libraryfolders).forEach(entry => {
    if (entry[1])
      if (existsSync(entry[1].path)) directories.push(entry[1].path);
  });

  return directories;
};

const getSteamGameManifestPath = steamAppsDirectoryPath => {
  if (existsSync(join(steamAppsDirectoryPath, 'appmanifest_4000.acf')))
    return join(steamAppsDirectoryPath, 'appmanifest_4000.acf');

  return null;
};

const getSteamGameDirectoryPath = steamGameManifestPath => {
  const file = readFileSync(steamGameManifestPath, 'utf8');

  const fileParsed = parse(file);

  const steamGameDirectoryPath = join(
    steamGameManifestPath,
    '../common',
    fileParsed.AppState.installdir
  );

  if (existsSync(steamGameDirectoryPath)) return steamGameDirectoryPath;

  return null;
};

const getAutomaticSteamGameDirectoryPath = async () => {
  const steamDirectoryPath = await getSteamDirectoryPath();

  if (!steamDirectoryPath)
    return {
      type: 'error',
      value: 'Steam not automatically found, click select.'
    };

  const steamLibraryDirectoryPaths = await getSteamLibraryDirectoryPaths(
    join(steamDirectoryPath, 'steamapps')
  );

  if (!steamLibraryDirectoryPaths)
    return {
      type: 'error',
      value: 'Steam libraries not automatically found, click select.'
    };

  const forEachSteamLibraryDirectoryPaths = () => {
    return new Promise(resolve => {
      steamLibraryDirectoryPaths.forEach(async steamLibraryDirectoryPath => {
        const steamLibraryAppsDirectoryPath = join(
          steamLibraryDirectoryPath,
          'steamapps'
        );

        const steamGameManifestPath = await getSteamGameManifestPath(
          steamLibraryAppsDirectoryPath
        );

        if (!steamGameManifestPath) return;

        const steamGameDirectoryPath = await getSteamGameDirectoryPath(
          steamGameManifestPath
        );

        if (!steamGameDirectoryPath) return;

        resolve({ type: 'success', value: steamGameDirectoryPath });
      });

      setTimeout(() => {
        resolve({
          type: 'error',
          value: "Garry's Mod not automatically found, click select."
        });
      }, 3000);
    });
  };

  return await forEachSteamLibraryDirectoryPaths();
};

const downloadFile = (url, path) => {
  const file = createWriteStream(path);

  get(url).pipe(file);
};

module.exports = {
  getSteamDirectoryPath,
  getSteamLibraryDirectoryPaths,
  getSteamGameManifestPath,
  getSteamGameDirectoryPath,
  getAutomaticSteamGameDirectoryPath,
  downloadFile
};
