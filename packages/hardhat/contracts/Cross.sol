//SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;


// Importing required contracts and libraries from OpenZeppelin
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title Cross
 * @dev An NFT smart contract that mints tokens to users for bridging tokens between Ethereum and Optimism using the Cross Dapp.
 * @dev Includes ERC721URIStorage, Ownable, and Pausable functionality from OpenZeppelin.
 * @author Chijoke.eth
 */

contract Cross is ERC721URIStorage, Ownable, Pausable {
    using Counters for Counters.Counter;

    // Tracks the number of tokens minted
    Counters.Counter private _tokenIds;

    // The bridge fee
    uint8 private constant _bridgeFee = 20; // 5% when bridgeValue / 20


    // The total value of bridges crossed by each address
    mapping (address => uint256) private _totalBridgeValue;

    // Token struct
    struct Token {
        uint256 id;
        uint256 bridgeValue;
        string rarity;
        string uri;
    }
     
    // stuct of rarity threshold and corresponding supply
    struct Rarity {
        string _rarity; 
        uint256 _rarityThreshold;
        uint256 _maxSupply; 
        uint256 _raritySupply; 
    }

    // Mapping of token IDs to their Token struct
    mapping (uint256 => Token) private _tokens;

    // Mapping of rarity index to rarity struct
    Rarity[] private _rarities;
    // Event that is emitted when a token is minted

    event TokenMinted(address indexed owner, uint256 indexed tokenId, uint256 bridgeValue, string rarityName);

    // Event that is emitted when a token is burned
    event TokenBurned(uint256 indexed tokenId);

    
    /**
    * @dev Constructor for Cross contract..
    */
    constructor() ERC721("Cross", "CROSS") {
       // Initialize rarity thresholds
        _rarities.push(Rarity("Classic", 10000000000000000 wei, 10000000, 0)); // 0.01
        _rarities.push(Rarity("Epic", 100000000000000000 wei, 100000, 0)); // 0.1
        _rarities.push(Rarity("Legend", 1000000000000000000 wei, 10000, 0)); // 1
        _rarities.push(Rarity("Ultimate", 10000000000000000000 wei, 1000, 0)); //10
        _rarities.push(Rarity("Mythical", 100000000000000000000 wei, 100, 0)); // 100
    }

    /**
    * @dev Adds a new rarity level to the contract.
    * @param rarity The name of the new rarity level.
    * @param threshold The percentage of total bridge value required to reach this rarity level.
    * @param maxSupply The maximum number of tokens that can be minted at this rarity level.
    */
    function addRarity(string memory rarity, uint256 threshold, uint256 maxSupply) external onlyOwner {
        _rarities.push(Rarity(rarity, threshold, maxSupply, 0));
    }

    /**
    * @dev Remove a rarity level from the contract.
    * @param index The index of the rarity level to remove.
    */
    function removeRarity(uint256 index) external onlyOwner {
        require(index < _rarities.length, "Cross: invalid rarity index");

        // Move the last element to the index to delete and then remove the last element
        _rarities[index] = _rarities[_rarities.length - 1];
        _rarities.pop();
    }
    
    /**
    * @dev Mint a new NFT.
    * @param bridgeValue_ The bridge value of the NFT.
    * @param uri The token metadata URI.
    * @return newItemId The ID of the newly minted NFT.
    */
    function mint(uint256 bridgeValue_, string memory uri) public payable whenNotPaused returns (uint256 newItemId) {
    // Calculate bridge fee as 5% of bridge value
    uint256 bridgeFee = bridgeValue_ / _bridgeFee;
    require(msg.value >= bridgeFee, "Cross: insufficient fee amount");

    // Determine the rarity of the token to be minted for the bridgeValue
    string memory rarity = "Classic";
    uint256 i;
    for (i =  _rarities.length - 1; i >= 0; i--) {
        if (bridgeValue_ >= _rarities[i]._rarityThreshold) {
            rarity = _rarities[i]._rarity;
            break;
        }
    }
    require(_rarities[i]._raritySupply < _rarities[i]._maxSupply, "Cross: maximum token supply for this rarity has been reached");
    _rarities[i]._raritySupply++;

    // Update senders total bridged tokens
    _totalBridgeValue[msg.sender] += bridgeValue_;

    _tokenIds.increment();
    newItemId = _tokenIds.current();

    _tokens[newItemId] = Token(newItemId, bridgeValue_, rarity, uri);

    emit TokenMinted(msg.sender, newItemId, bridgeValue_, rarity);

    _safeMint(msg.sender, newItemId);
    _setTokenURI(newItemId, uri);
    return newItemId;
    }

    /**
    * @dev Get the bridge value of an existing NFT.
    * @param tokenId The ID of the NFT to get the bridge value of.
    *  @return The bridge value of the NFT.
    */
        function getBridgeValue(uint256 tokenId) public view returns (uint256) {
            require(_exists(tokenId), "Cross: tokenId does not exist");
            return _tokens[tokenId].bridgeValue;
        }

    /**
    * @dev Get the rarity of an existing NFT.
    * @param tokenId The ID of the NFT to get the rarity of.
    * @return rarity of the NFT.
    */
    function getRarity(uint256 tokenId) public view returns (string memory) {
        require(_exists(tokenId), "Cross: tokenId does not exist");
        return _tokens[tokenId].rarity;
    }


    /**
    * @dev Get the rarity supply of a rarity class.
    * @param rarityName The name of the rarity class to get supply.
    * @return maxSupply  total possible tokens of the rarity class.
    * @return raritySupply  total minted tokens of the rarity class.
    */
    function getRaritySupply(string memory rarityName) public view returns (uint256 maxSupply, uint256 raritySupply) {
        for (uint256 i = 0; i < _rarities.length; i++) {
            if (keccak256(abi.encodePacked(_rarities[i]._rarity)) == keccak256(abi.encodePacked(rarityName))) {
                return (_rarities[i]._maxSupply, _rarities[i]._raritySupply);
            }
        }
        revert("Cross: Rarity not found");
    }

    /**
    * @dev Get all tokens minted in the contract.
    * @return tokens An array of Token structs.
    */
    function getAllTokens() external view returns (Token[] memory tokens) {
        tokens = new Token[](_tokenIds.current());
        for (uint256 i = 0; i < _tokenIds.current(); i++) {
            tokens[i] = _tokens[i + 1];
        }
    }

    /**
    * @dev Burn an existing NFT.
    * @param tokenId The ID of the NFT to burn.
    */
    function burn(uint256 tokenId) public virtual {
        require(_exists(tokenId), "Cross: token does not exist");
        require(ownerOf(tokenId) == msg.sender, "Cross: caller is not owner of token");
        _burn(tokenId);
        emit TokenBurned(tokenId);
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