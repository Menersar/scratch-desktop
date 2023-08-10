#!/bin/bash

echo -e "\e[31m\e[1m!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!"
echo -e "!!! THIS SCRIPT IS DEPRECATED !!!"
echo -e "!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!\e[0m"
echo ""
# !!! CHANGE !!!
# echo "Please see our website instead: https://mixality.github.io/Sidekick/desktop/uninstall"
echo "Please see our website instead: https://menersar.github.io/Sidekick/desktop/uninstall"
echo ""
echo "Press enter to ignore this warning and continue anyways."
read

if [ "$USER" != "root" ]; then
    echo "Must be run as root."
    exit 1
fi

echo "We're going to try to uninstall the app in a bunch of different ways."
echo "You will probably see a bunch of errors, this is normal and can be ignored."
echo "(Press enter to continue)"
read

# Snap
snap remove sidekick-desktop

# Debian/Ubuntu
apt purge -y sidekick-desktop

# Everything else
rm /usr/share/applications/sidekick-desktop.desktop
rm /usr/share/mime/packages/sidekick-desktop.xml
rm /usr/share/icons/hicolor/512x512/apps/sidekick-desktop.png
rm -rf /opt/Sidekick

update-mime-database /usr/share/mime
update-desktop-database /usr/share/applications
gtk-update-icon-cache -f /usr/share/icons/hicolor/

echo "Should be uninstalled."
