#!/bin/bash

set -euo pipefail

echo -e "\e[31m\e[1m!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
echo -e "!!! THIS SCRIPT IS DEPRECATED !!!"
echo -e "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\e[0m"
echo ""
echo "Please use one of the installation methods listed on https://https://menersar.github.io/Sidekick/sidekick-desktop/ instead."
echo "They are more secure and often integrate into your system's package manager."
echo "If for some reason you must use this script, please contact us."
echo ""
echo "Press enter to acknowledge the warning and continue anyways."
read

fatal() {
    echo "Error: $@"
    # !!! CHANGE !!!
    # echo "Open an issue for help: https://github.com/Mixality/sidekick-desktop/issues/new (please include full log)"
    echo "Open an issue for help: https://github.com/Menersar/sidekick-desktop/issues/new (please include full log)"
    exit 1
}

install_complete() {
    echo "Install complete"
    exit
}

command_exists() {
    command -v "$1" &> /dev/null
}

if [ "$(uname -s)" != "Linux" ]; then
    fatal "This doesn't look like Linux"
fi
if [ "$(whoami)" != "root" ]; then
    fatal "Must be run as root."
fi

VERSION="0.1.0"
ARCH="$(uname -m)"
echo "Version: $VERSION"
echo "System archictecture: $ARCH"

# Debian/Ubuntu
if command_exists apt; then
    echo "Detected Debian/Ubuntu based system"
    TMPFILE=$(mktemp --suffix=.deb)
    if [ "$ARCH" = "x86_64" ]; then
        filearch="amd64"
    elif [ "$ARCH" = "i386" ]; then
        filearch="i386"
    elif [ "$ARCH" = "armv7l" ]; then
        filearch="armv7l"
    elif [ "$ARCH" = "aarch64" ]; then
        filearch="arm64"
    else
        fatal "Unknown architecture"
    fi
    # !!! CHANGE !!!
    # wget -O "$TMPFILE" "https://github.com/Mixality/sidekick-desktop/releases/download/v$VERSION/Sidekick-linux-$filearch-$VERSION.deb"
    wget -O "$TMPFILE" "https://github.com/Menersar/sidekick-desktop/releases/download/v$VERSION/Sidekick-linux-$filearch-$VERSION.deb"
    chown _apt:root "$TMPFILE"
    apt install -y "$TMPFILE"
    rm "$TMPFILE"
    install_complete
fi

# Everything else
echo "Performing generic install"
TMPFILE=$(mktemp --suffix=.tar.gz)
if [ "$ARCH" = "x86_64" ]; then
    filearch="x64"
elif [ "$ARCH" = "i386" ]; then
    filearch="i386"
elif [ "$ARCH" = "armv7l" ]; then
    filearch="armv7l"
elif [ "$ARCH" = "aarch64" ]; then
    filearch="arm64"
else
    fatal "Unknown architecture"
fi
# !!! CHANGE !!!
# wget -O "$TMPFILE" "https://github.com/Mixality/sidekick-desktop/releases/download/v$VERSION/Sidekick-linux-$filearch-$VERSION.tar.gz"
wget -O "$TMPFILE" "https://github.com/Menersar/sidekick-desktop/releases/download/v$VERSION/Sidekick-linux-$filearch-$VERSION.tar.gz"
mkdir -p /opt/Sidekick
tar -xvf "$TMPFILE" --strip-components=1 -C /opt/Sidekick
cp /opt/Sidekick/resources/static/icon.png /usr/share/icons/hicolor/512x512/apps/sidekick-desktop.png
cat > /usr/share/applications/sidekick-desktop.desktop << EOF
[Desktop Entry]
Name=Sidekick
Exec=/opt/Sidekick/sidekick-desktop %U
Terminal=false
Type=Application
Icon=sidekick-desktop
StartupWMClass=Sidekick
Comment=Sidekick is based on Scratch and features of the Scratch mod TurboWarp. Sidekick serves as an assistance system tool to support people with disabilities in procedural workflows by displaying instructions for individual work steps. Workflows can be created via the Scratch programming interface.
MimeType=application/x.scratch.sb3;
Categories=Development;
EOF
cat > /usr/share/mime/packages/sidekick-desktop.xml << EOF
<?xml version="1.0" encoding="utf-8"?>
<mime-info xmlns="http://www.freedesktop.org/standards/shared-mime-info">
<mime-type type="application/x.scratch.sb3">
  <glob pattern="*.sb3"/>
  <icon name="sidekick-desktop"/>
</mime-type>
</mime-info>
EOF
chmod 4755 /opt/Sidekick/chrome-sandbox
ln -sf /opt/Sidekick/sidekick-desktop /usr/bin/sidekick-desktop
update-mime-database /usr/share/mime
update-desktop-database /usr/share/applications
gtk-update-icon-cache -f /usr/share/icons/hicolor/
rm "$TMPFILE"
install_complete