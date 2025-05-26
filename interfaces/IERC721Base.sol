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