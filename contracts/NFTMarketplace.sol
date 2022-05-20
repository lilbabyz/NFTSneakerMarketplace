// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

import "hardhat/console.sol";

contract NFTMarketplace {
    uint256 public sneakerCount = 0;
// declaring a struct for the sneaker
    struct Sneaker {
        IERC721 nft;
        uint256 tokenId;
        uint256 price;
        address payable seller;
        bool sold;
        bool forSale;
    }

    mapping(uint256 => Sneaker) public sneakers;
    

    // this function will add a new sneaker to the marketplace 
    function listSneaker(IERC721 _nft, uint256 _tokenId, uint256 _price
    ) external {
        require(_price > 0, "NFTMarketplace: Price should be above zero");
        sneakerCount++;
        _nft.transferFrom(msg.sender, address(this), _tokenId);
        sneakers[sneakerCount] = Sneaker(
            _nft,
            _tokenId,
            _price,
            payable(msg.sender),
            false,
            true

        );
    }
  // this function will facilitate the buying of a sneaker nft when called
    function buySneaker(uint256 _tokenId) external payable {
        Sneaker storage sneaker = sneakers[_tokenId];
        require(sneaker.forSale == true, "this  sneaker is not for sale");
        require(_tokenId > 0 && _tokenId <= sneakerCount,
        "NFTMarketplace: sneaker doesn't exist"
        );
        require(msg.value >= sneaker.price,
            "NFTMarketplace: not enough balance"
        );
        require(!sneaker.sold, "NFTMarketplace: sneaker already sold");
        sneaker.seller.transfer(sneaker.price);
        sneaker.sold = true;
        sneaker.nft.transferFrom(address(this), msg.sender, sneaker.tokenId);
    }


  // this function will get a sneaker listing from the mapping list
    function getSneaker(uint256 _tokenId) public view returns (Sneaker memory) {
        return sneakers[_tokenId];
    }


// this function will set the sneaker listing to not for sale and only the owner can do that
  function toggleForSale(uint256 _tokenId) public {
      Sneaker storage sneaker = sneakers[_tokenId];
    require(msg.sender != address(0));
    require(sneaker.seller == msg.sender);
    
    // if token's forSale is false make it true and vice versa
    if(sneaker.forSale) {
      sneaker.forSale = false;
    } else {
      sneaker.forSale = true;
    }
  }
// this function will facilitate the changing of the price of a sneaker by the owner
    function modifySneakerPrice(uint256 _sneakerPrice, uint256 _tokenId)
        public
        payable
    {
        require(
            sneakers[_tokenId].seller == msg.sender,
            "NFTMarketplace: Can't perform transaction"
        );
        sneakers[_tokenId].price = _sneakerPrice;
    }


   


  // this function will get the total number of sneaker in the marketplace
    function getSneakerCount() public view returns (uint256) {
        return sneakerCount;
    }
}
