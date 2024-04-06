# EmbedSdkWithCocosCreator Integration Guide

Welcome to the EmbedSdkWithCocosCreator integration guide. Follow the steps below to set up the project in your development environment.

Please see the following for an example of how it works.<br>
https://discord.com/channels/613425648685547541/1220023876029911152

## Prerequisites
Ensure you have the following installed:

- Git
- Node.js and npm
- Cocos Dashboard
- Cocos Creator (v3.8.2)
- nginx (For serving the web version)
- Cloudflared (For tunneling and exposing your server)

## Setup Instructions
### Cloning the Repository
Execute the following commands in your terminal to clone the project and navigate into the project directory:
```bash
git clone git@github.com:suittizihou/EmbedSdkWithCocosCreator.git
cd EmbedSdkWithCocosCreator/
```

## Environment Configuration
Copy the example environment file and the constants template to set up your environment variables:
```bash
cp example.env .env
cd EmbedSdkWithCocosCreator/
npm install
cp assets/env/Constants.Example.ts assets/env/Constants.ts
```
Navigate to the server directory and install its dependencies:
```bash
cd ../../EmbedSdkWithCocosCreator/server/
npm install
```

**Edit Environment Variables**: Modify the contents of `Constants.ts` and `.env` files to match your environment.

## Adding Project to Cocos Dashboard
Add the project to your Cocos Dashboard by selecting the `EmbedSdkWithCocosCreator/EmbedSdkWithCocosCreator` directory.

## Installing nginx
1. Download nginx from https://nginx.org/en/download.html (e.g., nginx/Windows-1.25.4) and extract it.
2. Move the extracted nginx folder to the `EmbedSdkWithCocosCreator` directory.

The current directory structure should look like this:
```
EmbedSdkWithCocosCreator
├── .env
├── .git
├── .gitignore
├── EmbedSdkWithCocosCreator
├── README.md
├── example.env
├── nginx-1.25.4
└── server
```
## Configuring nginx
Edit your nginx configuration (`nginx.conf`) to serve your project and forward API requests:
```nginx
server {
    listen       5173;
    server_name  localhost;

    location / {
        root   ../EmbedSdkWithCocosCreator/build/web-mobile;
        index  index.html index.htm;
        try_files $uri $uri/ =404;
    }

    location /api {
        proxy_pass http://localhost:3001; # URL of the backend server
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

## Building with Cocos Creator
To build the project for web, follow these steps in Cocos Creator:

1. Navigate to `Project > Build`.
2. Select Platform: **Web Mobile**.
3. Click on **Build**.

## Launching the Server
Start nginx by navigating to the nginx directory and running `nginx.exe`:
```PowerShell
.\nginx.exe
```
Navigate to the `\EmbedSdkWithCocosCreator\server` directory and execute the following command to launch the server:
```PowerShell
npm run dev
```
Exposing Your Server with Cloudflared
Use Cloudflared to make your server publicly accessible:
```PowerShell
cloudflared tunnel -url http://localhost:5173
```