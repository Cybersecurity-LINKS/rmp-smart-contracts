//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

/**
 * @dev Required interface of an ERC721 compliant contract.
 */
interface IERC721Base {
    event NFTminted(
        address owner,
        string name,
        string symbol,
        address factory
    );

    function initialize(
        address owner,
        address factory,
        string memory name_,
        string memory symbol_,
        string memory _tokenURI
    ) external returns (bool);

    function createDataToken(
        string calldata name,
        string calldata symbol,
    //address owner, // should be already msg.sender.
        address erc721address_, // it is the NFT contract that is calling the factory function. So it will be msg.sender on the other side
        uint256 maxSupply_
    ) external returns (address erc20token);

    function getNFTowner() external view returns (address owner);

    function addNewErc20token(address erc20token) external;

    function balanceOf(address caller) external view returns (uint256);

    function getTokenURI(uint256 tokenId) external view returns (string memory);
}