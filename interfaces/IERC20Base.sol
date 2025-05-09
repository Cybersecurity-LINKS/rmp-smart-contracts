//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

/**
 * @dev Required interface of an ERC20 compliant contract.
 */
interface IERC20Base {

    function initialize(
        string memory name_,
        string memory symbol_,
        address owner_, // minter = DT owner = NFT owner
        address erc721address_,
        address factory_,
        uint256 maxSupply_
    ) external returns (bool);

    function isMinter(address isminter) external view returns (bool);

    function mint(address to, uint256 amount) external;

    function balanceOf(address caller) external view returns (uint256);

    function allowance(address owner, address spender) external view returns (uint256);

    function burn(uint256 amount) external;

    function getERC721() external view returns (address);

    function getDTName() external view returns (string memory);


    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) external returns (bool);

    function allInOne_approve(
        address owner,
        address spender,
        uint256 amount
    ) external;
}