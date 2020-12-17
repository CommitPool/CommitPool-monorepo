##  CommitPool App repository

CommitPool helps people meet their personal goals by holding themselves accountable. CommitPool users stake money to credibly commit to meeting their goals, and lose their stake when they don’t.

## Getting started

#### Desktop/web app
1. Use node 14 (tested on 14.7.0)
2. ```npm install```
3. ```npm run-script web``` 
4. Wait for it..

#### Android & iOS app using the Expo client app

1. Use node 14 (tested on 14.7.0)
2. Install Expo CLI on machine
3. Install Expo client app on mobile device
4. ```npm install```
4. ```expo start```
5. Scan QR code in CLI with client app
6. Touch screen to pass the splash screen

#### Android app using Android Studio emulator 

For this set-up we rely on the Android Studio's built-in emulator. 

1. Use node 14 (tested on 14.7.0)
2. Install Expo CLI on machine
3. Configure [Android Studio emulator](https://docs.expo.io/workflow/android-studio-emulator/)
4. ```npm install```
5. ```expo start```
6. Start emulated device via AVD Manager
7. Press `a` in the CLI after presented with the QR code and the options menu.
8. Observe the Expo magic on your emulator

## Builds

#### Building APK from Android Studio
For testing purposes have an APK available independent of Expo could prove valuable. For this we will use Android Studio.

## Features

CommitPool Mobile features:

- [x] Web
- [x] iOS
- [x] Android

## Architecture

![Architecture diagram of CommitPool](/documentation/architecture.png "Architecture diagram")

## Stack

React native
Expo for web, iOS and Android development.

## Get in touch

<commitpool@gmail.com>

Subscribe to our [Substack](https://https://commit.substack.com/)

CommitPool helps people meet their personal goals by holding themselves accountable. CommitPool users stake money to credibly commit to meeting their goals, and lose their stake when they don’t.