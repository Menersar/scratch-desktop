#!/bin/bash

set -euo pipefail

await_confirmation() {
	echo "AWAITING CONFIRMATION (press enter) ..."
	read
}

# Set up an agent so we only need to enter any SSH passwords once
echo "Setting up SSH agent"
eval "$(ssh-agent)"
ssh-add

echo "THINGS TO CHECK BEFORE RUNNING:"
echo " - git pull"
echo " - pacman -Syu"
echo " - flatpak update"
echo " - snap refresh"
echo "THINGS TO CHECK FOR EACH BUILD:"
echo " - (?) > About > Is the version right?"
# echo

cd "$(dirname "$0")"
src="$(pwd)/.."
cd "$src"
# version="$(jq -r .version package.json)"
# commit="$(git rev-parse HEAD)"
# echo "src $src, version $version, commit $commit"
# echo "src: $src"


# await_confirmation

# Make sure we've been manually updated as I don't know what will happen if we pull changes
# to this script while it's already running.
git fetch
if [ "$(git rev-parse HEAD)" == "$(git rev-parse @{u})" ]; then
	echo "Source is up-to-date"
else
	echo "Source is outdated, please run: git pull"
	exit 1
fi


# # Set up an agent so we only need to enter any SSH passwords once
# echo "Setting up SSH agent"
# eval "$(ssh-agent)"
# ssh-add

version="$(jq -r .version package.json)"
commit="$(git rev-parse HEAD)"
echo "version $version, commit $commit"
await_confirmation

# update_source() {
# 	echo "Updating source"
prepare_source() {
	echo "Preparing source"
	cd "$src"
	# git checkout sidekick
	# git pull
	git submodule update
	npm ci
	npm run fetch
}

# update_source
# version="$(jq -r .version package.json)"
# commit="$(git rev-parse HEAD)"
# echo "version $version, commit $commit"
# await_confirmation

update_flatpak() {
	echo "Updating flatpak"
	cd "$src/../de.mixality.Sidekick"
	git checkout sidekick
	git pull
	git branch -D "$version" || true
	git branch "$version"
	git checkout "$version"
    # # Copy changes from beta branch for when the build process changes
	# git rebase "$version-beta" || true
    # git merge "origin/$version-beta" || true
	sed -E -i "s/commit: [a-f0-9]{40}/commit: $commit/" de.mixality.Sidekick.yaml
	python3 update-library.py
	python3 update-packager.py
	flatpak-node-generator npm ../sidekick-desktop/package-lock.json
	flatpak-builder build de.mixality.Sidekick.yaml --force-clean --install --user
	flatpak run de.mixality.Sidekick
	await_confirmation
	git stage .
	git commit -m "Update to $version" -m "Automated"
	git push --set-upstream origin "$version"
}

update_aur() {
	echo "Updating AUR"
	cd "$src/../sidekick-desktop-bin"
	git checkout sidekick
	git pull
	sed -E -i "s/pkgver=.*/pkgver=$version/" PKGBUILD
	sed -E -i "s/pkgrel=.*/pkgrel=1/" PKGBUILD
	rm *.tar.zst || true
	rm *.tar.gz || true
	updpkgsums
	makepkg --printsrcinfo > .SRCINFO
	makepkg -si
	sidekick-desktop
	await_confirmation
	git stage .
	git commit -m "Update to $version" -m "Automated"
	git push
}

update_snap() {
	echo "Updating snap"
	cd "$src"
	rm dist/*.snap || true
	npm run webpack:prod
    npx electron-builder --linux snap --publish never --config.extraMetadata.sidekick_dist="prod-snap-$(uname -m)"
	snap install --dangerous dist/Sidekick-*.snap
	snap run sidekick-desktop
	await_confirmation
	snapcraft upload --release=stable dist/Sidekick-*.snap
}

update_debian() {
	echo "Updating Debian repository"
	cd "$src/debian"
	./everything.sh
}

# update_source
prepare_source
update_flatpak
update_aur
update_snap
update_debian

# !!! TODO? ???
echo "THINGS YOU STILL NEED TO DO:"
echo " - Merge flatpak/de.mixality.Sidekick PR"
echo " - Delete old binaries from Debian repository"
echo " - Upload to Microsoft Store"
echo " - Announcements"
