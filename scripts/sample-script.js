const { ethers } = require("hardhat");

async function main() {
  const provider = new ethers.providers.InfuraProvider("rinkeby");

  var deployer = new ethers.Wallet(process.env.private_key, provider);
  // const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  console.log("Account balance:", (await deployer.getBalance()).toString());

  const TheWinTK = await ethers.getContractFactory("TheWinTK");
  const token = await TheWinTK.deploy();

  console.log("Token address:", token.address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
