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
    if command -v magick >/dev/null 2>&1; then
        magick -background none -resize "${WIDTH}x${HEIGHT}" -extent "${WIDTH}x${HEIGHT}" -gravity center "$@" "${SRC_T}" "${DST}"
        # convert -background none -resize "${WIDTH}x${HEIGHT}" -extent "${WIDTH}x${HEIGHT}" -gravity center "$@" "${SRC_T}" "${DST}"
    fi
    optimize "${DST}"
}

if command -v convert >/dev/null 2>&1; then
    # Mac
    if command -v iconutil >/dev/null 2>&1; then
        mkdir -p "${OUT_ICONSET}"
        for SIZE in 16 32 128 256 512; do
            SIZE2=$(expr "${SIZE}" '*' 2)
            resize "${SIZE}" "${SIZE}" "${SRC}" "${OUT_ICONSET}/icon_${SIZE}x${SIZE}.png" -density 72 -units PixelsPerInch
            resize "${SIZE2}" "${SIZE2}" "${SRC}" "${OUT_ICONSET}/icon_${SIZE}x${SIZE}@2x.png" -density 144 -units PixelsPerInch
        done
        iconutil -c icns --output "${OUT_ICNS}" "${SRC_MAC}"
    else
        echo "iconutil is not available — skipping ICNS and ICONSET"
    fi

    # Windows ICO
    mkdir -p "${TMP_ICO}"
    mkdir -p icon
    for SIZE in ${ICO_BASIC_SIZES} ${ICO_EXTRA_SIZES}; do
        if command -v magick >/dev/null 2>&1; then
            # resize: newWidth:16 newHeight:16 input:../src/icon/SidekickDesktop.svg output:tpm/icon_16x16.png
            magic -resize "${SIZE}" "${SIZE}" "${SRC}" "${TMP_ICO}/icon_${SIZE}x${SIZE}.png"
            # resize: newWidth:16 newHeight:16 input:../src/icon/sk.png output:tpm/sk_16x16.png
            magic -resize "${SIZE}" "${SIZE}" "${SRC_SK}" "${TMP_ICO}/sk_${SIZE}x${SIZE}.png"
        fi
    done
    # Asking for "Zip" compression actually results in PNG compression
    # convert: tpm/icon_*.png -colorspace sRGB -compress Zip SidekickDesktop.ico
    # convert "${TMP_ICO}"/icon_*.png -colorspace sRGB -compress Zip "${OUT_ICO}"
    if command -v magick >/dev/null 2>&1; then
        magick "${TMP_ICO}"/icon_*.png -colorspace sRGB -compress Zip "${OUT_ICO}"
        # convert: tpm/sk_*.png -colorspace sRGB -compress Zip ./icon/sk.ico
        # convert "${TMP_ICO}"/sk_*.png -colorspace sRGB -compress Zip "${OUT_SK}"
        magick "${TMP_ICO}"/sk_*.png -colorspace sRGB -compress Zip "${OUT_SK}"
    fi

    # Windows AppX
    mkdir -p "appx"
    # resize: newWidth:44 newHeight:44 input:../src/icon/SidekickDesktop.svg output:appx/Square44x44Logo.png
    if command -v magick >/dev/null 2>&1; then
        magic -resize 44 44 "${SRC}" 'appx/Square44x44Logo.png'
        magic -resize 50 50 "${SRC}" 'appx/StoreLogo.png'
        magic -resize 150 150 "${SRC}" 'appx/Square150x150Logo.png'
        magic -resize 310 150 "${SRC}" 'appx/Wide310x150Logo.png'
    fi
else
    echo "ImageMagick is not available - cannot convert icons"
fi
