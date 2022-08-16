const config = require('../src/config.json')

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), 'ether')
}


const wait = (seconds) => {
	const millieseconds = seconds * 1000
	return new Promise(resolve => setTimeout(resolve, millieseconds))
}

async function main() {

	// fetch accounts from wallet - these are unlocked
	const accounts = await ethers.getSigners()

	// fetch network
	const { chainId } = await ethers.provider.getNetwork()
	console.log("Using chainId: ", chainId)

	// fetch deployed tokens
	const gb = await ethers.getContractAt('Token', config[chainId].gb.address)
	console.log(`Green Bros Token fetched: ${gb.address}\n`)

	const mETH = await ethers.getContractAt('Token', config[chainId].mETH.address)
	console.log(`mETH Token fetched: ${mETH.address}\n`)

	const mDAI = await ethers.getContractAt('Token', config[chainId].mDAI.address)
	console.log(`mDAI Token fetched: ${mDAI.address}\n`)

	// fetch the deployed exchange
	const exchange = await ethers.getContractAt('Exchange',config[chainId].exchange.address)
	console.log(`Exchange fetched: ${exchange.address}\n`)

	// give tokens to account[1]
	const sender = accounts[0]
	const receiver = accounts[1]
	let amount = tokens(10000)

	// user1 transfers 10,000 mETH...
	let transaction, result
	transaction = await mETH.connect(sender).transfer(receiver.address, amount)
	console.log(`Transferred ${amount} tokens from ${sender.address} to ${receiver.address}\n`)

	//set up exchange users
	const user1 = accounts[0]
	const user2 = accounts[1]
	amount = tokens(10000)

	// user1 approves 10,000 GB tokens
	transaction = await gb.connect(user1).approve(exchange.address, amount)
	await transaction.wait()
	console.log(`Approved ${amount} tokens from ${user1.address}\n`)

	// user1 deposits 10,000 GB tokens
	transaction = await exchange.connect(user1).depositToken(gb.address, amount)
	await transaction.wait()
	console.log(`Deposited ${amount} GB from ${user1.address}\n`)

	// user2 approves mETH
	transaction = await mETH.connect(user2).approve(exchange.address, amount)
	console.log(`Approved ${amount} tokens from ${user2.address}\n`)

	// user 2 Deposits mETH
	transaction = await exchange.connect(user2).depositToken(mETH.address, amount)
	await transaction.wait()
	console.log(`Deposited ${amount} tokens from ${user2.address}\n`)

	///////////////////////
	// seed a cancelled order

	// User 1 makes order to get tokens
	let orderId
	transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), gb.address, tokens(5))
	result = await transaction.wait()
	console.log(`Made order from ${user1.address}`)

	// User 1 cancels order
	orderId = result.events[0].args.id
	transaction = await exchange.connect(user1).cancelOrder(orderId)
	result = await transaction.wait()
	console.log(`Cancelled order from ${user1.address}\n`)


	// wait 1 second
	await wait(1)


	//////////////////////
	// seed-filled orders

	// User 1 makes order
	transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(100), gb.address, tokens(5))
	result = await transaction.wait()
	console.log(`Made order from ${user1.address}`)

	// User 2 fills order
	orderId = result.events[0].args.id
	transaction = await exchange.connect(user2).fillOrder(orderId)
	result = await transaction.wait()
	console.log(`Filled order from ${user1.address}\n`)

	await wait(1)

	// user 1 makes another order
	transaction = await exchange.makeOrder(mETH.address, tokens(50), gb.address, tokens(15))
	result = await transaction.wait()
	console.log(`Made order from ${user1.address}`)

	// User 2 fills another order
	orderId = result.events[0].args.id
	transaction = await exchange.connect(user2).fillOrder(orderId)
	result = await transaction.wait()
	console.log(`Filled order from ${user1.address}\n`)

	// wait 1 second
	await wait(1)

	// User 1 makes final order 
	transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(200), gb.address, tokens(20))
	result = await transaction.wait()
	console.log(`Made order from ${user1.address}`)

	// User 2 fills final order
	orderId = result.events[0].args.id
	transaction = await exchange.connect(user2).fillOrder(orderId)
	result = await transaction.wait()
	console.log(`Filled order from ${user1.address}\n`)

	await wait(1)


	/////////////////////////////////////////////////
	// Seed Open Orders 


	// User 1 makes 10 orders
	for(let i = 1; i <= 10; i++){
	transaction = await exchange.connect(user1).makeOrder(mETH.address, tokens(10 * i), gb.address, tokens(10))
	result = await transaction.wait()

	console.log(`Made order from ${user1.address}`)

	await wait(1)
	}
	// User 2 makes 10 orders
	for(let i = 1; i <= 10; i++){
	transaction = await exchange.connect(user1).makeOrder(gb.address, tokens(10), mETH.address, tokens(10 * i))
	result = await transaction.wait()

	console.log(`Made order from ${user2.address}`)

	await wait(1)
	}


}


main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
