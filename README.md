# Cross

Bootstraped with SE-2

Cross is a decentralized application (dapp) that enables users to bridge their assets between Ethereum and Optimism and collect rare Cross NFTs(Non-Fungible Tokens) on the Ethereum blockchain. The app is built with Next.js and typescrip on the frontend, and Solidity smart contracts on the backend.

## Tech Stack

The following technologies were used to develop the Cross dapp:
Frontend

    SE-2 - Ethereum develoment stack for fast product iteration
    Next.js - React framework for server-side rendering and static site generation
    TypeScript - statically-typed superset of JavaScript
    Tailwind CSS - CSS framework for rapid UI development
    Ethersjs - JavaScript library for interacting with the Ethereum blockchain
    OptimismSDK - A JS SDK by the optimism team for interacting with the optimism ecosystem
    Pinata - IPFS-based content delivery network for storing and serving NFT metadata

Backend

    Solidity - contract-oriented programming language for writing smart contracts on the Ethereum blockchain
    Hardhat - development framework for creating, testing, and deploying smart contracts
    Goerli - testnet blockchain for Ethereum development and testing
    Alchemy - Ethereum node provider for accessing the Ethereum network from a web application
    OpenZeppelin - library for secure smart contract development and deployment

Installation

To run the Cross dapp locally, follow these steps:

    Clone the repository: 
    ```
    git clone https://github.com/EngrGord/Cross.git
    cd Cross && yarn install
    yarn start
    yarn chain
    yarn deploy
    Open http://localhost:3000 in your web browser

Usage

The Cross dapp allows users to browse and collect NFTs on the Ethereum blockchain. Users can view the details of each NFT, including its name, image, description, and bridg value. To collect an NFT, users must have an Ethereum wallet with sufficient funds to cover the bridge value and fee.
Contributing

To contribute to the Cross dapp, please follow these steps:

    Fork the repository
    Create a new branch: git checkout -b my-feature-branch
    Make changes and commit: git commit -m "Add new feature"
    Push to the branch: git push origin my-feature-branch
    Create a pull request

License

The Cross dapp is released under the MIT License. See LICENSE for more information.

⚠️ This project is currently under active development. Things might break. Feel free to check the open issues & create new ones.

