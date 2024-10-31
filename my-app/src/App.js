import { useState, useEffect } from 'react';
import './App.css';
import { ethers } from 'ethers';
import { ABI, address } from './context';

function App() {
  const [walletAddress, setWalletAddress] = useState(null);
  const [number, setNumber] = useState(null);
  const [contract, setContract] = useState(null);
  const [inputNumber, setInputNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');

  useEffect(() => {
    if (walletAddress) {
      initializeContract();
    }
  }, [walletAddress]);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
        });
        setWalletAddress(accounts[0]);
        console.log("Connected wallet address:", accounts[0]);

      } catch (error) {
        console.error("Failed to connect wallet:", error);

        if (error.code === 4001) {
          alert("Please connect your wallet to continue.");
        } else if (error.code === -32002) {
          alert("Wallet connection request is already pending. Please check your wallet.");
        } else {
          alert("An unexpected error occurred. Please try again.");
        }
      }
    } else {
      alert("MetaMask is not installed. Please install it to connect your wallet.");
    }
  };

  // Separate function to initialize contract and fetch initial number
  const initializeContract = async () => {
    try {
      const providerInstance = new ethers.providers.Web3Provider(window.ethereum);
      const signer = providerInstance.getSigner();
      const contractInstance = new ethers.Contract(address, ABI, signer);
      setContract(contractInstance);
      console.log("Contract initialized:", contractInstance);

      // Fetch the current number from the blockchain immediately
      const initialNumber = await contractInstance.getNumber();
      setNumber(initialNumber.toString()); // Convert to string for display
      console.log("Initial number fetched:", initialNumber.toString());
    } catch (error) {
      console.error("Error initializing contract:", error);
    }
  };

  // Set a number in the contract based on user input
  const handleSetNumber = async () => {
    if (contract) {
      try {
        setIsLoading(true);
        const tx = await contract.setNumber(parseInt(inputNumber));
        await tx.wait();
        console.log("Transaction details:", tx);
        console.log("Number set to:", inputNumber);
        setInputNumber(''); 
      } catch (error) {
        console.error("Error setting number:", error);
        alert("Error setting the number. Please try again.");
      } finally {
        setIsLoading(false);
      }
    } else {
      console.log("Contract not initialized");
      alert("Contract is not initialized. Please connect your wallet.");
    }
  };

  const handleGetNumber = async () => {
    if (contract) {
      setLoadingMessage("Fetching number from blockchain...");
      setIsLoading(true);
      try {
        const fetchedNumber = await contract.getNumber();
        console.log("Fetched number:", fetchedNumber.toString());
        setNumber(fetchedNumber.toString());
      } catch (error) {
        console.error("Error details:", error);
        alert(`Error fetching the number: ${error.message || error}. Check the contract address, ABI, and network.`);
      } finally {
        setIsLoading(false);
        setLoadingMessage('');
      }
    } else {
      alert("Contract is not initialized. Please connect your wallet.");
    }
  };
  


  return (
    <div className="App">
      <h1>My DApp</h1>
      <p>Wallet Address: {walletAddress || "Not connected"}</p>
      <p>Stored Number: {number !== null ? number : "No number set"}</p>
      <button onClick={connectWallet} disabled={walletAddress}>
        {walletAddress ? "Wallet Connected" : "Connect Wallet"}
      </button>

      {/* Input for user to enter a number */}
      <input
        type="number"
        placeholder="Enter a number"
        value={inputNumber}
        onChange={(e) => setInputNumber(e.target.value)}
        disabled={!walletAddress || isLoading}
      />
      <button onClick={handleSetNumber} disabled={!walletAddress || isLoading || !inputNumber}>
        {isLoading ? "Setting Number..." : "Set Number"}
      </button>
      <button onClick={handleGetNumber} disabled={!walletAddress || isLoading}>
        {isLoading ? "Fetching Number..." : "Get Number"}
      </button>
    </div>
  );
}

export default App;
