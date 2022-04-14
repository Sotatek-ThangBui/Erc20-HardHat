const { expect } = require("chai");
const { utils } = require("ethers");
const { ethers } = require("hardhat");

describe("TheWinTK", function () {

  let Token;
  let twtkToken;
  let owner;
  let addr1;
  let addr2;
  let addrs;
  let treasuryAddr;

  beforeEach(async function () {
    Token = await ethers.getContractFactory("TheWinTK");

    [owner, addr1, addr2, treasuryAddr, ...addrs] = await ethers.getSigners();

    twtkToken = await Token.deploy();
  });

  describe("Deployment", function () {
    it("Deployment should set the right owner", async function () {
      expect(await twtkToken.owner()).to.equal(owner.address);
    });

    it("Deployment should assign the total supply of tokens to the owner", async function () {
      const ownerBalance = await twtkToken.balanceOf(owner.address);

      expect(await twtkToken.totalSupply()).to.equal(ownerBalance);
    });
  });

  describe("Transaction", function () {
    it("Should transfer tokens between accounts and transfer 5% into treasurey address", async function () {
      const amount = 1000;

      await twtkToken.transfer(addr1.address, amount);

      const treasuryAmount = amount * 5 / 100;

      const addr1Balance = await twtkToken.balanceOf(addr1.address);

      expect(addr1Balance).to.equal(amount - treasuryAmount);
    });

    it("Should fail if sender doesn’t have enough tokens", async function () {
      const initialOwnerBalance = await twtkToken.balanceOf(owner.address);

      await expect(twtkToken.connect(addr1).transfer(owner.address, 10)).to.be.revertedWith("ERC20: transfer amount exceeds balance");

      expect(await twtkToken.balanceOf(owner.address)).to.equal(initialOwnerBalance);
    });

    it("Should fail if sender is blacklisted", async function () {
      await twtkToken.transfer(addr1.address, 100);

      expect(await twtkToken.balanceOf(addr1.address)).to.equal(100 - 100 * 5 / 100);

      await twtkToken.addToBlackList(addr1.address);

      expect(await twtkToken.isInBlackList(addr1.address)).to.equal(true);

      await expect(twtkToken.connect(addr1).transfer(addr2.address, 10)).to.be.revertedWith("sender is in blacklist");

      expect(await twtkToken.balanceOf(addr1.address)).to.equal(100 - 100 * 5 / 100);
    });
  });

  describe("Mint", function () {
    it("Should mint if is owner minting", async function () {
      const currentOwnerBalance = await twtkToken.balanceOf(owner.address);

      const currentTotalSupply = await twtkToken.totalSupply();

      await twtkToken.mint(owner.address, 10);

      expect(await twtkToken.balanceOf(owner.address)).to.equal(currentOwnerBalance.add(10));

      expect(await twtkToken.totalSupply()).to.equal(currentTotalSupply.add(10));
    });

    it("Should fail if not owner minting", async function () {
      const addr1BalanceBeforeMint = await twtkToken.balanceOf(addr1.address);

      const totalSupplyBeforeMint = await twtkToken.totalSupply();

      await expect(twtkToken.connect(addr1).mint(addr1.address, 10)).to.be.revertedWith("Ownable: caller is not the owner");

      expect(await twtkToken.balanceOf(addr1.address)).to.equal(addr1BalanceBeforeMint);

      expect(await twtkToken.totalSupply()).to.equal(totalSupplyBeforeMint);
    });
  });

  describe("Burn", function () {
    it("Should burn if is owner burning", async function () {
      const currentOwnerBalance = await twtkToken.balanceOf(owner.address);

      const currentTotalSupply = await twtkToken.totalSupply();

      await twtkToken.burn(owner.address, 10);

      expect(await twtkToken.balanceOf(owner.address)).to.equal(currentOwnerBalance.sub(10));

      expect(await twtkToken.totalSupply()).to.equal(currentTotalSupply.sub(10));
    });

    it("Should fail if burning amount exceed balance", async function () {
      const currentOwnerBalance = await twtkToken.balanceOf(owner.address);

      const totalSupplyBeforeBurn = await twtkToken.totalSupply();

      await expect(twtkToken.burn(owner.address, currentOwnerBalance.add(30))).to.be.revertedWith("ERC20: burn amount exceeds balance");

      expect(await twtkToken.balanceOf(owner.address)).to.equal(currentOwnerBalance);

      expect(await twtkToken.totalSupply()).to.equal(totalSupplyBeforeBurn);
    });

    it("Should fail if not owner burning", async function () {
      const addr1BalanceBeforeBurn = await twtkToken.balanceOf(addr1.address);

      const totalSupplyBeforeBurn = await twtkToken.totalSupply();

      await expect(twtkToken.connect(addr1).burn(addr1.address, 10)).to.be.revertedWith("Ownable: caller is not the owner");

      expect(await twtkToken.balanceOf(addr1.address)).to.equal(addr1BalanceBeforeBurn);

      expect(await twtkToken.totalSupply()).to.equal(totalSupplyBeforeBurn);
    });
  });

  describe("BlackList", function () {
    it("Should add address to blacklist if is owner adding", async function () {
      expect(await twtkToken.isInBlackList(addr1.address)).to.equal(false);

      await twtkToken.addToBlackList(addr1.address);

      expect(await twtkToken.isInBlackList(addr1.address)).to.equal(true);
    });

    it("Should remove address from blacklist if is owner removing", async function () {
      await twtkToken.addToBlackList(addr1.address);

      expect(await twtkToken.isInBlackList(addr1.address)).to.equal(true);

      await twtkToken.removeFromBlackList(addr1.address);

      expect(await twtkToken.isInBlackList(addr1.address)).to.equal(false);
    });

    it("Should not add address from blacklist if is not owner adding", async function () {
      expect(await twtkToken.isInBlackList(addr2.address)).to.equal(false);

      expect(twtkToken.connect(addr1).addToBlackList(addr2.address)).to.be.revertedWith("Ownable: caller is not the owner");

      expect(await twtkToken.isInBlackList(addr2.address)).to.equal(false);
    });

    it("Should not remove address from blacklist if is not owner removing", async function () {
      await twtkToken.addToBlackList(addr2.address);

      expect(await twtkToken.isInBlackList(addr2.address)).to.equal(true);

      expect(twtkToken.connect(addr1).removeFromBlackList(addr2.address)).to.be.revertedWith("Ownable: caller is not the owner");

      expect(await twtkToken.isInBlackList(addr2.address)).to.equal(true);
    });
  });
});