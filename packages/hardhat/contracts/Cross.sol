//SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;


// Importing required contracts and libraries from OpenZeppelin
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title Cross
 * @dev An NFT smart contract that allows the deposit and withdrawal of tokens from Ethereum and Optimism.
 * @dev Includes ERC721URIStorage, Ownable, and Pausable functionality from OpenZeppelin.
 * @author Chijoke.eth
 */

contract Cross is ERC721URIStorage, Ownable, Pausable {
    using Counters for Counters.Counter;

    // Tracks the number of tokens minted
    Counters.Counter private _tokenIds;

    // The bridge fee
    uint256 private _bridgeFee;

    // The base URI for token metadata
    string private _baseTokenURI; // "https://gateway.pinata.cloud/ipfs/";

    // The total value of bridges crossed by each address
    mapping (address => uint256) private _totalBridgeValue;

    // Token struct
    struct Token {
        uint256 bridgeValue;
        uint8 rarity;
        string uri;
    }
        
    // Mapping of token IDs to their Token struct
    mapping (uint256 => Token) private _tokens;


    // stuct of rarity threshold and corresponding supply
    struct Rarity {
        string _rarity; // Classic, Epic, Legend, Ultimate... etc
        uint8 _rarityThreshold; // 0.05 ether, 0.1 ether, 0.5 ether, 1 ether.. etc
        uint256 _raritySupply; // 10000000, 100000, 10000, 1000
        uint256 _maxSupply; // running supply
    }

    // The rarity thresholds and corresponding supplies
    Rarity[] private _rarities;

    // Event that is emitted when a token is minted
    event TokenMinted(address indexed owner, uint256 indexed tokenId, uint256 bridgeValue, uint8 rarityName);

    // Event that is emitted when a token is burned
    event TokenBurned(uint256 indexed tokenId);

    
    /**
    * @dev Constructor for Cross contract.
    * @param baseTokenURI The base URI for token metadata.
    * @param bridgeFee The fee charged for bridging.
    */
    constructor(
        string memory baseTokenURI,
        uint256 bridgeFee
    ) ERC721("Cross", "CROSS") {
        _baseTokenURI = baseTokenURI;
        _bridgeFee = bridgeFee;

       // Initialize rarity thresholds
        _rarities.push(Rarity("Classic", 1, 10000000));
        _rarities.push(Rarity("Epic", 2, 100000));
        _rarities.push(Rarity("Legend", 3, 10000));
        _rarities.push(Rarity("Ultimate", 4, 1000)); 
        _rarities.push(Rarity("Crosset", 5, 100)); 
    }
    
    /**
    * @dev Mint a new NFT.
    * @param to_ The address to mint the new NFT to.
    * @param bridgeValue_ The bridge value of the NFT.
    * @param uri The token metadata URI.
    * @return newItemId The ID of the newly minted NFT.
    */
    function mint(uint256 bridgeValue_, string memory uri) public payable whenNotPaused returns (uint256 newItemId) {
    // Require payment of bridge fee
    require(msg.value >= _bridgeFee, "Cross: insufficient fee amount");

    
    uint8 rarity = 0;
    // determine the rarity of the token to be minted for the bridgeValue
    for (uint8 i = 0; i < _rarities.length; i++) {
        if (bridgeValue_ >= _rarities[i]._rarityThreshold * 1 ether) {
            rarity = i + 1;
            break;
        }
    }
    // Require maximum token supply for the rarity of the token not to be reached
    require(_rarities[rarity - 1]._maxSupply < _rarities[rarity - 1]._raritySupply, "Cross: maximum token supply for this rarity has been reached");

    // Update maximum token supply for the rarity of the token
    _rarities[rarity - 1]._maxSupply++;

    // Update senders total bridged tokens
    _totalBridgeValue[msg.sender] += bridgeValue_;

    // Increment token ID
    _tokenIds.increment();
    newItemId = _tokenIds.current();

    // Set token properties
    _tokens[newItemId] = Token(bridgeValue_, rarity, uri);

    // Emit token minted event
    emit TokenMinted(msg.sender, newItemId, bridgeValue_, rarity);

    // Mint token to recipient
    _safeMint(msg.sender, newItemId);
    // Set tokenURI
    _setTokenURI(newItemId, uri);
    // Update senders total bridged tokens
    _totalBridgeValue[msg.sender] += bridgeValue_;
    // Return token ID
    return newItemId;
    }


    /**
    * @dev function to get tokenURL here
    */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }


    /**
    * @dev Burn an existing NFT.
    * @param tokenId The ID of the NFT to burn.
    */
    function burn(uint256 tokenId) public virtual override {
        require(_exists(tokenId), "Cross: token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Cross: caller is not owner of token");

        // Burn token
        _burn(tokenId);

        // Emit event
        emit TokenBurned(tokenId);
    }

    /**
    * @dev Get the bridge value of an existing NFT.
    * @param tokenId The ID of the NFT to get the bridge value of.
    *  @return The bridge value of the NFT.
    */
        function getBridgeValue(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Cross: tokenId does not exist");
        return tokens[tokenId].bridgeValue;
        }

    /**
    * @dev Get the rarity of an existing NFT.
    * @param tokenId The ID of the NFT to get the rarity of.
    * @return The rarity of the NFT.
    */
    function getRarity(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Cross: tokenId does not exist");
        return tokens[tokenId].rarity;
    }


    /**
    * @dev Sets the base URI for token metadata.
    * @param baseURI_ The new base URI.
    */
        function setBaseTokenURI(string memory baseURI_) public onlyOwner {
            _baseTokenURI = baseURI_;
        }


    /**
    * @dev Sets the bridge fee for minting a token.
    * @param bridgeFee_ The new bridge fee.
    */
    function setBridgeFee(uint256 bridgeFee_) public onlyOwner {
        _bridgeFee = bridgeFee_;
    }

    /**
    * @dev Withdraws the balance of the contract to the owner.
    */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }

    /**
    * @dev Pauses the contract.
    */
    function pause() public onlyOwner {
        _pause();
    }

    /**
    * @dev Unpauses the contract.
    */
    function unpause() public onlyOwner {
        _unpause();
    }
}