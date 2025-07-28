This repository contains a sample NodeJS application that will verify the authenticity of a webhook sent from the Volt system.

## Running the application
This application was written in TypeScript on Node v22.17.1 using `ts-node` as the runtime. With no modifications the application should run and output a statement that the signature was valid.

Follow this process to get up and running:
1. Checkout this repository locally
2. Verify you are using the correct version of Node
   1. `node --version`
   2. Different minor and patch versions of Node v22 should not have any impact on the ability of this code to run.
3. Install the dependencies
   1. `npm install`
4. Run the application
   1. `npm run start`
