//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/ERC721Upgradeable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC721/extensions/ERC721URIStorageUpgradeable.sol";
import "@openzeppelin/contracts-upgradeable/utils/math/SafeMathUpgradeable.sol";
import "../interfaces/IERC721Base.sol";
import "../interfaces/IERC20Base.sol";
import "../interfaces/IERC721Factory.sol";

contract ERC721Base is
Initializable,
ERC721Upgradeable,
ERC721URIStorageUpgradeable {

    using SafeMathUpgradeable for uint256;

    address private _factory;
    address[] private deployedERC20Tokens;

    event NFTminted(
        address owner,
        string name,
        string symbol,
        address factory
    );

    event TokenCreated(
        string name,
        string symbol,
        address owner,
        address erc721address_,
        address newERC20Address,
        uint256 maxSupply_,
        uint256 initialSupply_
    );

    modifier onlyNFTOwner() {
        require(msg.sender == ownerOf(1), "Not the NFT owner!");
        _;
    }

    modifier onlyFactory() {
        require(msg.sender == _factory, "Not the Factory address!");
        _;
    }

    // ONLY FACTORY
    function initialize(
        address owner,
        address factory,
        string memory name_,
        string memory symbol_,
        string memory _tokenURI
    ) external initializer returns (bool) {
        require(owner != address(0), "Invalid NFT owner: zero address not valid!");

        __ERC721_init(name_, symbol_);
        __ERC721URIStorage_init();
        _factory = factory;

        require(msg.sender == _factory, "Not the Factory address!");

        _safeMint(owner, 1);
        _setTokenURI(1, _tokenURI);

        emit NFTminted(owner, name_, symbol_, _factory);
        return true;
    }

    // function called only directly by the NFT owner and not by any contract.
    function createDataToken(
        string calldata name,
        string calldata symbol,
    //address owner, // should be already msg.sender.
    //address erc721address_, // it is the NFT contract that is calling the factory function. So it will be msg.sender on the other side
        uint256 maxSupply_
    ) external onlyNFTOwner returns (address erc20token) {
        require(maxSupply_ > 0, "Cap and initial supply not valid");
        // already checked by the onlyNFTOwner modifier
        // require(msg.sender != address(0), "ERC721Base: Minter cannot be address(0)");

        erc20token = IERC721Factory(_factory).deployERC20Contract(
            name,
            symbol,
            msg.sender, // == new DT owner = NFTowner
            address(this),
            maxSupply_,
            false
        );
        deployedERC20Tokens.push(erc20token);
        emit TokenCreated(name, symbol, msg.sender, address(this), erc20token, 0, maxSupply_);
    }

    function getNFTowner() external view returns (address owner) {
        return ownerOf(1);
    }

    function getDTaddresses() external view returns (address[] memory) {
        return deployedERC20Tokens;
    }

    function addNewErc20token(address erc20token) external onlyFactory {
        deployedERC20Tokens.push(erc20token);
    }

    // The following functions are overrides required by Solidity.
    function burn(uint256 tokenId) external onlyNFTOwner {
        _burn(tokenId);
    }


    function _burn(uint256 tokenId) internal override(ERC721URIStorageUpgradeable, ERC721Upgradeable) onlyNFTOwner {
        super._burn(tokenId);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override(ERC721URIStorageUpgradeable, ERC721Upgradeable) returns (bool) {
        return super.supportsInterface(interfaceId);
    }

    function balanceOf(address caller) public view override(ERC721Upgradeable, IERC721Upgradeable) returns (uint256) {
        return super.balanceOf(caller);
    }

    function tokenURI(uint256 tokenId) public view override(ERC721URIStorageUpgradeable, ERC721Upgradeable) returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function getTokenURI(uint256 tokenId) external view returns (string memory)
    {
        return tokenURI(tokenId);
    }

    /*   // https://solidity-by-example.org/signature/
      function splitSignature(
          bytes memory sig
      ) internal pure returns (bytes32 r, bytes32 s, uint8 v) {
          require(sig.length == 65, "invalid signature length");

          assembly {

              //First 32 bytes stores the length of the signature
              //add(sig, 32) = pointer of sig + 32
              //effectively, skips first 32 bytes of signature
              //mload(p) loads next 32 bytes starting at the memory address p into memory


              // first 32 bytes, after the length prefix
              r := mload(add(sig, 32))
              // second 32 bytes
              s := mload(add(sig, 64))
              // final byte (first byte of the next 32 bytes)
              v := byte(0, mload(add(sig, 96)))
          }
      }
   */
    /**
     * @dev fallback function
     *      this is a default fallback function in which receives
     *      the collected ether.
     */
    fallback() external payable {}

    /**
     * @dev receive function
     *      this is a default receive function in which receives
     *      the collected ether.
     */
    receive() external payable {}
}