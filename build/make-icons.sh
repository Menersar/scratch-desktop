#!/bin/bash
SRC=../src/icon/SidekickDesktop.svg
SRC_MAC=../src/icon/SidekickDesktop.png
SRC_SK=../src/icon/sk.png
OUT_ICONSET=SidekickDesktop.iconset
OUT_ICNS=SidekickDesktop.icns
OUT_ICO=SidekickDesktop.ico
OUT_SK=./icon/sk.ico
TMP_ICO=tmp

ICO_BASIC_SIZES="16 24 32 48 256"
ICO_EXTRA_SIZES="20 30 36 40 60 64 72 80 96 512"

# (For more information see: https://gist.github.com/ahmed-musallam/0ba94853fcba39b01e4f5083daca7567.)

if command -v pngcrush >/dev/null 2>&1; then
    function optimize() {
        pngcrush -new -brute -ow "$@"
    }
else
    echo "pngcrush is not available - skipping PNG optimization"
    function optimize() {
        echo "Not optimizing:" "$@"
    }
fi

# usage: resize newWidth newHeight input output [otherOptions...]
function resize() {
    WIDTH=$1
    HEIGHT=$2
    SRC_T=$3
    DST=$4
    shift 4
    convert -background none -resize "${WIDTH}x${HEIGHT}" -extent "${WIDTH}x${HEIGHT}" -gravity center "$@" "${SRC_T}" "${DST}"
    optimize "${DST}"
}

if command -v convert >/dev/null 2>&1; then
    # Mac
    # Generate icon.icns for mac app (this only works on mac).
    if command -v iconutil >/dev/null 2>&1; then
        mkdir -p "${OUT_ICONSET}"
        for SIZE in 16 32 128 256 512; do
            SIZE2=$(expr "${SIZE}" '*' 2)
            resize "${SIZE}" "${SIZE}" "${SRC}" "${OUT_ICONSET}/icon_${SIZE}x${SIZE}.png" -density 72 -units PixelsPerInch
            resize "${SIZE2}" "${SIZE2}" "${SRC}" "${OUT_ICONSET}/icon_${SIZE}x${SIZE}@2x.png" -density 144 -units PixelsPerInch
        done
    # if command -v iconutil >/dev/null 2>&1; then
        iconutil -c icns --output "${OUT_ICNS}" "${SRC_MAC}"
    else
        echo "iconutil is not available – skipping ICNS and ICONSET."
    fi

    # Windows ICO
    mkdir -p "${TMP_ICO}"
    mkdir -p icon
    for SIZE in ${ICO_BASIC_SIZES} ${ICO_EXTRA_SIZES}; do
        resize "${SIZE}" "${SIZE}" "${SRC}" "${TMP_ICO}/icon_${SIZE}x${SIZE}.png"
        resize "${SIZE}" "${SIZE}" "${SRC_SK}" "${TMP_ICO}/sk_${SIZE}x${SIZE}.png"
    done
    # Asking for "Zip" compression actually results in PNG compression
    convert "${TMP_ICO}"/icon_*.png -colorspace sRGB -compress Zip "${OUT_ICO}"
    convert "${TMP_ICO}"/sk_*.png -colorspace sRGB -compress Zip "${OUT_SK}"

    # Windows AppX
    mkdir -p "appx"
    resize 44 44 "${SRC}" 'appx/Square44x44Logo.png'
    resize 50 50 "${SRC}" 'appx/StoreLogo.png'
    resize 150 150 "${SRC}" 'appx/Square150x150Logo.png'
    resize 310 150 "${SRC}" 'appx/Wide310x150Logo.png'
else
    echo "ImageMagick is not available - cannot convert icons"
fi
