

const delay = ms => new Promise(res => setTimeout(res, ms));
const etherscanChains = ["poly", "bsc", "poly_mumbai", "ftm", "arbitrum"];
const sourcifyChains = ["xdai", "celo", "avax", "avax_fuji", "arbitrum"];

const main = async function (hre) {
    const { deployments, getNamedAccounts } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    // We get the contract to deploy
    const multicall = await deploy("Multicall2", { 
        from: deployer, 
        log: true, 
        args: [], 
        deterministicDeployment: "0x9c22ff5f21f0b81b113e63f7db6da94fedef11b2119b4088b89664fb9a3cb658" });
    console.log("Multicall deployed to:", multicall.address);

    const chain = hre.network.name;
    await verify(hre, chain, multicall.address);
}

async function verify(hre, chain, contract) {
    const isEtherscanAPI = etherscanChains.includes(chain);
    const isSourcify = sourcifyChains.includes(chain);
    if (!isEtherscanAPI && !isSourcify)
        return;

    console.log('verifying...');
    await delay(10000);
    if (isEtherscanAPI) {
        await hre.run("verify:verify", {
            address: contract,
            network: chain,
            constructorArguments: []
        });
    } else if (isSourcify) {
        try {
            await hre.run("sourcify", {
                address: contract,
                network: chain,
                constructorArguments: []
            });
        } catch (error) {
            console.log("verification failed: sourcify not supported?");
        }
    }
}

module.exports = main;