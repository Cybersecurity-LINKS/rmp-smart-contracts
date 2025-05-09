// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

// source https://github.com/OpenZeppelin/openzeppelin-sdk/blob/71c9ad77e0326db079e6a643eca8568ab316d4a9/packages/lib/contracts/upgradeability/ProxyFactory.sol

/**
 * @title Deployer Contract
 *
 * @dev Contract Deployer
 *      This contract allows factory contract
 *      to deploy new contract instances using
 *      the same library pattern in solidity.
 *      the logic it self is deployed only once, but
 *      executed in the context of the new storage 
 *      contract (new contract instance)
 */
contract Deployer {

    event InstanceDeployed(address instance);

    // /**
    //  * @dev deploy
    //  *      deploy new contract instance
    //  * @param _logic the logic contract address
    //  * @return  address of the new instance
    //  */
    function deploy(
        address _logic
    ) public returns (address instance) {

        // Adapted from https://github.com/optionality/clone-factory/blob/32782f82dfc5a00d103a7e61a17a5dedbd1e8e9d/contracts/CloneFactory.sol
        bytes20 targetBytes = bytes20(_logic);
        assembly {
            let clone := mload(0x40)
            mstore(clone, 0x3d602d80600a3d3981f3363d3d373d3d3d363d73000000000000000000000000)
            mstore(add(clone, 0x14), targetBytes)
            mstore(add(clone, 0x28), 0x5af43d82803e903d91602b57fd5bf30000000000000000000000000000000000)
            instance := create(0, clone, 0x37)
        }
        emit InstanceDeployed(address(instance));
    }
}