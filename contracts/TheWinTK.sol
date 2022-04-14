// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "hardhat/console.sol";

contract TheWinTK is ERC20, Ownable {
    using SafeMath for uint256;

    mapping(address => bool) private _blacklist;
    address private _treasury;

    event BlackList(address _address, bool isBlocked);

    constructor() ERC20("TheWinTK", "TTK") {
        _treasury = _msgSender();
        _mint(_msgSender(), 10000 * 10 ** decimals());
    }

    function mint(address _to, uint256 _amount)
        public
        notBlackListed
        onlyOwner
    {
        _mint(_to, _amount);
    }

    function burn(address _from, uint256 _amount)
        public
        notBlackListed
        onlyOwner
    {
        _burn(_from, _amount);
    }

    function addToBlackList(address _address) public onlyOwner {
        console.log("before require");
        require(!_blacklist[_address], "already in blacklist");
        console.log("add to black list");
        _blacklist[_address] = true;
        emit BlackList(_address, _blacklist[_address]);
    }

    function removeFromBlackList(address _address) public onlyOwner {
        require(_blacklist[_address], "already in whitelist");
        _blacklist[_address] = false;
        emit BlackList(_address, _blacklist[_address]);
    }

    function transfer(address to, uint256 amount)
        public
        virtual
        override
        notBlackListed
        returns (bool)
    {
        console.log("amount: %s", amount);
        uint256 treasuryAmount = amount.mul(5).div(100);
        _treasuryBonus(treasuryAmount);
        return super.transfer(to, amount.sub(treasuryAmount));
    }

    function _treasuryBonus(uint256 amount) internal virtual {
        super.transfer(_treasury, amount);
    }

    function isInBlackList(address _address) public view returns (bool) {
        return _blacklist[_address];
    }

    modifier notBlackListed() {
        require(!_blacklist[_msgSender()], "sender is in blacklist");
        _;
    }
}