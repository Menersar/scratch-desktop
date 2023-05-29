#!/bin/bash

# magic ../src/icon/SidekickDesktop.svg appx/Square44x44Logo.png
magic convert -resize '48x48' "../src/icon/SidekickDesktop.svg" "tmp/icon_48x48.png"
magic convert "tmp/icon_48x48.png" -colorspace sRGB -compress Zip SidekickDesktop.ico