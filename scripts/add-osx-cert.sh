#!/usr/bin/env sh

KEY_CHAIN=build.keychain
CERTIFICATE_P12=certificate.p12

echo $CERT_OSX_P12 | base64 --decode > $CERTIFICATE_P12

security create-keychain -p travis $KEY_CHAIN

security default-keychain -s $KEY_CHAIN

security unlock-keychain -p travis $KEY_CHAIN

security import $CERTIFICATE_P12 -k $KEY_CHAIN -P $CERT_OSX_PASSWORD -T /usr/bin/codesign;

security set-key-partition-list -S apple-tool:,apple: -s -k travis $KEY_CHAIN

rm -rf *.p12
