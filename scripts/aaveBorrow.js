const { getNamedAccounts, ethers } = require("hardhat")
const { getWeth, AMOUNT } = require("../scripts/getWeth")

async function main() {
    await getWeth()
    const { deployer } = await getNamedAccounts()

    //lending pool address provider 0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5

    const lendingPool = await getLendingPool(deployer)
    console.log(`lending pool address ${lendingPool.address}`)

    //deposit
    //for deposit first need to approve
    const wethTokenAddress = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
    await approveERC20(wethTokenAddress, lendingPool.address, AMOUNT, deployer)
    console.log("depositing")
    await lendingPool.deposit(wethTokenAddress, AMOUNT, deployer, 0)
    console.log("deposited")

    //Borrow Time
    //how much we have borrowed, how much we have in colletral and how much we can borrow
    // availableBorrowEth ?? What is conversion rate on DAI is?

    let { availableBorrowsETH, totalDebtETH } = await getBorrowUserData(lendingPool, deployer)
    const daiPrice = await getDAIPrice()

    const amountDaiToBorrow = availableBorrowsETH * (1 / daiPrice.toNumber()) * 0.95
    console.log(`You can  borrow ${amountDaiToBorrow} DAI`)
    const amountDaiToBorrowWei = ethers.utils.parseEther(amountDaiToBorrow.toString())

    const DAITokenAddress = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
    await getBorrow(DAITokenAddress, lendingPool, amountDaiToBorrowWei, deployer)

    await getBorrowUserData(lendingPool, deployer)

    await getRepay(amountDaiToBorrowWei, DAITokenAddress, lendingPool, deployer)

    await getBorrowUserData(lendingPool, deployer)
}

async function getRepay(amount, daiAddress, lendingPool, account) {
    await approveERC20(daiAddress, lendingPool.address, amount, account)
    const txRepay = await lendingPool.repay(daiAddress, amount, 1, account)
    await txRepay.wait(1)
    console.log(`you have repayed`)
}

async function getBorrow(daiAddress, lendingPool, amountBorrow, account) {
    const txBorrow = await lendingPool.borrow(daiAddress, amountBorrow, 1, 0, account)
    await txBorrow.wait(1)
    console.log(`You have Borrowed ${amountBorrow}`)
}

async function getDAIPrice() {
    const daiEthPriceFeed = await ethers.getContractAt(
        "AggregatorV3Interface",
        "0x773616E4d11A78F511299002da57A0a94577F1f4"
    )

    const price = (await daiEthPriceFeed.latestRoundData())[1]
    console.log(`The DAI/ETH price is ${price.toString()}`)
    return price
}

async function getBorrowUserData(lendingPool, account) {
    const {
        totalCollateralETH,
        totalDebtETH,
        availableBorrowsETH
    } = await lendingPool.getUserAccountData(account)

    console.log(`You have  ${totalCollateralETH} Worth of ETH deposited`)
    console.log(`You have ${totalDebtETH} worth of Eth borrowed`)
    console.log(`You can borrow ${availableBorrowsETH} worth of ETH`)
    return { availableBorrowsETH, totalDebtETH }
}

async function getLendingPool(account) {
    const lendingPoolAddressesProvider = await ethers.getContractAt(
        "ILendingPoolAddressesProvider",
        "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5",
        account
    )

    const lendingPoolAddress = await lendingPoolAddressesProvider.getLendingPool()

    const lendingPool = await ethers.getContractAt("ILendingPool", lendingPoolAddress, account)

    return lendingPool
}

async function approveERC20(erc20Address, spenderAddress, amountToSpend, account) {
    const erc20Token = await ethers.getContractAt("IERC20", erc20Address, account)
    const tx = await erc20Token.approve(spenderAddress, amountToSpend)
    await tx.wait(1)
    console.log("Approved")
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error)
        process.exit(1)
    })
