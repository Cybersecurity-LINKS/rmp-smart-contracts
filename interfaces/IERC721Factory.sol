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
interface IERC721Factory {

    function deployERC20Contract(
        string memory name_,
        string memory symbol_,
        address owner_, // minter = DT owner = NFT owner
        address erc721address_, // should be the calling NFT contract = msg.sender. Not true if "all in one"
        uint256 maxSupply_,
        bool is_form_all_inOne
    ) external returns (address erc20Instance);

    function createdERC20List(address erc20dt) external view returns (address);

    function eRC20_to_owner(address erc20dt) external view returns (address);

}