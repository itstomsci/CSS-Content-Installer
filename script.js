const { version } = require('./package.json');
const {
  getAutomaticSteamGameDirectoryPath,
  downloadFile
} = require('./functions.js');
const { existsSync, removeSync, mkdirSync, moveSync } = require('fs-extra');
const { join } = require('path');
const extract = require('extract-zip');
const { exec } = require('child_process');

const elements = document.getElementById('elements');

let directoryPath = { type: 'error', value: 'Loading...' };

const close = () => window.close();

const directoryElement = document.getElementById('directory');

const selectElement = document.getElementById('select');

const selectDirectoryTitle = document.getElementById('selectDirectoryTitle');

const index = async () => {
  document.getElementById('version').textContent = version;

  if (!process.platform.startsWith('win')) {
    elements.style.marginTop = '50px';

    elements.style.textAlign = 'center';

    elements.innerHTML = `<h1>Platform Not Supported</h1>
    <h5 class="mb-4">Your platform is not supported with this application.</h5>
    <div class="d-grid mx-auto">
      <button type="button" class="btn btn-danger" id="platformClose">
        Close
      </button>
    </div>`;

    document.getElementById('platformClose').onclick = close;
  }

  const automaticSteamGameDirectoryPath =
    await getAutomaticSteamGameDirectoryPath();

  directoryPath = automaticSteamGameDirectoryPath;

  if (automaticSteamGameDirectoryPath.type == 'success') {
    directoryElement.value = automaticSteamGameDirectoryPath.value;

    selectElement.textContent = 'Change';

    selectDirectoryTitle.textContent = 'Change Directory';
  } else directoryElement.value = automaticSteamGameDirectoryPath.value;
};

index();

const errorElement = document.getElementById('error');

const selectFile = () => {
  const directoryError = document.getElementById('selectDirectoryError');

  if (directoryError) directoryError.remove();

  const fileInput = document.createElement('input');

  fileInput.type = 'file';

  fileInput.onchange = event => {
    const file = event.target.files[0];

    const directoryBody = document.getElementById('selectDirectoryBody');

    if (
      file.name != 'hl2.exe' ||
      !file.includes('\\steamapps\\common\\GarrysMod\\hl2.exe') ||
      file.type != 'application/x-msdownload'
    )
      return (directoryBody.innerHTML =
        `<div class="alert alert-danger" id="selectDirectoryError">
          You selected an invalid file, please read the guide below.
        </div>` + directoryBody.innerHTML);

    const directory = file.slice(0, -8);

    if (!existsSync(join(directory, 'bin/vpk.exe')))
      return (directoryBody.innerHTML =
        `<div class="alert alert-danger" id="selectDirectoryError">
          You don't have the correct requirements, please try again.
        </div>` + directoryBody.innerHTML);

    directoryPath = { type: 'success', value: directory };

    elements.style.marginTop = null;

    directoryElement.classList.remove('is-invalid');

    errorElement.innerHTML = '';

    directoryElement.value = directory;

    selectElement.textContent = 'Change';

    selectDirectoryTitle.textContent = 'Change Directory';

    if (directoryError) directoryError.remove();

    document.getElementById('selectDirectoryClose').click();
  };

  fileInput.click();
};

document.getElementById('selectFile').onclick = selectFile;

const consoleLog = (data, progress) => {
  const consoleElement = document.getElementById('console');

  consoleElement.textContent = consoleElement.textContent + `${data}\n`;

  consoleElement.scrollTop = consoleElement.scrollHeight;

  document.getElementById('progress').style.width = `${progress}%`;
};

const finished = name => {
  elements.style.marginTop = '13px';

  elements.style.textAlign = 'center';

  let consoleElement = document.getElementById('console');

  consoleElement.style.height = '113px';

  setTimeout(() => {
    consoleElement = document.getElementById('console');

    consoleElement.scrollTop = consoleElement.scrollHeight;
  }, 100);

  document.getElementsByClassName('progress')[0].remove();

  elements.innerHTML = `<h1 class="mb-2">${name}</h1>` + elements.innerHTML;

  elements.innerHTML =
    elements.innerHTML +
    `<div class="d-grid mx-auto">
      <button type="button" class="btn btn-danger" id="finishedClose">
        Close
      </button>
    </div>`;

  document.getElementById('finishedClose').onclick = close;
};

const install = async () => {
  try {
    if (directoryPath.type == 'error') {
      elements.style.marginTop = '25px';

      directoryElement.classList.add('is-invalid');

      return (errorElement.innerHTML = `<div class="alert alert-danger">
        Please select a Garry's Mod Directory for the install.
      </div>`);
    } else {
      elements.style.marginTop = null;

      directoryElement.classList.remove('is-invalid');

      errorElement.innerHTML = '';
    }

    elements.style.marginTop = '14px';

    elements.innerHTML = `<div id="error"></div>
    <div class="d-flex justify-content-center mb-2">
      <textarea id="console" disabled></textarea>
    </div>
    <div class="progress">
      <div class="progress-bar bg-success" id="progress" style="width: 10%;"></div>
    </div>`;

    const url = 'https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip';

    const garrysModAddonsPath = join(directoryPath.value, 'garrysmod/addons');

    const garrysModAddonsTemporaryPath = join(
      garrysModAddonsPath,
      'css_content_temporary'
    );

    if (existsSync(garrysModAddonsTemporaryPath)) {
      removeSync(garrysModAddonsTemporaryPath);

      mkdirSync(garrysModAddonsTemporaryPath);
    } else mkdirSync(garrysModAddonsTemporaryPath);

    consoleLog('🔵 Downloading SteamCMD setup on your computer.', 5);

    await downloadFile(url, join(garrysModAddonsTemporaryPath, 'steamcmd.zip'));

    await consoleLog(
      '🟢 Downloaded SteamCMD setup in the temporary directory on your computer.',
      10
    );

    const timeout = milliseconds => {
      return new Promise(resolve => setTimeout(resolve, milliseconds));
    };

    await timeout(1000);

    consoleLog('🔵 Extracting SteamCMD setup on your computer.', 15);

    await extract(join(garrysModAddonsTemporaryPath, 'steamcmd.zip'), {
      dir: join(garrysModAddonsTemporaryPath, 'steamcmd')
    });

    consoleLog(
      '🟢 Extracted SteamCMD setup in the temporary directory on your computer.',
      20
    );

    consoleLog('🔵 Installing SteamCMD on your computer.', 25);

    exec(
      `"${join(
        garrysModAddonsTemporaryPath,
        'steamcmd/steamcmd.exe'
      )}" +login anonymous +force_install_dir "${join(
        garrysModAddonsTemporaryPath,
        'css_server'
      )}" +app_update 232330 -validate +quit`
    )
      .stdout.on('data', data => {
        if (data.includes('Steam Console Client (c) Valve Corporation')) {
          consoleLog(
            '🟢 Installed SteamCMD in the temporary directory on your computer.',
            30
          );

          consoleLog('🟢 Executed SteamCMD on your computer.', 35);

          consoleLog('🔵 Downloading CS:S Server on your computer.', 40);
        }

        if (data.includes('Download Complete'))
          consoleLog(
            '🟢 Downloaded CS:S Server to the temporary directory on your computer.',
            75
          );
      })
      .on('close', () => {
        consoleLog('🔵 Unpacking CS:S Content on your computer.', 80);

        exec(
          `"${join(directoryPath.value, 'bin/vpk.exe')}" "${join(
            garrysModAddonsTemporaryPath,
            'css_server/cstrike/cstrike_pak_dir.vpk'
          )}"`
        ).on('close', async () => {
          consoleLog(
            '🟢 Unpacked CS:S Content in the temporary directory on your computer.',
            85
          );

          consoleLog('🔵 Moving CS:S Content on your computer.', 90);

          if (existsSync(join(garrysModAddonsPath, 'css_content'))) {
            removeSync(join(garrysModAddonsPath, 'css_content'));

            consoleLog(
              '🟢 Removed the css_content directory on your computer.'
            );
          }

          const moveDirectories = [
            'materials',
            'models',
            'particles',
            'sound',
            'resource',
            'maps'
          ];

          moveDirectories.forEach(directory => {
            moveSync(
              join(
                garrysModAddonsTemporaryPath,
                'css_server/cstrike/cstrike_pak_dir',
                directory
              ),
              join(garrysModAddonsPath, 'css_content', directory)
            );

            consoleLog(`🟢 Moved ${directory} on your computer.`);
          });

          consoleLog(
            '🟢 Moved all CS:S Content to the css_content directory on your computer.',
            95
          );

          await timeout(1000);

          if (existsSync(garrysModAddonsTemporaryPath)) {
            removeSync(garrysModAddonsTemporaryPath);

            consoleLog('🟢 Removed the temporary directory on your computer.');
          }

          consoleLog(
            '🟢 CS:S Content was successfully installed on your computer.',
            100
          );

          finished('Successfully Installed');

          new Notification('CS:S Content Installer', {
            body: 'CS:S Content was successfully installed on your computer.',
            icon: join(__dirname, 'assets/notification.png')
          });
        });
      });
  } catch (error) {
    if (document.getElementById('install')) {
      elements.style.marginTop = '25px';

      errorElement.innerHTML = `<div class="alert alert-danger">
        An error occured, please try restarting the application.
      </div>`;
    } else finished('Error Occured');
  }
};

document.getElementById('install').onclick = install;
