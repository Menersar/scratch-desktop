# SIDEKICK-Assistenzsystem

## Anleitung zur Einrichtung und Bedienung

Im Folgenden wird beschrieben, wie das SIDEKICK-Autorensystem aufgesetzt – siehe Kapitel 1 – und bedient wird – siehe Kapitel 2.

### Inhalt

1. Einrichtung
   1. Installation auf dem Raspberry Pi (RPi)
   2. Installation auf einem Windows-PC
   3. Nutzung auf einem Windows-PC (ohne Installation)
2. Bedienung
   1. Kurze Einführung in die Benutzeroberfläche
   2. SIDEKICK-Blöcke
      1. GPIO-Pin-Blöcke
      2. Ablauf-Blöcke
      3. LED-Blöcke
      4. UV-Sensor-Blöcke
      5. Button-Blöcke
      6. Video-Blöcke
   3. [Laden externer Erweiterungen](https://github.com/Menersar/sidekick-desktop/blob/sidekick/README.md#laden-externer-erweiterungen)
   4. SIDEKICK-Einstellungsmenü
   5. Bluetooth-Einstellung für die Audioausgabe

---

### 1. Einrichtung
Kompilierte Versionen (Builds) des SIDEKICK-Autorensystems werden als Veröf-fentlichung (Release) auf dem GitHub-Repository der SIDEKICK-Desktop-Version zur Verfügung gestellt und können somit im Bereich Releases des Repositories bezogen werden.

#### 1.1. Installation auf dem Raspberry Pi (RPi)
Über die folgenden Schritte ist die Installation der SIDEKICK-Anwendung auf dem PRi durchführbar.
Hierbei wird die Installationsdatei – für den Fall, dass der RPi nicht mit dem Inter-net verbunden ist – zunächst separat heruntergeladen und danach – hier per USB-Stick – auf den RPi übertragen.

1.	Die Seite https://github.com/Menersar/sidekick-desktop/releases aufrufen.
2.	Die .deb-Datei – umrahmt in folgender Abbildung – herunterladen
(z. B. durch einen Linksklick auf den Dateinamen).
      - Info: Über .deb-Pakete sind Programme manuell installierbar <br>
        (unter allen Debian-basierten Linux-Betriebssystemen).
3.	Diese heruntergeladene Datei auf einen USB-Stick übertragen.
4.	Diesen USB-Stick in einen freien USB-Anschluss des RPi stecken.
5.	Die heruntergeladene Datei des USB-Sticks auf den RPi übertragen
(z. B. vom Ordner des Sticks auf den Desktop per Drag-and-Drop kopieren).
6.	Die SIDEKICK-Anwendung über diese .deb-Datei auf dem RPi installieren.
      - Z. B. wie folgt: Rechtsklick auf die Datei  Package Install.
      - Die Installation erfolgt automatisch über den Installationsprozess.
7.	Nach abgeschlossener Installation ist die Anwendung „SIDEKICK“ startbar.
   - Ausführbar z. B. über das RPi-Anwendungsmenü  Entwicklung.

---

#### 1.2. Installation auf einem Windows-PC
Über die folgenden Schritte ist die Installation der SIDEKICK-Anwendung auf ei-nem Windows-PC durchführbar.
1.	Die Seite https://github.com/Menersar/sidekick-desktop/releases aufrufen.
2.	Die Setup-.exe-Datei – umrahmt in folgender Abbildung – herunterladen
(z. B. durch einen Linksklick auf den Dateinamen).
 
3.	Diese heruntergeladene Datei Ausführen und dadurch Installieren
(z. B. durch Doppelklick auf die .exe-Datei).
 
4.	Durch das Setup-Programm gehen und Installation über Install starten.
      - Ggf. den Installationsort manuell, wie in der Abbildung, festlegen. <br>
        ([Benutzer] hierbei durch den eigenen Benutzernamen ersetzen).
      - Darauf wird der Installationsprozess automatisch durchgeführt.
5.	Nach abgeschlossener Installation ist die Anwendung „SIDEKICK“ startbar.
      - Ausführbar z. B. über die angelegte Desktopverknüpfung
        (z. B. durch Doppelklick auf die Verknüpfung)
      - Oder Suche und Ausführen von „SIDEKICK“ per Windows-Suchleiste.

---

#### 1.3. Nutzung auf einem Windows-PC (ohne Installation)
Über die folgenden Schritte ist die Nutzung der SIDEKICK-Anwendung auf einem Windows-PC ohne Installation möglich.
1.	Die Seite https://github.com/Menersar/sidekick-desktop/releases aufrufen.
2.	Die Portable-.exe-Datei – umrahmt in folgender Abbildung – herunterla-den
(z. B. durch einen Linksklick auf den Dateinamen).
 
3.	Diese heruntergeladene Datei Ausführen
(z. B. durch Doppelklick auf die .exe-Datei).
 
4.	Durch das Ausführen dieser Datei ist die Anwendung „SIDEKICK“ startbar.

---

### 2. Bedienung

Das Starten der SIDEKICK-Anwendung auf dem jeweiligen Betriebsystem / Enge-rät / über die jeweilige Anwendungsdatei startet die folgende Bedienoberfläche.
 
- Prinzipiell ist der Programmaufbau der Windows- und RPi-Version der gleiche.
- Ebenfalls sind alle Blöcke, die spezifisch für das SIDEKICK-Assistenzsystem entwickelt sind, die gleichen.
   - Lediglich werden die Funktionen der neuen SIDEKICK-Programmier-Blöcke, die auf die Hardware des RPi zugreifen (z. B. die GPIO-Blöcke) in der Windows-Version nicht ausgeführt.
      - Diese Blöcke sind jedoch mit in der Block-Liste aufgeführt und kön-nen somit in die SIDEKICK-Block-Programmierung eingebaut werden.
      - Auf der Windows-Version erstellte Projekte können auf den Raspberry Pi – per USB-Stick – übertragen und über die SIDE-KICK-Anwendung geladen werden.
         - Enthält dieses Projekt GPIO-Blöcke, ist ihre Funktion beim Ausführen auf dem Raspberry Pi gegeben.

---

#### 2.1. Kurze Einführung in die Benutzeroberfläche
- Die Oberfläche beim Starten von SIDEKICK ist die Code-Ansicht.
   
   - In dieser Ansicht ist die Programmierung über die Blöcke möglich.
   - Links ist die Block-Palette dieser Ansicht.
      - Hier liegen alle verfügbaren Blöcke zur Programmierung.
         - Sie sind aufgeteilt in Block-Kategorien.
      - Blöcke können im Code-Bereich (Mitte) platziert werden <br>
      (per Drag-and-Drop).
      - Blöcke sind, abhängig von der Blockform, verbindbar.
         - Indem einer an einem kompatiblen losgelassen wird.
         - Durch Wegziehen des oberen sind diese trennbar.
      - Ausführen eines Blocks, führt alle darunter verbundenen aus
         - Sie werden der sichtbaren Reihe nach abgearbeitet <br>
           (von oben nach unten – <br>
           ähnlich zur codebasierten Programmierung).
- In der Block-Palette ist die neue SIDEKICK-Block-Kategorie aufgeführt <br>
  (im Vergleich zur Scratch-Oberfläche).
   - Um zu den Blöcken dieser Kategorie zu gelangen:
      - Durch alle Blöcke nach unten durchscrollen <br>
        oder
      - auf die SIDEKICK-Block-Kategorie klicken <br>
        (so wird automatisch zu den Blöcken der Kategorie gescrollt).

---

#### Laden externer Erweiterungen
Laden externer, benutzerdefinierter Erweiterungen über eine JavaScript-Datei:
1. Erweiterungsbibliothek aufrufen.
   - Über die Schaltfläche unten links. <br>
     ![image](https://github.com/Menersar/sidekick-desktop/assets/48289383/f760b472-28d5-4428-bc3e-1b7af9d3a84e)
2. Erweiterungs-Manager zum Laden externer, benutzerdefinierter Erweiterungen öffnen.
   - Über die Schaltfläche „Benutzerdefinierte Erweiterung“ wird das Dialogfenster des Managers geöffnet. <br>
     ![image](https://github.com/Menersar/sidekick-desktop/assets/48289383/5af600e8-ef37-4782-adaa-ce4efb0cf641)
      - Tipp 1: Über die Suchfunktion oder die Kategorie „Sidekick“ der Erweiterungsbibliothek kann diese Erweiterung einfacher gefunden werden.
      - Tipp 2: Über den Stern auf der Schaltfläche der Erweiterung wird diese zu Favoriten hinzugefügt.
         - Dadurch wird, nach erneutem Öffnen der Erweiterungsbiblitothek, dort ganz oben aufgeführt. <br>
           ![image](https://github.com/Menersar/sidekick-desktop/assets/48289383/351cefab-4e0d-48f3-93d9-048fc2d074b6)
3. In den Bereich des Erweiterungs-Managers zum manuellen Laden von Erweiterungen über JavaScript-Dateien navigieren.
   - Über den Reiter „Datei“.
4. Die JavaScript-Erweiterung-Datei laden. <br>
   ![image](https://github.com/Menersar/sidekick-desktop/assets/48289383/8a71db7a-2885-4770-b210-7deabba60964)
   - Von der Festplatte auswählen
      - indem auf das gestrichelte Feld geklickt wird <br>
        oder
      - per „Drag and Drop“ hineinziehen und zum Laden über dem gestrichelten Feld loslassen.
6. Wichtig: Häkchen beim Feld „Erweiterung ohne Sandbox ausführen“ setzen!
7. Die Erweiterung der ausgewählten JavaScript-Erweiterung-Datei in die Anwendung laden.
   - Über die Schaltfläche „Laden“.
   - Es wird in der Code-Ansicht der Block-Palette eine neue Kategorie für die geladene Erweiterung hinzugefügt <br>
     (wenn die programmierung der Erweiterung keine Fehler ausgibt / wirft). <br>
     ![image](https://github.com/Menersar/sidekick-desktop/assets/48289383/44b147c9-b2e1-4bb9-8305-98f322541fbf)
      - Um zu den Blöcken der geladenen Erweiterung zu gelangen:
         - Durch alle Blöcke nach unten scrollen <br>
           oder
         - auf die neu hinzugefügte Block-Kategorie gehen <br>
           (dadurch wird automatisch zu den Blöcken der Kategorie gescrollt).

---

#### SIDEKICK-Blöcke
Die SIDEKICK-Blöcke in folgende 6 sinnhafte Abschnitte unterteilt.

##### 2.2.1. GPIO-Pin-Blöcke
	Ermöglichen die Ansteuerung der GPIO-Pins direkt über die Software.
 
	Info: Diese Blöcke sind über Scratch ebenfalls verfügbar
(über die interne Scratch-Bibliothek).
	Jedoch nur auf der RPi-Version von Scratch.
1.	Hat-Block:
Wenn GPIO-Pin [GPIO-PIN-NUMMER] den Zustand [SIGNAL] hat
	Sobald am festgelegten GPIO-Pin das angegebene Signal anliegt, wird ein Block, unterhalb dieses Blocks, ausgeführt.
2.	Wahrheits-Block:
Ist am GPIO-Pin [GPIO-PIN-NUMMER] der Zustand [SIGNAL]?
	Gibt, bei Aktivierung einen Wahrheits-Wert darüber zurück, ob der Zu-stand am angegebenen GPIO-Pin dem festgelegten Zustand ent-spricht.
3.	Stapel-Block:
Setzte von GPIO-Pin [GPIO-PIN-NUMMER] den Output zu [SIGNAL]?
	Setzt bei Aktivierung den festgelegten GPIO-Pin auf das ausgewählte Sig-nal und als Output.
4.	Stapel-Block:
Setze von GPIO-Pin [GPIO-PIN-NUMMER] den Input zu [SIGNAL]?
	Setzt bei Aktivierung den festgelegten GPIO-Pin auf das ausgewählte Sig-nal und als Input.
 
##### 2.2.2. Ablauf-Blöcke
	Möglichkeiten zum Speichern und Abrufen des aktuellen Assistenz-schritts
(eine Nummer des aktuell vorliegenden Assistenzschritt zuweisen).
	Für eine einfachere und besser lesbare Programmierung.
	Der Warte-Block: Zur besseren Steuerbarkeit der Assistenzschrit-te.
	Folgende SIDEKICK-Blöcke umfasst der Ablauf-Blöcke-Abschnitt. 
1.	Stapel-Block:
Setze Assistenzschritt auf [ASSISTENZSCHRITT-NUMMER]
	Legt den Wert des aktuellen Assistenzschritts über die angegebene Zahl bei Aktivierung fest.
2.	Kopf-Block:
Wenn Assistenzschritt = [ASSISTENZSCHRITT-NUMMER]
	Wird aktiviert, sobald der Wert des Assistenzschritts dem angegebenen Wert entspricht.
3.	Stapel-Block:
Warte [ZEITWERT-IN-SEKUNDEN] Sekunden
	Bei Aktivierung wird nach den Sekunden des festgelegten Werts der nächstfolgende Block ausgeführt.
 
##### 2.2.3. LED-Blöcke
	Ermöglichen die Ansteuerung der LED-Streifen auf unterschiedliche Weise.
	Folgende SIDEKICK-Blöcke umfasst der LED-Blöcke-Abschnitt. 
1.	Stapel-Block:
Setze LED-Streifen [LED-STREIFEN-NUMMER] auf Farbe [FARBWERT] (Länge: [LED-PUNKTE-ANZAHL])
	Bei Aktivierung wird die ausgewählte Anzahl an LED-Punkten des je-weils festgelegten LED-Streifens auf die mitgegebene Farbe gesetzt.
2.	Stapel-Block:
Setze alle LED-Streifen (Anzahl: [LED-STREIFEN-ANZAHL]) auf Farbe [Farbe]
	Bei Aktivierung wird die ausgewählte Anzahl an LED-Streifen auf die mit-gegebene Farbe gesetzt.
 
##### 2.2.4. UV-Sensor-Blöcke
Die Funktionalität dieses Blocks wurde noch nicht problemlos umgesetzt!
Dennoch wird im Folgenden, der Vollständigkeit halber, die geplante Funktions-weise dargestellt.
Da der Block somit nicht getestet werden konnte, sind ebenfalls zwei unter-schiedliche, mögliche Implementierungen aufgeführt.

	Ermöglicht das Auslesen und Feedback auf Sensordaten der UV-Sensoren.
	Den folgenden SIDEKICK-Block umfasst der UV-Sensor-Blöcke-Abschnitt.
 
1.	Stapel- oder Kopf-Block:
Wenn die Entfernung zu UV-Sensor [UV-SENSOR-NUMMER] kleiner als [UV-SENSOR-ABSTAND-IN-CENTIMETER] cm ist
	Bei Aktivierung wird der nächste Block ausgeführt, sobald eine Entfer-nung zum angegebenen UV-Senor kleiner als der mitgegebene Wert ist.
	Oder: Wird aktiviert, sobald eine Entfernung zum angegebenen UV-Senor kleiner als der mitgegebene Wert ist.
 
##### 2.2.5. Button-Blöcke
Abbildung 4.20 zeigt den umgesetzten SIDEKICK-Block der Button-Blöcke-Kategorie.
	Ermöglicht die Abfrage der Taster des SIDEKICK-Assistenzsystems.
	Den folgenden SIDEKICK-Block umfasst der Button-Blöcke-Abschnitt.
 
1.	Kopf-Block:
Wenn Button [NUMMER] [BUTTON-ZUSTAND] wurde
	Wird aktiviert, sobald der ausgewählte Taster den ausgewählten Zu-stand annimmt („gedrückt“ oder „losgelassen“).
 
##### 2.2.6. Video-Blöcke
	Ermöglichen das Laden und Steuern von Videomaterial.
	Folgende SIDEKICK-Blöcke umfasst die Video-Blöcke-Abschnitt.
 
1.	Stapel-Block:
Importiere Video „[VIDEO-NAME].[VIDEO-DATEIENDUNG]“
	Bei Aktivierung wird ein Video über den angegebenen Namen und der festgelegten Dateiendung in das SIDEKICK-Projekt geladen.
2.	Stapel-Block
Starte Video [VIDEO-NAME] auf [SIDEKICK-GUI-OBJEKT]
	Bei Aktivierung wird ein geladenes Video über den angegebenen Na-men von vorne gestartet und dabei auf dem ausgewählten Objekt dar-gestellt.
3.	Stapel-Block:
Pausiere Video [VIDEO-NAME]
	Bei Aktivierung wird ein geladenes Video über den angegebenen Na-men pausiert.
4.	Stapel-Block:
Setze Video [VIDEO-NAME] fort
	Bei Aktivierung wird ein geladenes und pausiertes Video über den an-ge-gebenen Namen fortgeführt.
5.	Stapel-Block:
Schließe Video [VIDEO-NAME]
	Bei Aktivierung wird ein geladenes Video über den angegebenen Na-men gestoppt und vom Objekt, auf dem das entsprechende Video dar-gestellt wird, entfernt.

---

#### 2.3. SIDEKICK-Einstellungsmenü
	Das Einstellungsmenü ist z. B. über Bearbeiten  Erweitert aufrufbar.
 

	Das Einstellungsmenü bietet verschiedene Einstellungsmöglichkeiten.
 
	Einstellungen sind jeweils über Tooltips erklärt
(über die Fragezeichen hinter den Optionen).
	Hierüber ist ebenfalls die Auflösung der Bühne einstellbar
(und somit das Größenverhältnis der Bühne in der Code-Ansicht).
	Einstellungen sind zudem für das aktuelle Projekt speicherbar
(über die Schaltfläche Einstellungen im Projekt speichern).
	Folgende Abbildung zeigt die Auflösung 500 x 100 für die Bühne.
 
	Z. B. ist so die Breite von Ultrawide-Monitoren ausnutzbar
	Bei der Assistenzdarstellung nutzbar
(durch entsprechend festgelegte Auflösung).

---

#### 2.4. Bluetooth-Einstellung für die Audioausgabe
	Um ein Gerät mit dem Bluetooth des verwendeten Raspberry Pi zu ver-binden, muss das entsprechende Gerät lediglich in den Pairing-Modus versetzt werden.
	Darauf sollte das Gerät über die Bluetooth-Einstellungen des RPi auffindbar sein – sobald Bluetooth eingeschaltet wurde.
	Die Einstellungen sind unter anderem in der Systemleiste des RPi aufrufbar – wie in folgender Abbildung zu sehen.
 
 
	Sobald erfolgreich eine Verbindung zu dem entsprechenden Bluetooth-Ausgabegerät hergestellt ist, kann beliebiger Sound – etwa über die Video- oder Sound-Blöcke des SIDEKICK-Autorensystems – ausgegeben werden.

---

# scratch-desktop

npm install
npm run fetch
npm run webpack:prod
electron:package:dir

## Packager

Standalone download under:
scripts\packager.json

Scratch 3.0 as a standalone desktop application

## Developer Instructions

### Releasing a new version

Let's assume that you want to make a new release, version `3.999.0`, corresponding to `scratch-gui` version
`0.1.0-prerelease.20yymmdd`.

1. Merge `scratch-gui`:
   1. `cd scratch-gui`
   2. `git pull --all --tags`
   3. `git checkout scratch-desktop`
   4. `git merge 0.1.0-prerelease.20yymmdd`
   5. Resolve conflicts if necessary
   6. `git tag scratch-desktop-v3.999.0`
   7. `git push`
   8. `git push --tags`
2. Prep `scratch-desktop`:
   1. `cd scratch-desktop`
   2. `git pull --all --tags`
   3. `git checkout develop`
   4. `npm install --save-dev 'scratch-gui@github:LLK/scratch-gui#scratch-desktop-v3.999.0'`
   5. `git add package.json package-lock.json`
   6. Make sure the app works, the diffs look reasonable, etc.
   7. `git commit -m "bump scratch-gui to scratch-desktop-v3.999.0"`
   8. `npm version 3.999.0`
   9. `git push`
   10. `git push --tags`
3. Wait for the CI build and collect the release from the build artifacts

### A note about `scratch-gui`

Eventually, the `scratch-desktop` branch of the Scratch GUI repository will be merged with that repository's main
development line. For now, though, the `scratch-desktop` branch holds a few changes that are necessary for the Scratch
app to function correctly but are not yet merged into the main development branch. If you only intend to build or work
on the `scratch-desktop` repository then you can ignore this, but if you intend to work on `scratch-gui` as well, make
sure you use the `scratch-desktop` branch there.

Previously it was necessary to explicitly build `scratch-gui` before building `scratch-desktop`. This is no longer
necessary and the related build scripts, such as `build-gui`, have been removed.

### Prepare media library assets

In the `scratch-desktop` directory, run `npm run fetch`. Re-run this any time you update `scratch-gui` or make any
other changes which might affect the media libraries.

### Run in development mode

`npm start`

### Make a packaged build

`npm run dist`

Node that on macOS this will require installing various certificates.

#### Signing the NSIS installer (Windows, non-store)

*This section is relevant only to members of the Scratch Team.*

By default all Windows installers are unsigned. An APPX package for the Microsoft Store shouldn't be signed: it will
be signed automatically as part of the store submission process. On the other hand, the non-Store NSIS installer
should be signed.

To generate a signed NSIS installer:

1. Acquire our latest digital signing certificate and save it on your computer as a `p12` file.
2. Set `WIN_CSC_LINK` to the path to your certificate file. For maximum compatibility I use forward slashes.
   - CMD: `set WIN_CSC_LINK=C:/Users/You/Somewhere/Certificate.p12`
   - PowerShell: `$env:WIN_CSC_LINK = "C:/Users/You/Somewhere/Certificate.p12"`
3. Set `WIN_CSC_KEY_PASSWORD` to the password string associated with your P12 file.
   - CMD: `set WIN_CSC_KEY_PASSWORD=superSecret`
   - PowerShell: `$env:WIN_CSC_KEY_PASSWORD = "superSecret"`
4. Build the NSIS installer only: building the APPX installer will fail if these environment variables are set.
   - `npm run dist -- -w nsis`

#### Workaround for code signing issue in macOS

Sometimes the macOS build process will result in a build which crashes on startup. If this happens, check in `Console`
for an entry similar to this:

```text
failed to parse entitlements for Scratch[12345]: OSUnserializeXML: syntax error near line 1
```

This appears to be an issue with `codesign` itself. Rebooting your computer and trying to build again might help. Yes,
really.

See this issue for more detail: <https://github.com/electron/electron-osx-sign/issues/218>

### Make a semi-packaged build

This will simulate a packaged build without actually packaging it: instead the files will be copied to a subdirectory
of `dist`.

`npm run dist:dir`

### Debugging

You can debug the renderer process by opening the Chromium development console. This should be the same keyboard
shortcut as Chrome on your platform. This won't work on a packaged build.

You can debug the main process the same way as any Node.js process. I like to use Visual Studio Code with a
configuration like this:

```jsonc
    "launch": {
        "version": "0.2.0",
        "configurations": [
            {
                "name": "Desktop",
                "type": "node",
                "request": "launch",
                "cwd": "${workspaceFolder:scratch-desktop}",
                "runtimeExecutable": "npm",
                "autoAttachChildProcesses": true,
                "runtimeArgs": ["start", "--"],
                "protocol": "inspector",
                "skipFiles": [
                    // it seems like skipFiles only reliably works with 1 entry :(
                    //"<node_internals>/**",
                    "${workspaceFolder:scratch-desktop}/node_modules/electron/dist/resources/*.asar/**"
                ],
                "sourceMaps": true,
                "timeout": 30000,
                "outputCapture": "std"
            }
        ]
    },
```

### Resetting the Telemetry System

This application includes a telemetry system which is only active if the user opts in. When testing this system, it's
sometimes helpful to reset it by deleting the `telemetry.json` file.

The location of this file depends on your operating system and whether or not you're running a packaged build. Running
from `npm start` or equivalent is a non-packaged build.

In addition, macOS may store the file in one of two places depending on the OS version and a few other variables. If
in doubt, I recommend removing both.

- Windows, packaged build: `%APPDATA%\Scratch\telemetry.json`
- Windows, non-packaged: `%APPDATA%\Electron\telemetry.json`
- macOS, packaged build: `~/Library/Application Support/Scratch/telemetry.json` or
  `~/Library/Containers/edu.mit.scratch.scratch-desktop/Data/Library/Application Support/Scratch/telemetry.json`
- macOS, non-packaged build: `~/Library/Application Support/Electron/telemetry.json` or
  `~/Library/Containers/edu.mit.scratch.scratch-desktop/Data/Library/Application Support/Electron/telemetry.json`

Deleting this file will:

- Remove any pending telemetry packets
- Reset the opt in/out state: the app should display the opt in/out modal on next launch
- Remove the random client UUID: the app will generate a new one on next launch

### Building the application

#### Develompent builds

Clone the `sidekick-desktop` repository into a folder `sidekick-desktop` by running:

``` console
<!-- !!! CHANGE !!! -->
git clone --recursive https://github.com/Menersar/sidekick-desktop sidekick-desktop
```

OR (alternatively) run:

``` console
<!-- !!! CHANGE !!! -->
git clone https://github.com/Menersar/sidekick-desktop sidekick-desktop
git submodule init
git submodule update
```

Install dependencies via the following command:

``` console
npm ci
```

Fetch extra library, packager, and extension files by running:

``` console
npm run fetch
```

To build the webpack portions in src-renderer-webpack for development builds, run this:

``` console
npm run webpack:compile
```

You can also run this instead for source file changes to immediately trigger rebuilds:

``` console
npm run webpack:watch
```

If everything is compiled and fetched, the application can be packaged up for Electron.
For development, start a development Electron instance by running:

``` console
npm run electron:start
```

Linux note: The app icon won't work in the development version, but it will work in the packaged version.

Development can work well by opening two terminals side-by-side, run `npm run webpack:watch` in one and `npm run electron:start` in the other.
Refresh the windows with `Ctrl` + `R` or `Cmd` + `R` to apply renderer file changes, manually restart the app to apply main file changes.

#### Production-ready builds

The development version of the app will be larger and slower than the final release builds.

Build an optimized version of the webpack portions with:

``` console
npm run webpack:prod
```

Then to package up the final Electron binaries, use the electron-builder CLI. They will be saved in the dist folder. Some examples:

``` console
# Windows installer

npx electron-builder --windows nsis --x64

# macOS DMG

npx electron-builder --mac dmg --universal

# Linux Debian

npx electron-builder --linux deb
```

<!-- !!! CHANGE !!! -->
More examples in the [release script](https://github.com/Menersar/sidekick-desktop/blob/sidekick/.github/workflows/release.yml). You can typically only package for a certain operating system while on that operating system.

It is possible to give each packaged version of the app a unique distribution ID to help uniquely identify them – it appears in the "About" window.
Add `--config.extraMetadata.sidekick_dist=your-dist-id-here` to electron-builder's arguments to set the distribution ID. Additionally, to enable the in-app update checker, also add `--config.extraMetadata.tw_update=yes`.

## 'packagerInfo' file

file location:

- `scripts/packager.json`

src:

- <https://github.com/Menersar/sidekick-packager/releases>
- <https://github.com/Menersar/sidekick-packager/releases/download/v0.1.0/sidekick-packager-standalone-v0.1.0.html>

sha256:

- npm run build-standalone-prod
- Scaffolding build ID

## Create build for the Raspberry Pi 4 (!!tested for the 8 GB model!!; arm64 architecture; deb package)

- [Install Linux on Windows with WSL](https://learn.microsoft.com/en-us/windows/wsl/install)
  - Open PowerShell or Windows Command Prompt.
  - Use prompt:

    ```console
    wsl --install
    ```

- [Ubuntu WSL Terminal](https://ubuntu.com/wsl) on Windows.
- Navigate to the local SIDEKICK-Desktop folder.
  - To navigate to the Windows User folder:
    - Use prompt:

      ```console
      cd /mnt/c/Users/
      ```

- Optional: Install and update packages.
  - (Resolved my problem with an error stating "/usr/bin/env: 'bash\r': No such file or directory" once using the prompt to build the project as stated in the next step.)
  
  ```console
  sudo apt-get update
  sudo apt-get upgrade
  sudo apt install nodejs npm
  sudo npm install --global n
  sudo n 16.0.0
  ```

- Build the project.
  - Use prompt in the Terminal:
  <!-- npx electron-builder --linux deb --x64 --publish always --config.extraMetadata.sidekick_dist=prod-linux-deb-x64 --config.extraMetadata.sidekick_update=yes -->
  <!-- npx electron-builder --linux deb --armv7l --publish always --config.extraMetadata.sidekick_dist=prod-linux-deb-armv7l --config.extraMetadata.sidekick_update=yes -->
  ```console
  npx electron-builder --linux deb --arm64 --publish always --config.extraMetadata.sidekick_dist=prod-linux-deb-arm64 --config.extraMetadata.sidekick_update=yes
  ```

## [Install debian package](https://unix.stackexchange.com/questions/159094/how-to-install-a-deb-file-by-dpkg-i-or-by-apt) on the Raspberry Pi

- Run prompt in the Terminal:

  ``` console
  sudo apt install /path/to/package/name.deb
  ```

  or

1. Run prompt in the Terminal:

   ``` console
    sudo apt install gdebi 
    ```

2. Open the .deb package file using it.

   - Via: [Right-click] -> "Install Package".
     - or via: [Right-click] -> "Open With" -> Choose: "GDebi Package Installer" -> Click on: "Install Package".
     - The .deb package with all its dependencies get installed.

## Extract GPIO extension from the Raspberry Pi OS Scratch Version

Unpack Scratch / Electron Software:

- [Decompiling and repacking Electron Apps](https://medium.com/@libaration/decompiling-and-repacking-electron-apps-b9bfbc8390d5)

- [Unbundle a webpack bundle.js with the SourceMap](https://stackoverflow.com/questions/46590905/unbundle-a-webpack-bundle-js-with-the-sourcemap)
  - Reverse engineering JavaScript and CSS sources from sourcemaps:
    - [shuji npm package](https://www.npmjs.com/package/shuji)

- [webpack - How to extract bundle to respective components](https://stackoverflow.com/questions/44276097/webpack-how-to-extract-bundle-to-respective-components)
  - [debundle](https://github.com/1egoman/debundle)
    `npm i -g debundle`

Scratch Desktop (Scratch 3.0 Offline Editor) on GNU/Linux:
<https://gist.github.com/lyshie/0c49393076b8b375ca1bd98c28f95fb0?permalink_comment_id=4492637#gistcomment-4492637>

- "But this version of Scratch won't have access to the GPIO and SenseHat extensions for the Raspberry Pi, sadly, since those extensions are exclusive to the special version of Scratch Desktop that comes with the official Raspberry Pi OS."

## Build desktop application for RPi

### tar.gz

Archive and compress as `tar.gz` archive.

``` console
npm run build l arm64 tar.gz
```

or

``` console
 npx electron-builder --linux tar.gz --arm64 --publish always --config.extraMetadata.sidekick_dist=prod-linux-tar-arm64 --config.extraMetadata.sidekick_update=yes
```

### deb

Package as Software distribution / Debian package (`.deb`)

``` console
sudo npm run build l arm64 deb
```

or

``` console
 npx electron-builder --linux deb --arm64 --publish always --config.extraMetadata.sidekick_dist=prod-linux-deb-arm64 --config.extraMetadata.sidekick_update=yes
```

### AppImage

Distribute as portable software format (`AppImage`).

``` console
npm run build l arm64 AppImage
```

or

``` console
npx electron-builder --linux AppImage --arm64 --publish always --config.extraMetadata.sidekick_dist=prod-linux-appimage-arm64 --config.extraMetadata.sidekick_update=yes
```

## Include files in resources of the built app

Add the **file** / **folder** to the `extraResources` parameter in the `build` parameter in `package.json`.

- e.g.:

  ``` json
  "extraResources": [
              // Include a file:
              {
                  "from": "src-main/static/gpiolib.node",
                  "to": "static/gpiolib.node"
              },
              // Include a folder:
              {
                  "from": "src-main/static/rpi-ws281x-native",
                  "to": "static/rpi-ws281x-native",
                  "filter": [
                      "!.git"
                  ]
             }
          ],
  ```

## Expose in main world

To expose functions or properties, add information to the files `src-preload/editor.js` and `src-main/windows/editor.js`.
(E.g. expose a native module to the renderer process)

### src-preload/editor.js

Expose via `contextBridge.exposeInMainWorld`.

- E.g. add `gpioGet: (pin) => ipcRenderer.sendSync("gpio-get", pin)` to `contextBridge.exposeInMainWorld("EditorPreload", {})`:

  ```js
  contextBridge.exposeInMainWorld("EditorPreload", {
    gpioGet: (pin) => ipcRenderer.sendSync("gpio-get", pin),
  });
  ```

### src-main/windows/editor.js

In this file, a `ipcMain` module is created via `const ipc = this.window.webContents.ipc`.

`ipcMain` module:

- It is an Event Emitter.
- When used in the main process, it handles asynchronous and synchronous messages sent from a renderer process (web page).
- Messages sent from a renderer will be emitted to this module.
(Source: <https://www.electronjs.org/docs/latest/api/ipc-main>)

`ipcMain.on(channel, listener)`:
Listens to channel, when a new message arrives listener would be called with listener(event, args...).

- E.g. add the functionality via `ipc.on("gpio-get", (event, gpioPin)` if the message `gpio-get` arrives:

  ```js
  ipc.on("gpio-get", (event, gpioPin) => {
        if (process.platform === "linux") {
          const gpio = require(process.resourcesPath + "/static/gpiolib.node");
          event.returnValue = gpio.get(gpioPin, -1, -1);
        } else {
          event.returnValue = -1;
        }
      });
  ```

## Electron - Add external files?

(Source: <https://stackoverflow.com/questions/46022443/electron-how-to-add-external-files>)

- Declare `extraResources` under `build` in the `package.json` file.

- E.g.:
  1. Create a new folder named `extraResources` adjacent to `package.json`.
  2. Add the following code to your package.json file:

    ``` json
      build": {
        "extraResources": ["./extraResources/**"]
      }
    ```

  - The **files** inside this folder are then accessible by using `__dirname + '/../extraResources/'` from your **main app**.

## Add internal extension to Scratch / SIDEKICK

### scratch-vm

- edit file b/node_modules/scratch-vm/src/extension-support/extension-manager.js
  - pigpio: () => require('../extensions/scratch3_pigpio'),

- add file b/node_modules/scratch-vm/src/extensions/scratch3_pigpio/index.js

### scratch-gui

- edit file b/node_modules/scratch-gui/src/lib/libraries/extensions/index.jsx
  - import pigpioIconURL from './pigpio/pigpio.png';
  - import pigpioInsetIconURL from './pigpio/pigpio-small.svg';
  - {
        name: 'Raspberry Pi GPIO',
        extensionId: 'pigpio',
        collaborator: 'Raspberry Pi',
        iconURL: pigpioIconURL,
        insetIconURL: pigpioInsetIconURL,
        description: (
            <FormattedMessage
                defaultMessage="Control Raspberry Pi GPIO lines"
                description="Description for the 'Pi GPIO' extension"
                id="gui.extension.pigpio.description"
            />
        ),
        featured: true
    },  

- add file b/node_modules/scratch-gui/src/lib/libraries/extensions/pigpio/pigpio-small.svg

- add file b/node_modules/scratch-gui/src/lib/libraries/extensions/pigpio/pigpio.png

## optionalDependencies

(Source: [optionalDependencies package.json npm docs]<https://docs.npmjs.com/cli/v10/configuring-npm/package-json#optionaldependencies>)

If a dependency can be used, but you would like npm to proceed if it cannot be found or fails to install, then you may put it in the optionalDependencies object. This is a map of package name to version or url, just like the dependencies object. The difference is that build failures do not cause installation to fail. Running npm install --omit=optional will prevent these dependencies from being installed.

It is still your program's responsibility to handle the lack of the dependency. For example, something like this:

try {
  var foo = require("foo");
  var fooVersion = require("foo/package.json").version;
} catch (er) {
  foo = null;
}
if (notGoodFooVersion(fooVersion)) {
  foo = null;
}

// .. then later in your program ..

if (foo) {
  foo.doFooThings();
}
Entries in optionalDependencies will override entries of the same name in dependencies, so it's usually best to only put in one place.
