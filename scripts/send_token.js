const ethers = require('ethers');

require('dotenv').config();

const provider = new ethers.providers.InfuraProvider("rinkeby");
    
let wallet = new ethers.Wallet(process.env.private_key);

var signer = new ethers.Wallet(process.env.private_key, provider);

let transaction = {
    from: wallet.address,
    to: process.env.to_address,
    value: ethers.utils.parseEther('0.01'),
    gasLimit: ethers.utils.hexlify("0x210000"),
    gasPrice: ethers.utils.parseUnits('60', 'gwei'),
    chainId: 4
  };
signer.signTransaction(transaction);
signer.sendTransaction(transaction)
.then((txObj) => {
    console.log('txHash', txObj.hash);
});