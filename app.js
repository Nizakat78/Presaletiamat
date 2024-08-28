let web3;
let interval;

async function initializeWeb3() {
    if (window.ethereum) {
        web3 = new Web3(window.ethereum);
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        console.log('MetaMask connected');
        updatePresaleInfo(); // Start updating the presale info
    } else {
        alert('MetaMask is not installed. Please install MetaMask to use this feature.');
    }
}

async function getPresaleContract() {
    const presaleAddress = '0xb49274de34a74679223687df8382dac2dcb5434e'; // Presale contract address
    
    // Fetch the ABI from the presale.json file
    const response = await fetch('presale.json');
    const presaleData = await response.json();
    const presaleABI = presaleData.abi; // ABI JSON from the file

    return new web3.eth.Contract(presaleABI, presaleAddress);
}

async function updatePresaleInfo() {
    const presaleContract = await getPresaleContract();
    const closingTime = await presaleContract.methods.closingTime().call();

    const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds
    let status = 'Inactive';
    
    if (currentTime <= closingTime) {
        status = 'Active';
        startCountdown(closingTime - currentTime); // Start the countdown timer
    } else {
        status = 'Closed';
    }

    document.getElementById('currentStatus').textContent = `Status: ${status}`;
}

function startCountdown(duration) {
    clearInterval(interval); // Clear any previous interval
    interval = setInterval(() => {
        if (duration <= 0) {
            clearInterval(interval);
            document.getElementById('currentStatus').textContent = `Status: Closed`;
            return;
        }

        duration--;

        const days = Math.floor(duration / (3600 * 24));
        const hours = Math.floor((duration % (3600 * 24)) / 3600);
        const minutes = Math.floor((duration % 3600) / 60);
        const seconds = Math.floor(duration % 60);

        document.getElementById('timeRemaining').textContent = `Time Remaining: ${days}d ${hours}h ${minutes}m ${seconds}s`;
    }, 1000);
}

document.getElementById('connectWallet').addEventListener('click', async () => {
    await initializeWeb3();
    alert('Wallet connected and presale info updated');
});

document.getElementById('buyETHForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const amount = document.getElementById('ethAmount').value;

    const presaleContract = await getPresaleContract();
    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];

    const weiAmount = web3.utils.toWei(amount.toString(), 'ether');

    try {
        await presaleContract.methods.buyTokensWithETH().send({
            from: userAddress,
            value: weiAmount
        });
        alert('Purchase successful!');
    } catch (error) {
        console.error('Error:', error);
        alert('Purchase failed.');
    }
});

document.getElementById('buyUSDTForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const amount = document.getElementById('usdtAmount').value;

    const presaleContract = await getPresaleContract();
    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];

    try {
        await presaleContract.methods.buyTokensWithUSDT(web3.utils.toWei(amount.toString(), 'mwei')).send({
            from: userAddress
        });
        alert('Purchase successful!');
    } catch (error) {
        console.error('Error:', error);
        alert('Purchase failed.');
    }
});

document.getElementById('buyUSDCForm').addEventListener('submit', async (event) => {
    event.preventDefault();
    const amount = document.getElementById('usdcAmount').value;

    const presaleContract = await getPresaleContract();
    const accounts = await web3.eth.getAccounts();
    const userAddress = accounts[0];

    try {
        await presaleContract.methods.buyTokensWithUSDC(web3.utils.toWei(amount.toString(), 'mwei')).send({
            from: userAddress
        });
        alert('Purchase successful!');
    } catch (error) {
        console.error('Error:', error);
        alert('Purchase failed.');
    }
});
