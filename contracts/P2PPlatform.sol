// SPDX-License-Identifier: MIT

pragma solidity ^0.8.14;

/**
* @dev Interface for Asset contract
*/
interface Asset {
    function TransferTokenByP2pPlatform( address) external;
}

contract P2PPlatform {

    /**
    * @dev Information and status about object by platform control
    */
    struct ControlledObject {
        address Owner;
        uint DateFrom;
        bool Status;
    }

    /**
    * @dev State of deals by object's
    */
    struct Deals {
        address Shopper;
        uint Price;
        uint DateDeal;
        uint DateTransaction;
        bool Status;
    }

    

    //Vars
    address _Administrator;
    address _Control;           //TODO
    mapping(address=>ControlledObject) _controlledObjects;
    mapping(address=>Deals) _deals;
    mapping(address=>address[]) _shoppers_deals;

    // Modifiers.
    modifier onlyAdmin() {
        require(msg.sender == _Administrator, "Only administrator can call this method.");
        _;
    }

    modifier onlyOwner(address controbject) {
        require( msg.sender == _controlledObjects[controbject].Owner , "Only owner can call this method.");
        _;
    }

    modifier onlyShopper(address controbject) {
        require( msg.sender == _deals[controbject].Shopper , "Only shopper can call this method.");
        _;
    }

    function removeShopperObject(address shopper, address object) internal {

        uint index;

        for(uint i = 0; i < _shoppers_deals[shopper].length-1; i++) {

            if(_shoppers_deals[shopper][i] == object) {
                index = i;
            }
        }

        for(uint i = index; i < _shoppers_deals[shopper].length-1; i++) {
            _shoppers_deals[shopper][i] = _shoppers_deals[shopper][i + 1];
        }

        _shoppers_deals[shopper].pop();

    }



    constructor (
        address admin,
        address control
    ) {
        _Administrator = admin;
        _Control = control;
    }



    function getObject( address object, address owner) public {

        _controlledObjects[object] = ControlledObject(owner, block.timestamp, true);

    }

    function setDeal(uint price, address object, address shopper) public onlyOwner(object) {
        require(!_deals[object].Status, "Offer no longer valid");
        _deals[object] = Deals(shopper, price, block.timestamp, 0, false);
        _shoppers_deals[shopper].push(object);
    }

    function getDeal(address object) public view returns(Deals memory) {
        return _deals[object];
    }

    function acceptDeal(address object) public payable onlyShopper(object) {
        require(msg.value == _deals[object].Price, "This method requred payment exactly with price");
        payable(_controlledObjects[object].Owner).transfer(_deals[object].Price);
        removeShopperObject(_deals[object].Shopper, object);
        _deals[object].DateTransaction = block.timestamp;
        _deals[object].Status = true;
        Asset _asset;
        _asset = Asset(object);
        _asset.TransferTokenByP2pPlatform(_deals[object].Shopper);
        _controlledObjects[object].Status = false;
        _controlledObjects[object].Owner = _deals[object].Shopper;
    }


    function myDeals() public view returns(address[] memory) {

        return _shoppers_deals[msg.sender];

    } 


}