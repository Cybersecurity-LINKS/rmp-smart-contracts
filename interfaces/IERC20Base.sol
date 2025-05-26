//SPDX-License-Identifier: Apache-2.0

// Copyright 2025 Fondazione LINKS

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

//     http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

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