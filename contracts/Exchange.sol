// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.0;

import "hardhat/console.sol";
import "./Token.sol";

contract Exchange {
    address public feeAccount;
    uint256 public feePercent;
    mapping(address => mapping(address => uint256)) public tokens;
    mapping(uint256 => _Order) public orders;
    uint256 public orderCount;
    mapping(uint256 => bool) public orderCancelled;
    mapping(uint256 => bool) public orderFilled;


    event Deposit(
    	address token,
    	address user,
    	uint256 amount,
    	uint256 balance
    );

    event Withdraw(
        address token,
        address user,
        uint256 amount,
        uint256 balance
    );

    event Order(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );

     event Cancel(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        uint256 timestamp
    );

      event Trade(
        uint256 id,
        address user,
        address tokenGet,
        uint256 amountGet,
        address tokenGive,
        uint256 amountGive,
        address creator,
        uint256 timestamp
    );

    struct _Order{
    	uint256 id;
    	address user;
    	address tokenGet;
    	uint256 amountGet;
    	address tokenGive;
    	uint256 amountGive;
    	uint256 timestamp;
    }

    constructor(address _feeAccount, uint256 _feePercent) {
        feeAccount = _feeAccount;
        feePercent = _feePercent;
    }


    // ------------------------
    // DEPOSIT & WITHDRAW TOKEN

    function depositToken(address _token, uint256 _amount) public {
        // Transfer tokens to exchange
        require(Token(_token).transferFrom(msg.sender, address(this), _amount));

        // Update user balance
        tokens[_token][msg.sender] = tokens[_token][msg.sender] + _amount;

        // Emit an event
        emit Deposit(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function withdrawToken(address _token, uint256 _amount) public {
        // Ensure user has enough tokens to withdraw
        require(tokens[_token][msg.sender] >= _amount);

        // Transfer tokens to user
        Token(_token).transfer(msg.sender, _amount);

        // Update user balance
        tokens[_token][msg.sender] = tokens[_token][msg.sender] - _amount;

        // Emit event
        emit Withdraw(_token, msg.sender, _amount, tokens[_token][msg.sender]);
    }

    function balanceOf(address _token, address _user)
        public
        view
        returns (uint256)
    {
        return tokens[_token][_user];
    }

    //------------
	// make & cancel orders
	// Token give (the token they want to spend) - which token, and how much?
	// Token get  (the token they want to receive) - which token, and how much?
	function makeOrder(
		address _tokenGet,
		uint256 _amountGet,
		address _tokenGive,
		uint256 _amountGive
	) public {
		//require token balance
		require(balanceOf(_tokenGive, msg.sender) >= _amountGive);
		//instantiate new order
		orderCount ++;
		orders[orderCount] = _Order(
			orderCount,
			msg.sender,
			_tokenGet,
			_amountGet,
			_tokenGive,
			_amountGive,
			block.timestamp
		);
		// emit event 
		emit Order(	
			orderCount,
			msg.sender,
			_tokenGet,
			_amountGet,
			_tokenGive,
			_amountGive,
			block.timestamp
		);
 	}

 	function cancelOrder(uint256 _id) public {
 		_Order storage _order = orders[_id];

 		require(address(_order.user) == msg.sender); 

 		require(_order.id == _id); 

		orderCancelled[_id] = true;

 		emit Cancel(
 			_order.id,
 			msg.sender,
 			_order.tokenGet,
 			_order.amountGet,
 			_order.tokenGive,
 			_order.amountGive,
 			block.timestamp
 		);
 	}

 	function fillOrder(uint256 _id) public {
 		// must be a valid order
 		require(_id > 0 && _id <= orderCount, "Order does not exist");

 		// order cant be filled
 		require(!orderFilled[_id]);

 		// order cant be cancelled
 		require(!orderCancelled[_id]);


 		// fetch order
 		_Order storage _order = orders[_id];

 		// execute the trade
 		_trade(
 			_order.id,
 			_order.user,
 			_order.tokenGet,
 			_order.amountGet,
 			_order.tokenGive,
 			_order.amountGive
 			);

 		// Mark order as filled
 		orderFilled[_order.id] = true; 
 	}

 	function _trade(
 		uint256 _orderId,
 		address _user,
 		address _tokenGet,
 		uint256 _amountGet,
 		address _tokenGive,
 		uint256 _amountGive
 		) internal {

 		uint256 _feeAmount = (_amountGet * feePercent) / 100;   


 		tokens[_tokenGet][msg.sender] = tokens[_tokenGet][msg.sender] - (_amountGet + _feeAmount); 
 		tokens[_tokenGet][_user] = tokens[_tokenGet][_user] + _amountGet; 


 		tokens[_tokenGet][feeAccount] = tokens[_tokenGet][feeAccount] + _feeAmount; 


 		tokens[_tokenGive][_user] = tokens[_tokenGive][_user] - _amountGive;
 		tokens[_tokenGive][msg.sender] = tokens[_tokenGive][msg.sender] + _amountGive;


 		emit Trade(
 			_orderId,
 			msg.sender,
 			_tokenGet,
 			_amountGet,
 			_tokenGive,
 			_amountGive,
 			_user,
 			block.timestamp
 		);
 	}
}
