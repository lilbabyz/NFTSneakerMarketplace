const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("NFTMarketplace", function () {
  this.timeout(50000);

  let myNFT;
  let owner;
  let acc1;
  let acc2;

  this.beforeEach(async function () {
    // This is executed before each test
    // Deploying the smart contract
    [owner, acc1, acc2] = await ethers.getSigners();
    const MyNFT = await ethers.getContractFactory("MyNFT");
    myNFT = await MyNFT.deploy();

    const NFTMarketplace = await ethers.getContractFactory("NFTMarketplace");
    nftMarketplace = await NFTMarketplace.deploy();
  });

  /**
   * Test helpers start
   */

  const contractErrors = {
    zeroPrice: "Price should be above zero",
    alreadySold: "sneaker already sold",
    insufficientEther: "not enough balance",
    notFound: "sneaker doesn't exist",
    insufficientPermission: "Can't perform transaction",
  };

  const newListing = async (
    tokenURI = "dummyURI",
    tokenId = 0,
    tokenPrice = 10,
    account = acc1
  ) => {
    const tx1 = await myNFT.connect(account).mint(tokenURI);
    await tx1.wait();

    const tx2 = await myNFT
      .connect(account)
      .approve(nftMarketplace.address, tokenId);
    await tx2.wait();

    const tx3 = await nftMarketplace
      .connect(account)
      .listSneaker(myNFT.address, tokenId, tokenPrice);
    return await tx3.wait();
  };

  const buySneaker = async (buyer, sneakerId, price) => {
    const tx = await nftMarketplace.connect(buyer).buySneaker(sneakerId, {
      value: price,
    });
    return await tx.wait();
  };

  const parseAmount = (amount) => ethers.utils.parseEther(String(amount));

  /**
   * Test helpers end
   */

  describe("listSneaker", () => {
    it("should list a new sneaker", async () => {
      const tokenURI = "https://example.com/1";
      const tokenId = 1;
      const tokenPrice = parseAmount(10);

      const sneakerCount = 1;
      await newListing(tokenURI, tokenId, tokenPrice);

      const sneaker = await nftMarketplace.getSneaker(sneakerCount);
      expect(sneaker.price).to.equal(tokenPrice);
      expect(sneaker.seller).to.equal(acc1.address);
    });

    it("should transfer token ownership to marketplace", async () => {
      const tokenURI = "https://example.com/1";
      const tokenId = 1;
      const tokenPrice = parseAmount(10);

      await newListing(tokenURI, tokenId, tokenPrice);

      expect(await myNFT.ownerOf(tokenId)).to.equal(nftMarketplace.address);
    });

    it("should fail to list sneaker with zero price", async () => {
      const tokenURI = "https://example.com/1";
      const tokenId = 1;
      const tokenPrice = parseAmount(0);

      await expect(
        newListing(tokenURI, tokenId, tokenPrice)
      ).to.be.revertedWith(contractErrors.zeroPrice);
    });
  });

  describe("buySneaker", () => {
    it("should pay seller on successful purchase", async () => {
      const tokenURI = "https://example.com/1";
      const tokenId = 1;
      const tokenPrice = parseAmount(10);

      await newListing(tokenURI, tokenId, tokenPrice);

      const sneakerCount = 1;

      const initialSellerBalance = await ethers.provider.getBalance(
        acc1.address
      );
      await buySneaker(acc2, sneakerCount, tokenPrice);
      const newSellerBalance = await ethers.provider.getBalance(acc1.address);
      expect(newSellerBalance).to.equal(initialSellerBalance.add(tokenPrice));
    });

    it("should transfer token ownership to buyer", async () => {
      const tokenURI = "https://example.com/1";
      const tokenId = 1;
      const tokenPrice = parseAmount(10);

      await newListing(tokenURI, tokenId, tokenPrice);

      const sneakerCount = 1;

      await buySneaker(acc2, sneakerCount, tokenPrice);
      expect(await myNFT.ownerOf(tokenId)).to.equal(acc2.address);
    });

    it("should fail to buy already sold sneaker", async () => {
      const tokenURI = "https://example.com/1";
      const tokenId = 1;
      const tokenPrice = parseAmount(10);

      await newListing(tokenURI, tokenId, tokenPrice);

      const sneakerCount = 1;

      await buySneaker(acc2, sneakerCount, tokenPrice);

      await expect(
        buySneaker(acc2, sneakerCount, tokenPrice)
      ).to.be.revertedWith(contractErrors.alreadySold);
    });

    it("should fail to buy sneaker without paying sneaker price", async () => {
      const tokenURI = "https://example.com/1";
      const tokenId = 1;
      const tokenPrice = parseAmount(10);

      await newListing(tokenURI, tokenId, tokenPrice);

      const sneakerCount = 1;

      await expect(buySneaker(acc2, sneakerCount, 0)).to.be.revertedWith(
        contractErrors.insufficientEther
      );
    });

    it("should fail to buy a sneaker that is not listed", async () => {
      const sneakerCount = 1;

      await expect(buySneaker(acc2, sneakerCount, 0)).to.be.revertedWith(
        contractErrors.notFound
      );
    });
  });

  describe("modifySneakerPrice", () => {
    it("should allow owner change sneaker price", async () => {
      const tokenURI = "https://example.com/1";
      const tokenId = 1;
      const tokenPrice = parseAmount(10);
      const newTokenPrice = parseAmount(300);

      await newListing(tokenURI, tokenId, tokenPrice, acc1);

      const sneakerCount = 1;
      let sneaker = await nftMarketplace.getSneaker(sneakerCount);
      expect(sneaker.price).to.equal(tokenPrice);

      const tx = await nftMarketplace
        .connect(acc1)
        .modifySneakerPrice(newTokenPrice, tokenId);
      await tx.wait();

      sneaker = await nftMarketplace.getSneaker(sneakerCount);
      expect(sneaker.price).to.equal(newTokenPrice);
    });

    it("should not allow non-owner change sneaker price", async () => {
      const tokenURI = "https://example.com/1";
      const tokenId = 1;
      const tokenPrice = parseAmount(10);
      const newTokenPrice = parseAmount(300);

      await newListing(tokenURI, tokenId, tokenPrice, acc1);

      const sneakerCount = 1;
      let sneaker = await nftMarketplace.getSneaker(sneakerCount);
      expect(sneaker.price).to.equal(tokenPrice);

      await expect(
        nftMarketplace.connect(acc2).modifySneakerPrice(newTokenPrice, tokenId)
      ).to.be.revertedWith(contractErrors.insufficientPermission);
    });
  });
});
