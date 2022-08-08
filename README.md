# CS:S Content Installer

A CS:S Content Installer coded in JavaScript with Electron allows you to install the CS:S Content for Garry's Mod. The installer handles the installation by automatically finding your Garry's Mod directory. If your Garry's Mod directory isn't found, the installer guides you on how to find the correct folder. The installer then uses Steam CMD to download the content `(you're getting the content from the official source)`. Once the download is complete, the installer unpacks the content, then places the content in your addons folder `(addons/css_content)`. The installer also comes with a user interface that makes it easy to install the content.

![Example](https://github.com/itstomsci/CSS-Content-Installer/blob/master/.github/example.jpg?raw=true)

## 🛠️ Build

```
npm install
npm run (build, build-ia32, build-x64)
```

## 📁 File Structure

```
├── assets
│   ├── example1.jpg
│   ├── example2.jpg
│   ├── example3.jpg
│   ├── example4.jpg
│   ├── icon.ico
│   ├── logo.png
│   └── notification.png
├── functions.js
├── index.css
├── index.html
├── index.js
├── package-lock.json
├── package.json
└── script.js
```

## 📄 Licence

[ISC License](https://github.com/itstomsci/CSS-Content-Installer/blob/master/LICENSE)
