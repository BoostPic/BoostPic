#!/usr/bin/env sh

cd BoostPic_Chrome
rm ../BoostPic_Chrome.zip
zip -r ../BoostPic_Chrome.zip manifest.json popup.html images js css
cd ..
cd BoostPic_FireFox
rm ../BoostPic_FireFox.zip
zip -r ../BoostPic_FireFox.zip manifest.json popup.html images js css
cd ..
