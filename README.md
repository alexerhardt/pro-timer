# ProTimer

A desktop application that measures the times you spends on tasks, and 
uploads them to Google Sheets.

## Screens

![ProTimer Screen One](https://res.cloudinary.com/dxfgtjxiz/image/upload/c_scale,h_288/v1565257105/portfolio/protimer-screenshot.png)

![ProTimer Screen Two](https://res.cloudinary.com/dxfgtjxiz/image/upload/v1565255629/portfolio/protimer-sheets.png)


## Getting Started

### Installing (Development)

`yarn install`

### Running (Development)

`yarn start`

### Bundling for Final Use

After installing for development, run:

`yarn package`

Your platform executables will be added to the `out` folder, you can then simply install them on your computer.

### Setting Up The App

In order to enable sync, you will first need to log in (it's handled securely through Google's API), then you'll need to create a Google Sheet through the Sheets interface (want to learn a nifty new trick? type `sheets.new` in your browser). **You then need to grab the ID of your spreadsheet**. It is the part that comes after the /d/ in the Sheet URL, ex:

`https://docs.google.com/spreadsheets/d/`**1X4e_eg4_-vXQfl1FqZINsdTH1i6SWTHxCFOlAMAt0M**`/edit#gid=0`

You will also need to indicate the *sheet* within that spreadsheet you'd like to save to (ex: Sheet 1)


## Built With

Electron.js

ES6 JavaScript -- no JS UI framework

Spectre.css

Electron Forge

## Author

Alex Erhardt.

Feel free to open an issue if you have any questions about this project.

## License

This software is licensed under the MIT license. Check LICENSE.MD for details.
