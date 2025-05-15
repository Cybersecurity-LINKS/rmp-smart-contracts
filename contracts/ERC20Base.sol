//SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.18;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "../interfaces/IERC721Base.sol";
import "../interfaces/IERC20Base.sol";

contract ERC20Base is
Initializable,
ERC20Upgradeable,
IERC20Base {


    address private _factory;
    address private _erc721address;
    address private _owner;
    uint256 private _maxSupply;

    mapping(address => bool) private _allowedMinters;
    mapping(address => uint256) public nonces_;

    event InitializedDT(string name, string symbol, address owner, address erc721address);
    event Permit(address recoveredAddress, address owner, address spender, uint256 amount);
    event PermitData(bytes32 domain_separator, bytes32 permit_gasg, bytes32 digest);

    modifier onlyOwner() {
        require(msg.sender == _owner);
        _;
    }

    modifier onlyFactory() {
        require(msg.sender == _factory, "Not the Factory address!");
        _;
    }

    // ONLY FACTORY
    function initialize(
        string memory name_,
        string memory symbol_,
        address owner_, // minter = DT owner = NFT owner
        address erc721address_,
        address factory_,
        uint256 maxSupply_
    ) external initializer returns (bool){
        require(owner_ != address(0), "Minter cannot be 0x00!");
        require(owner_ == IERC721Base(erc721address_).getNFTowner(), "NOT THE NFT OWNER");
        require(
            erc721address_ != address(0),
            "ERC721Factory address cannot be 0x00!"
        );
        require(maxSupply_ > 0, "The maximum supply must be > 0");

        __ERC20_init(name_, symbol_);
        _erc721address = erc721address_;
        _owner = owner_;
        _factory = factory_;

        require(msg.sender == _factory, "Not the Factory address!");

        _maxSupply = maxSupply_;
        /**
         * ERC20 tokens have 18 decimals => Number of tokens minted = n * 10^18
         * This way the decimals are transparent to the clients.
         */
        nonces_[_owner] = 0;
        _addMinter(factory_);
        mint(owner_, _maxSupply);
        _removeMinter(factory_);
        emit InitializedDT(name_, symbol_, owner_, _erc721address);
        return true;
    }

    function _addMinter(address newminter) internal {
        _allowedMinters[newminter] = true;
    }

    function isAllowedMinter(address isminter) internal view returns (bool) {
        return _allowedMinters[isminter];
    }

    function isMinter(address isminter) external view returns (bool) {
        return isAllowedMinter(isminter);
    }

    function _removeMinter(address minter) internal {
        _allowedMinters[minter] = false;
    }

    // Approve that can be called only from the factory. This allows to do "all in one" publish. 
    // So the the DT-NFT owner address has to be passed when the factory calls this.
    function allInOne_approve(address owner, address spender, uint256 amount) external onlyFactory {
        _approve(owner, spender, amount);
    }

    function mint(address to, uint256 amount) public {
        require(msg.sender == _owner || isAllowedMinter(msg.sender), "NOT ALLOWED TO MINT DTs");
        require(totalSupply() + amount <= _maxSupply, "Cannot exceed the cap");
        _mint(to, amount);
    }

    function getDTowner() external view returns (address) {
        return _owner;
    }

    function getMaxSupply() external view returns (uint256) {
        return _maxSupply;
    }

    function getERC721() external view returns (address) {
        return _erc721address;
    }

    function balanceOf(address caller) public view override(ERC20Upgradeable, IERC20Base) returns (uint256) {
        return super.balanceOf(caller);
    }

    function allowance(address owner, address spender) public view override(ERC20Upgradeable, IERC20Base) returns (uint256) {
        return super.allowance(owner, spender);
    }

    function transfer(address to, uint256 amount) public override returns (bool) {
        return super.transfer(to, amount);
    }

    function totalSupply() public view override returns (uint256) {
        return super.totalSupply();
    }

    function getDTName() external view returns (string memory) {
        return name();
    }

    function name() public view override(ERC20Upgradeable) returns (string memory) {
        return super.name();
    }

    function transferFrom(
        address from,
        address to,
        uint256 amount
    ) public override(ERC20Upgradeable, IERC20Base) returns (bool){
        return super.transferFrom(from, to, amount);
    }

    /**
    * Allow the (NFT owner/DT owner) of the contract to withdraw SMR
    */
    function withdraw() public onlyOwner {
        require(address(this).balance > 0, "No balance to withdraw");
        (bool sent,) = msg.sender.call{value: address(this).balance}("");
        require(sent, "Failed to withdraw");
    }

    function burn(uint256 amount) external {
        _burn(msg.sender, amount);
    }

    /*
        Support for EIP-2612 
        https://eips.ethereum.org/EIPS/eip-2612
        https://soliditydeveloper.com/erc20-permit
    */

    function DOMAIN_SEPARATOR() internal view returns (bytes32) {
        uint256 chainId;
        assembly {
            chainId := chainid()
        }
        (bytes32 domain) = keccak256(
            abi.encode(
                keccak256(
                    "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
                ),
                keccak256(bytes(name())),
                keccak256(bytes("1")), // version, could be any other value
                chainId,
                address(this)
            )
        );
        return domain;
    }

    function permit(address owner, address spender, uint256 value) external {
        require(owner == IERC721Base(_erc721address).getNFTowner(), "Owner: not the NFT owner");
        uint256 nonceBefore = nonces_[owner];
        nonces_[owner] += 1;
        require(nonces_[owner] == nonceBefore + 1, "ERC20Base: permit did not succeed. Nonce mismatch!");
        _approve(owner, spender, value);
    }

    function nonces(address requester) external view returns (uint256) {
        return nonces_[requester];
    }

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