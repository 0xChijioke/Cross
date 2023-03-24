//SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;


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

    // Maps token IDs to bridge values
    mapping (uint256 => uint256) private _bridgeValues;

    // Maps token IDs to rarity values
    mapping (uint256 => uint8) private _rarityValues;

    // Maps rarity values to token supply
    mapping (uint8 => uint256) private _raritySupply;

    // Array of rarity thresholds
    uint8[] private _rarityThresholds;

    // The base URI for token metadata
    string private immutable _baseTokenURI;

    // The maximum token supply for rare NFTs
    uint256 private immutable _maxSupply;

    // The minimum bridge value for fee exemption
    uint256 private immutable _feeThreshold;

    // Event that is emitted when a token is minted
    event TokenMinted(address indexed owner, uint256 indexed tokenId, uint256 bridgeValue, uint8 rarityValue);

    // Event that is emitted when a token is burned


    
    /**
    * @dev Constructor for Cross contract.
    * @param name The name of the NFT.
    * @param symbol The symbol of the NFT.
    * @param baseTokenURI The base URI for token metadata.
    * @param maxSupply The maximum token supply for rare NFTs.
    * @param feeThreshold The minimum bridge value for fee exemption.
    * @param feeExemptionRarity The rarity value of fee-exempt NFTs.
    * @param bridgeFee The fee charged for bridging.
    */
    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        uint256 maxSupply,
        uint256 feeThreshold,
        uint256 feeExemptionRarity,
        uint256 bridgeFee
    ) ERC721(name, symbol) {
        _baseTokenURI = baseTokenURI;
        _maxSupply = maxSupply;
        _feeThreshold = feeThreshold;
        _feeExemptionRarity = feeExemptionRarity;
        _bridgeFee = bridgeFee;
    }
    
    /**
    * @dev Mint a new NFT.
    * @param to_ The address to mint the new NFT to.
    * @param bridgeValue_ The bridge value of the NFT.
    * @return newItemId The ID of the newly minted NFT.
    */
    function mint(address to_, uint256 bridgeValue_) public payable whenNotPaused returns (uint256 newItemId) {
    // Require bridge value to be greater than or equal to the bridge fee
    require(bridgeValue_ >= _bridgeFee, "Cross: bridge value must be greater than fee");
    // Require payment of bridge fee
    require(msg.value >= _bridgeFee, "Cross: insufficient fee amount");
    // Require maximum token supply not to be reached
    require(_tokenIds.current() < _maxSupply, "Cross: maximum token supply reached");

    // Increment token ID
    _tokenIds.increment();
    uint256 newItemId = _tokenIds.current();

    // Set token URI
    _setTokenURI(newItemId, string(abi.encodePacked(_baseTokenURI, newItemId.toString())));

    // Set bridge value
    _bridgeValue[newItemId] = bridgeValue_;

    // Determine rarity
    uint256 rarity;
    if (bridgeValue_ >= _feeThreshold) {
        rarity = _feeExemptionRarity;
        _feeExemptionSupply++;
    } else {
        rarity = 1;
    }
    _rarity[newItemId] = rarity;
    _supply[rarity]++;

    // Mint token to recipient
    _mint(to_, newItemId);

    // Return token ID
    return newItemId;
    }

    /**
    * @dev Burn an existing NFT.
    * @param tokenId The ID of the NFT to burn.
    */
    function burn(uint256 tokenId) public virtual override onlyOwner {
    // Delete bridge value
    delete _bridgeValue[tokenId];

    // Delete rarity and supply
    uint256 rarity = _rarity[tokenId];
    delete _rarity[tokenId];
    _supply[rarity]--;

    // Burn token
    _burn(tokenId);
    }

    /**
    * @dev Get the bridge value of an existing NFT.
    * @param tokenId The ID of the NFT to get the bridge value of.
    *  @return The bridge value of the NFT.
    */
        function getBridgeValue(uint256 tokenId) public view returns (uint256) {
        return _bridgeValue[tokenId];
        }

    /**
    * @dev Get the rarity of an existing NFT.
    * @param tokenId The ID of the NFT to get the rarity of.
    * @return The rarity of the NFT.
    */
    function getRarity(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Cross: tokenId does not exist");
        return _rarity[tokenId];
    }

    /**
    * @dev Gets the bridge value of a token.
    * @param tokenId The ID of the token to get the bridge value of.
    * @return The bridge value of the token.
    */
    function getBridgeValue(uint256 tokenId) external view returns (uint256) {
        return _bridgeValue[tokenId];
    }

    
    function setBaseTokenURI(string memory baseURI_) public onlyOwner {
        _baseTokenURI = baseURI_;
    }

    function setMaxSupply(uint256 maxSupply_) public onlyOwner {
        require(maxSupply_ >= _tokenIds.current(), "BridgedNFT: cannot set max supply below current token count");
        _maxSupply = maxSupply_;
    }

    function setFeeThreshold(uint256 feeThreshold_) public onlyOwner {
        require(feeThreshold_ > 0, "BridgedNFT: fee threshold must be greater than zero");
        _feeThreshold = feeThreshold_;
    }

    function setFeeExemptionSupply(uint256 feeExemptionSupply_) public onlyOwner {
        _feeExemptionSupply = feeExemptionSupply_;
    }

    function setFeeExemptionRarity(uint256 feeExemptionRarity_) public onlyOwner {
        _feeExemptionRarity = feeExemptionRarity_;
    }

    function setBridgeFee(uint256 bridgeFee_) public onlyOwner {
        _bridgeFee = bridgeFee_;
    }

    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        payable(msg.sender).transfer(balance);
    }

    function pause() public onlyOwner {
        _pause();
    }

    function unpause() public onlyOwner {
        _unpause();
    }
}