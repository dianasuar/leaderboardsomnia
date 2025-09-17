"use client";
import React, { useEffect, useState } from 'react';
import { useAccount, usePublicClient, useWriteContract } from 'wagmi';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { formatEther, parseEther } from 'viem';
import LeaderboardModal from "./components/LeaderboardModal";

const TOKEN = (process.env.NEXT_PUBLIC_TOKEN_ADDRESS ?? '') as `0x${string}`;
const STAKING = (process.env.NEXT_PUBLIC_STAKING_ADDRESS ?? '') as `0x${string}`;

export default function PlayPage() {
  const { address, isConnected } = useAccount();
  const [Address, setAddress] = useState<string | undefined>(address);
    const [leaderOpen, setLeaderOpen] = useState(false);
  const [gameState, setGameState] = useState({
    walletConnected: false,
    stakedAmount: 0,
    gameUnlocked: false,
    gamesPlayed: 0,
    gamesRequiredToUnstake: 10,
    points: 0
  });

  const [balance, setBalance] = useState<bigint | undefined>(undefined);
  
  const publicClient = usePublicClient()

  const { writeContractAsync, isPending } = useWriteContract();

  const checkBalance = async (address: string): Promise<bigint | undefined> => {
    const balance = await publicClient?.readContract({
      address: TOKEN,
      abi: [
        {
          name: 'balanceOf',
          type: 'function',
          stateMutability: 'view',
          inputs: [{ name: 'account', type: 'address' }],
          outputs: [{ name: '', type: 'uint256' }]
        }
      ],
      functionName: 'balanceOf',
      args: [address as `0x${string}`]
    });
    console.log("Balance:", balance);

    setBalance(balance as bigint | undefined);
    return balance as bigint | undefined;
  };
  
  // Fetch user points when wallet is connected
  useEffect(() => {
    if (isConnected && address) {
      fetchClaimsData(address);

      console.log("address:", address);

      checkBalance(address);

      localStorage.setItem('address', address);
      
      setAddress(address);
      setGameState(prev => ({
        ...prev,
        walletConnected: true
      }));
      
      // Display wallet in UI
      const connectedWallet = document.getElementById('connected-wallet');
      if (connectedWallet) {
        connectedWallet.textContent = `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
        connectedWallet.style.display = 'block';
      }
      
      // Enable stake button
      const stakeBtn = document.getElementById('stake-btn');
      if (stakeBtn) {
        stakeBtn.classList.remove('btn-disabled');
        (stakeBtn as HTMLButtonElement).disabled = false;
      }
    }
  }, [isConnected, address]);

  // Fetch user points from API
  
  // Function to check if points meet the threshold
  const checkPointsThreshold = (points: number) => {
    const startGameBtn = document.getElementById('start-game-btn');
    const unstakeBtn = document.getElementById('unstake-btn');
    const infoBox = document.getElementById('info-box-text');
    
    if (startGameBtn) {
      if (points >= 1000) {
        startGameBtn.classList.remove('btn-disabled');
        (startGameBtn as HTMLButtonElement).disabled = true;
        
        // For unstake button, check both points AND games played
        if (unstakeBtn) {
          if (gameState.gamesPlayed >= gameState.gamesRequiredToUnstake) {
            unstakeBtn.classList.remove('btn-disabled');
            (unstakeBtn as HTMLButtonElement).disabled = false;
          } else {
            unstakeBtn.classList.add('btn-disabled');
            (unstakeBtn as HTMLButtonElement).disabled = true;
          }
        }
        
        // Update info box to show game is unlocked
        if (infoBox) {
          infoBox.innerHTML = `
            GAME UNLOCKED!<br />
            YOUR POINTS: ${points}<br />
            READY TO PLAY
          `;
        }
      } else {
        startGameBtn.classList.add('btn-disabled');
        (startGameBtn as HTMLButtonElement).disabled = true;
        
        // Disable unstake button if points are < 1000
        if (unstakeBtn) {
          unstakeBtn.classList.add('btn-disabled');
          (unstakeBtn as HTMLButtonElement).disabled = true;
        }
        
        // Update info box to show points needed
        if (infoBox) {
          infoBox.innerHTML = `
            NEED 1000 POINTS TO PLAY<br />
            YOUR POINTS: ${points}<br />
            POINTS NEEDED: ${1000 - points > 0 ? 1000 - points : 0}
          `;
        }
      }
    }
  };
  
  // Update points in UI
  const updatePointsDisplay = (points: number) => {
    const pointsDisplay = document.getElementById('points-display');
    console.log("Updating points display:", points, pointsDisplay); // Add logging
    
    if (pointsDisplay) {
      pointsDisplay.textContent = `${points} PTS`;
      pointsDisplay.style.display = 'block';
    }
  };
  // Update points after game
  const updatePoints = async (newPoints: number) => {
    if (!address) return;

    
    try {
      const response = await fetch('/api/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address,
          points: gameState.points + newPoints,
          reason: 'Game played'
        }),
      });
      
      const data = await response.json();
      
      if (data && data.currentPoints !== undefined) {
        const updatedPoints = data.currentPoints;
        
        setGameState(prev => ({
          ...prev,
          points: updatedPoints
        }));
        
        // Update points display
        updatePointsDisplay(updatedPoints);
        
        // Check if points meet threshold
        checkPointsThreshold(updatedPoints);
      }
    } catch (error) {
      console.error('Error updating points:', error);
    }
  };

  useEffect(() => {
    // Initialize game elements after component mounts
    initializeGame();
    
    // Cleanup function
    return () => {
      // Remove any event listeners or timers when component unmounts
      const elements = document.querySelectorAll('.pixel-snake');
      elements.forEach(el => el.remove());
    };
  }, []);
  
  
  // Stake tokens function
  const stakeTokens = async (amount: number) => {
    console.log("Staking tokens:", amount);

    console.log("Address:", Address);

    console.log("address:", address);
    
    console.log("isConnected:", isConnected);

    const addresss = localStorage.getItem('address');

    console.log("addresss:", addresss);

    if (isConnected && address) {
      setAddress(address);
    }

    const balance = addresss ? await checkBalance(addresss) : undefined;

    console.log("balance:", balance);
    console.log("amount:", amount);
    console.log("parseEther(amount.toString()):", parseEther(amount.toString()));

    // if (balance && balance < parseEther(amount.toString())) {
    //   console.log("Not enough balance");
      
    //   // Show error message
    //   const stakeError = document.getElementById('stake-error');
    //   if (stakeError) {
    //     stakeError.textContent = `INSUFFICIENT BALANCE: YOU NEED ${amount} ASTR BUT ONLY HAVE ${parseFloat(formatEther(balance)).toFixed(2)} ASTR`;
    //     stakeError.style.display = 'block';
    //   }
      
    //   // Reset confirm button
    //   const confirmStakeBtn = document.getElementById('confirm-stake-btn');
    //   if (confirmStakeBtn) {
    //     confirmStakeBtn.textContent = 'STAKE TOKENS';
    //     (confirmStakeBtn as HTMLButtonElement).disabled = false;
    //   }
      
    //   return;
    // }
    if (!addresss) return;
    

    try {
      console.log("Staking tokens:", amount); // Add logging
      
      // Show processing state
      const confirmStakeBtn = document.getElementById('confirm-stake-btn');
      if (confirmStakeBtn) {
        confirmStakeBtn.textContent = 'PROCESSING...';
        (confirmStakeBtn as HTMLButtonElement).disabled = true;
      }

      const allowance = await publicClient?.readContract({
        address: '0x936F3FA72F6013F6bd16583F3Db04e9C50d8fBCa',
        abi: [{
            "constant": true,
            "inputs": [
                {"name": "_owner", "type": "address"},
                {"name": "_spender", "type": "address"}
            ],
            "name": "allowance", 
            "outputs": [{"name": "", "type": "uint256"}],
            "type": "function"
        }],
        functionName: 'allowance',
        args: [addresss, '0x15c416e97Ab1f7B60afA2558B4Acf92a33A886FA']
    });

    console.log("Allowance:", allowance);

    const allowanceBigInt = BigInt(allowance as bigint);
    const amountBigInt = BigInt(parseEther(amount.toString()));

    console.log("allowanceBigInt:", allowanceBigInt);
    console.log("amountBigInt:", amountBigInt);

  //   if (allowanceBigInt < amountBigInt) {
  //     console.log("Approval required");
      
  //     // Show approving modal
   

  //     const astrAmountInWei = parseEther(amount.toString());

      
  //     // Call approve with the calculated amount
  //     const approveHash = await writeContractAsync({
  //         address: '0x936F3FA72F6013F6bd16583F3Db04e9C50d8fBCa',
  //         abi: [{
  //             "inputs": [
  //                 {"name": "_spender", "type": "address"},
  //                 {"name": "_value", "type": "uint256"}
  //             ],
  //             "name": "approve",
  //             "outputs": [{"name": "", "type": "bool"}],
  //             "type": "function"
  //         }],
  //         functionName: 'approve',
  //         args: ['0x15c416e97Ab1f7B60afA2558B4Acf92a33A886FA', astrAmountInWei]
  //     });

  //     // Wait for approval transaction
  //     if (approveHash) {
  //         try {
  //             await publicClient?.waitForTransactionReceipt({ 
  //                 hash: approveHash as `0x${string}` 
  //             });
  //             console.log("Approval transaction confirmed");
  //         } catch (error) {
  //             console.error("Error waiting for approval:", error);
  //             throw error;
  //         }
  //     }


  // }




    const astrAmountInWei = parseEther(amount.toString());

    console.log("astrAmountInWei:", astrAmountInWei);
    console.log("No allowance");
    const stakeHash = await writeContractAsync({
      address: '0x16c70B621Ba8A14c13804B2318a0BcBf0D21Ec98',
      abi: [{
          "inputs": [
              {"name": "_receiver", "type": "address"},
              {"name": "_quantity", "type": "uint256"}, 
              {"name": "_currency", "type": "address"},
              {"name": "_pricePerToken", "type": "uint256"},
              {"name": "_allowlistProof", "type": "tuple", "components": [
                  {"name": "proof", "type": "bytes32[]"},
                  {"name": "quantityLimitPerWallet", "type": "uint256"},
                  {"name": "pricePerToken", "type": "uint256"},
                  {"name": "currency", "type": "address"}
              ]},
              {"name": "_data", "type": "bytes"}
          ],
          "name": "claim",
          "outputs": [],
          "type": "function",
          "stateMutability": "payable"
      }],
      functionName: 'claim',
      args: [
        '0x2B258418ee8ba6822472F722bC558Ce62D42280D',
        BigInt('1000000000000000000'),
        '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
        BigInt('500000000000'),
        {
          proof: [],
          quantityLimitPerWallet: BigInt('0'),
          pricePerToken: BigInt('500000000000'),
          currency: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE'
        },
        '0x'
      ], 
      value: BigInt(parseEther("0.0000005"))
  });

  await publicClient?.waitForTransactionReceipt({ 
    hash: stakeHash as `0x${string}` 
});


console.log("Stake transaction confirmed");

  

    
      

      
      // Update game state
      setGameState(prev => ({
        ...prev,
        stakedAmount: amount,
        gameUnlocked: true,
        gamesPlayed: 0
      }));
      
      // Award 1000 points for staking
      try {
        console.log("Awarding points for staking"); // Add logging
        
        const response = await fetch('/api/points', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            address: addresss,
            points: gameState.points + amount * 10,
            reason: 'Staking tokens'
          }),
        });
        
        const data = await response.json();
        console.log("Points API response:", data); // Add logging
        
        if (data && data.currentPoints !== undefined) {
          const updatedPoints = data.currentPoints;
          
          setGameState(prev => ({
            ...prev,
            points: updatedPoints,
            stakedAmount: amount,
            gameUnlocked: true
          }));
          
          // Update points display
          updatePointsDisplay(updatedPoints);
          
          // Check if points meet threshold
          checkPointsThreshold(updatedPoints);
          
          // Also fetch claims data to ensure everything is in sync
          if (addresss) {
            fetchClaimsData(addresss);
          }
          
          // Update UI elements directly
          
          // Update the info box
          const infoBox = document.getElementById('info-box-text');
          if (infoBox && updatedPoints >= 1000) {
            infoBox.innerHTML = `
              GAME UNLOCKED!<br />
              YOUR POINTS: ${updatedPoints}<br />
              READY TO PLAY
            `;
          }
        }
      } catch (error) {
        console.error('Error updating points after staking:', error);
      }
      
      // Update UI
      const stakeSuccess = document.getElementById('stake-success');
      if (stakeSuccess) {
        stakeSuccess.textContent = 'PURCHASE SUCCESSFUL! +1000 POINTS AWARDED!';
        stakeSuccess.style.display = 'block';
      }
      
      const stakeBtn = document.getElementById('stake-btn');
      if (stakeBtn) {
        stakeBtn.classList.add('btn-disabled');
        stakeBtn.textContent = `STAKED: ${amount} TOKENS`;
        (stakeBtn as HTMLButtonElement).disabled = true;
      }
      
      // Close modal after delay
      setTimeout(() => {
        const stakeModal = document.getElementById('stake-modal');
        if (stakeModal) stakeModal.style.display = 'none';
      }, 2000);
      
    } catch (error) {
      console.error('Staking error:', error);
      
      // Show error
      const stakeError = document.getElementById('stake-error');
      if (stakeError) {
        stakeError.textContent = 'TRANSACTION FAILED. PLEASE TRY AGAIN.';
        stakeError.style.display = 'block';
      }
      
      // Reset button
      const confirmStakeBtn = document.getElementById('confirm-stake-btn');
      if (confirmStakeBtn) {
      confirmStakeBtn.textContent = 'GET PFPs';
        (confirmStakeBtn as HTMLButtonElement).disabled = false;
      }
    }
  };
  
  // Unstake tokens function
  const unstakeTokens = async () => {
    console.log("Unstaking tokens");
    
    const addresss = localStorage.getItem('address');
    if (!addresss) return;
    
    try {
      // Show processing state
      const unstakeBtn = document.getElementById('unstake-btn');
      if (unstakeBtn) {
        unstakeBtn.textContent = 'PROCESSING...';
        (unstakeBtn as HTMLButtonElement).disabled = true;
      }
      
      const stakedBalance = await publicClient?.readContract({
        address: STAKING,
        abi: [{
            "inputs": [{"internalType": "address", "name": "", "type": "address"}],
            "name": "stakers",
            "outputs": [
                {"internalType": "uint128", "name": "timeOfLastUpdate", "type": "uint128"},
                {"internalType": "uint64", "name": "conditionIdOflastUpdate", "type": "uint64"},
                {"internalType": "uint256", "name": "amountStaked", "type": "uint256"},
                {"internalType": "uint256", "name": "unclaimedRewards", "type": "uint256"}
            ],
            "stateMutability": "view",
            "type": "function"
        }],
        functionName: 'stakers',
        args: [addresss as `0x${string}`]
    });

    console.log(stakedBalance);
    console.log(stakedBalance?.[2]);
    if (!stakedBalance) {
        throw new Error('Could not get staked balance');
    }

    const hash = await writeContractAsync({
      address: '0x15c416e97Ab1f7B60afA2558B4Acf92a33A886FA',
      abi: [{
          "inputs": [{"internalType": "uint256", "name": "_amount", "type": "uint256"}],
          "name": "withdraw", 
          "outputs": [],
          "stateMutability": "nonpayable",
          "type": "function"
      }],
      functionName: 'withdraw',
      args: [stakedBalance[2]]
  });



  if (!hash) {
      throw new Error('Transaction failed');
  }

  // Wait for transaction confirmation
   await publicClient?.waitForTransactionReceipt({ hash });


try {
  const response = await fetch('/api/points', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      address: addresss,
      points: 0,
      reason: 'Unstaking tokens'
    }),
  });  

  const data = await response.json();
  console.log("Points API response:", data); // Add logging
} catch (error) {
  console.error('Error updating points after unstaking:', error);
}      

      
      // Update UI
      const stakeSuccess = document.getElementById('stake-success');
      if (stakeSuccess) {
        // convert stakedBalance[2] to a ether amount
        const etherAmount = formatEther(stakedBalance[2]);
        stakeSuccess.textContent = `UNSTAKED ${etherAmount} ASTR!`;
        stakeSuccess.style.display = 'block';
      }
      
      const stakeBtn = document.getElementById('stake-btn');
      if (stakeBtn) {
        stakeBtn.classList.remove('btn-disabled');
        stakeBtn.textContent = 'GET PFPs';
        (stakeBtn as HTMLButtonElement).disabled = false;
      }
      
      
      // Close modal after delay
      setTimeout(() => {
        const stakeModal = document.getElementById('stake-modal');
        if (stakeModal) stakeModal.style.display = 'none';
      }, 2000);
      
    } catch (error) {
      console.error('Unstaking error:', error);
      
      // Show error
      const stakeError = document.getElementById('stake-error');
      if (stakeError) {
        stakeError.textContent = 'TRANSACTION FAILED. PLEASE TRY AGAIN.';
        stakeError.style.display = 'block';
      }
      
      // Reset button
      const unstakeBtn = document.getElementById('unstake-btn');
      if (unstakeBtn) {
        unstakeBtn.textContent = 'UNSTAKE TOKENS';
        (unstakeBtn as HTMLButtonElement).disabled = false;
      }
    }
  };
  
  function initializeGame() {
    // Create initial snakes
    for (let i = 0; i < 5; i++) {
      setTimeout(createPixelSnake, i * 2000);
    }
    
    // Continue creating snakes periodically
    const snakeInterval = setInterval(createPixelSnake, 3000);
    
    // Random static effects
    const staticInterval = setInterval(() => {
    }, 5000);
    
    // Set up event listeners
    setupEventListeners();
    
    // Return cleanup function
    return () => {
      clearInterval(snakeInterval);
      clearInterval(staticInterval);
    };
  }
  
  // Rest of your existing functions...
  function createPixelSnake() {
    // Your existing implementation...
  }
  
  
  // Modified play game function to update points and claims
  const playGame = () => {
    if (!address) return;
    
    // Increment games played locally
    const newGamesPlayed = gameState.gamesPlayed + 1;
    
    setGameState(prev => ({
      ...prev,
      gamesPlayed: newGamesPlayed
    }));
    
    // Update play counter
    const playCounter = document.getElementById('play-counter');
    if (playCounter) {
      playCounter.textContent = `GAMES PLAYED: ${newGamesPlayed}/${gameState.gamesRequiredToUnstake}`;
    }
    
    // Update claims data in API
    try {
      fetch('/api/claims', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          address: address,
          gamesPlayed: newGamesPlayed
        }),
      });
    } catch (error) {
      console.error('Error updating claims data:', error);
    }
    
    // If we've reached the required games, enable unstake button
    if (newGamesPlayed >= gameState.gamesRequiredToUnstake) {
      const unstakeBtn = document.getElementById('unstake-btn');
      if (unstakeBtn) {
        (unstakeBtn as HTMLButtonElement).disabled = false;
        unstakeBtn.textContent = 'UNSTAKE TOKENS';
        unstakeBtn.style.display = 'block';
      }
    }
    
    // Award random points between 50-200
    const pointsEarned = Math.floor(Math.random() * 151) + 50;
    updatePoints(pointsEarned);
    
    // Show points earned
    const pointsEarnedDisplay = document.getElementById('points-earned');
    if (pointsEarnedDisplay) {
      pointsEarnedDisplay.textContent = `+${pointsEarned} POINTS`;
      pointsEarnedDisplay.style.display = 'block';
      
      // Hide after 3 seconds
      setTimeout(() => {
        pointsEarnedDisplay.style.display = 'none';
      }, 3000);
    }
  };
  
  function setupEventListeners() {
    // Sample scores data
    const sampleScores = [
      { name: "CRYPTO_SNAKE", score: 9850, wallet: "0x742d35Cc6634C0532925a3b844Bc454e4438f44e" },
      { name: "NEON_NINJA", score: 8720, wallet: "0xAb5801a7D398351b8bE11C439e05C5B3259aeC9B" },
      { name: "PIXEL_OVERLORD", score: 7650, wallet: "0x5aAeb6053F3E94C9b9A09f33669435E7Ef1BeAed" },
      { name: "BLOCKCHAIN_BANDIT", score: 6540, wallet: "0x4fB7aA3b8DcC3325F5eB4C5Dd6cB7e5B9F2a3456" },
      { name: "DIGITAL_DEMON", score: 5430, wallet: "0x28a874BEFeC42e8B0aD6a6b1f5F5eD5eF8aB3456" }
    ];
    
    // Populate scores list
    const scoresList = document.getElementById('scores-list');
    if (scoresList) {
      scoresList.innerHTML = '';
      sampleScores.forEach((player, index) => {
        const scoreItem = document.createElement('div');
        scoreItem.className = 'score-item';
        
        const rankName = document.createElement('div');
        rankName.innerHTML = `<span style="color: #ff00ff;">#${index + 1}</span> ${player.name}`;
        
        const scoreWallet = document.createElement('div');
        scoreWallet.className = 'text-right';
        scoreWallet.innerHTML = `
          <div style="color: #00ffff;">${player.score.toLocaleString()} PTS</div>
          <div class="wallet-address">${player.wallet}</div>
        `;
        
        scoreItem.appendChild(rankName);
        scoreItem.appendChild(scoreWallet);
        scoresList.appendChild(scoreItem);
      });
    }
    
    // Connect wallet button - now uses RainbowKit
    const connectWalletBtn = document.getElementById('connect-wallet-btn');
    if (connectWalletBtn) {
      connectWalletBtn.addEventListener('click', function() {
        // Instead of showing modal, we'll trigger the RainbowKit modal
        // This is handled by the ConnectButton component
        const rainbowkitBtn = document.querySelector('.rainbowkit-connect-btn');
        if (rainbowkitBtn) {
          (rainbowkitBtn as HTMLElement).click();
        }
      });
    }
    
    // Stake button
    const stakeBtn = document.getElementById('stake-btn');
    const stakeModal = document.getElementById('stake-modal');
    
    if (stakeBtn) {
      console.log("Found stake button, adding event listener"); // Add logging
      stakeBtn.addEventListener('click', function() {
        console.log("Stake button clicked"); // Add logging
        if (stakeModal) {
          console.log("Showing stake modal"); // Add logging
          stakeModal.style.display = 'block';
        }
      });
    }
    
    // Stake amount selection
    const stakeAmounts = document.querySelectorAll('.stake-amount');
    const stakeInput = document.getElementById('stake-input') as HTMLInputElement;
    
    stakeAmounts.forEach(amount => {
      amount.addEventListener('click', function(this: HTMLElement) {
        // Remove active class from all amounts
        stakeAmounts.forEach(a => a.classList.remove('active'));
        
        // Add active class to clicked amount
        this.classList.add('active');
        
        // Set input value
        if (stakeInput) {
          stakeInput.value = this.getAttribute('data-amount') || '';
        }
      });
    });
    
    // Confirm stake button
    const confirmStakeBtn = document.getElementById('confirm-stake-btn');
    if (confirmStakeBtn && stakeInput) {
      confirmStakeBtn.addEventListener('click', function() {

        console.log("Confirm stake button clicked"); // Add logging
        const amount = parseFloat(stakeInput.value);
        const stakeError = document.getElementById('stake-error');
        
        if (isNaN(amount) || amount < 300) {
          if (stakeError) {
            stakeError.textContent = 'PLEASE ENTER A VALID AMOUNT (MIN 300)';
            stakeError.style.display = 'block';
          }
          return;
        }
        
        // Call the staking function
        stakeTokens(amount);
      });
    }
    
    // Close stake modal
    const closeStakeModal = document.getElementById('close-stake-modal');
    if (closeStakeModal) {
      closeStakeModal.addEventListener('click', function() {
        if (stakeModal) stakeModal.style.display = 'none';

      });
    }
    
// Start game button
const startGameBtn = document.getElementById('start-game-btn');

if (startGameBtn) {
  startGameBtn.addEventListener('click', function () {
    const url = process.env.NEXT_PUBLIC_GAME_URL || 'https://xyz.com';
    window.location.href = url; // same tab
    // agar new tab chahiye ho:
    // window.open(url, '_blank', 'noopener,noreferrer');
  });
}
    
    // Play game button
    const playGameBtn = document.getElementById('play-game-btn');
    if (playGameBtn) {
      playGameBtn.addEventListener('click', function() {
        playGame();
        
        // Close game screen after "playing"
        setTimeout(() => {
          const gameScreen = document.getElementById('game-screen');
          if (gameScreen) gameScreen.style.display = 'none';
        }, 2000);
      });
    }
    
    // Close game screen
    const closeGameBtn = document.getElementById('close-game');
    if (closeGameBtn) {
      closeGameBtn.addEventListener('click', function() {
        if (gameScreen) gameScreen.style.display = 'none';
      });
    }
    
    // Scores button
    //const scoresBtn = document.getElementById('scores-btn');
    //const scoresContainer = document.getElementById('scores-container');
    //const closeScores = document.getElementById('close-scores');
    
    //if (scoresBtn) {
      //scoresBtn.addEventListener('click', function() {
        //fetchLeaderboard();
        //addStatic();
     // });
    //}
    
    //if (closeScores) {
     // closeScores.addEventListener('click', function() {
       // if (scoresContainer) scoresContainer.style.display = 'none';
        //addStatic();
     // });
   // }

    // Unstake button
    const unstakeBtn = document.getElementById('unstake-btn');
    if (unstakeBtn) {
      unstakeBtn.addEventListener('click', function() {
        // Only proceed if button is not disabled
        if (!(unstakeBtn as HTMLButtonElement).disabled) {
          console.log("Unstake button clicked");
          unstakeTokens();
        } else {
          // Show alert if trying to unstake before playing enough games
          alert(`You need to play at least ${gameState.gamesRequiredToUnstake} games to unstake. You have played ${gameState.gamesPlayed} games.`);
        }
      });
    }
  }

  // Add a function to fetch claims data
  const fetchClaimsData = async (walletAddress: string) => {
    try {
      // Use the claims API endpoint
      const response = await fetch(`/api/claims?address=${walletAddress}`);
      const data = await response.json();
      
      console.log("Claims data:", data);
      
      // Get games played from API or default to 0
      const gamesPlayed = data?.claimsData?.gamesPlayed || 0;
      
      // Update the games played counter
      const playCounter = document.getElementById('play-counter');
      if (playCounter) {
        playCounter.textContent = `GAMES PLAYED: ${gamesPlayed}/${gameState.gamesRequiredToUnstake}`;
      }
      
      // Update game state
      setGameState(prev => ({
        ...prev,
        gamesPlayed: gamesPlayed
      }));
      
      // Check if enough games have been played to enable unstake
      const unstakeBtn = document.getElementById('unstake-btn');
      if (unstakeBtn) {
        // Check BOTH games played AND points
        if (gamesPlayed >= gameState.gamesRequiredToUnstake && gameState.points >= 1000) {
          // Enable unstake button if both conditions are met
          unstakeBtn.classList.remove('btn-disabled');
          (unstakeBtn as HTMLButtonElement).disabled = false;
        } else {
          // Disable unstake button if either condition is not met
          unstakeBtn.classList.add('btn-disabled');
          (unstakeBtn as HTMLButtonElement).disabled = true;
        }
      }
    } catch (error) {
      console.error('Error fetching claims data:', error);
    }
  };

  return (
    <div className="crt relative z-20">
      
      {/* Top-right wallet cluster (account above, chain below) */}
<div className="fixed top-4 right-4 z-10000 flex flex-col items-end gap-2">
  <ConnectButton.Custom>
    {({ openChainModal, openAccountModal, mounted, account, chain }) => {
      const ready = mounted;
      const connected = ready && account && chain;
      if (!connected) return null;
      if (chain?.unsupported) {
        return (
          <button type="button" onClick={openChainModal} className="neon-btn bg-red-900">
            WRONG NETWORK
          </button>
        );
      }
      return (
        <>
          <button type="button" onClick={openAccountModal} className="neon-btn neon-btn--sm">
            {account?.displayName}
          </button>
          <button type="button" onClick={openChainModal} className="neon-btn neon-btn--sm">
            {chain?.name ?? 'Somnia'}
          </button>
        </>
      );
    }}
  </ConnectButton.Custom>
</div>




      {/* Background elements */}
      <div className="grid-bg"></div>
      <div className="scanlines"></div>
      
      {/* Points display - positioned on the left */}
      <div id="points-display" className="points-display" style={{display: 'none'}}>0 PTS</div>
      
      
      {/* Main content */}
      <div className="menu-container">
        {/* Title */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl mb-6 floating-text">
            BLACK <span className="text-pink-500">HOLE</span>
          </h1>
          <p className="text-sm md:text-base text-green-400 mb-8">
            COMPETE AND WIN AGAINST ALL
          </p>
        </div>
        
        {/* Vertical button layout */}
        <div className="flex flex-col items-center">
<ConnectButton.Custom>
  {({ openConnectModal, openChainModal, mounted, account, chain }) => {
    const ready = mounted;
    const connected = ready && account && chain;

    if (!connected) {
      return (
        <button
          type="button"
          onClick={openConnectModal}
          className="neon-btn rainbowkit-connect-btn flex justify-center items-center"
        >
          CONNECT WALLET
        </button>
      );
    }

    if (chain?.unsupported) {
      return (
        <button
          type="button"
          onClick={openChainModal}
          className="neon-btn flex justify-center items-center"
          style={{ backgroundColor: 'rgba(255,0,0,0.1)', borderColor: '#ff0000', color: '#ff0000' }}
        >
          WRONG NETWORK
        </button>
      );
    }

    // ✅ Connected → show action buttons only now
    return (
      <>
        <button id="stake-btn" className="neon-btn">
          GET PFPs
        </button>
<button id="start-game-btn" className="neon-btn">
  START GAME
</button>
        <button
          id="scores-btn"
          className="neon-btn"
          onClick={() => setLeaderOpen(true)}
        >
          LEADERBOARD
        </button>
      </>
    );
  }}
</ConnectButton.Custom>

      </div>
      </div>
      

      
      {/* Stake Modal */}
      <div id="stake-modal" className="stake-modal">
        <h3 className="text-lg mb-6">PURCHASE PFPs</h3>
        <div className="stake-info">
          PURCHASE PFPs TO UNLOCK THE GAME<br />
          MINIMUM PURCHASE: 3 SOM<br />
        </div>
        
        <div className="stake-amounts">
          <div className="stake-amount" data-amount="300">300</div>
          <div className="stake-amount" data-amount="500">500</div>
          <div className="stake-amount" data-amount="1000">1000</div>
          <div className="stake-amount" data-amount="5000">5000</div>
        </div>

        <div className="stake-balance">
          BALANCE: {balance ? formatEther(balance) : '0'}
        </div>
        
        <input type="number" id="stake-input" className="stake-input" placeholder="ENTER AMOUNT" min="10" step="1" />
        
        <div className="play-counter" id="play-counter">
          GAMES PLAYED: {gameState.gamesPlayed}/{gameState.gamesRequiredToUnstake}
        </div>
        
        <div className="stake-error" id="stake-error"></div>
        
        <button id="confirm-stake-btn" className="stake-btn" disabled={isPending}>
          {isPending ? 'PROCESSING...' : 'PURCHASING TOKENS'}
        </button>
        
        <button id="unstake-btn" className="unstake-btn" disabled>UNSTAKE TOKENS</button>
        
        <div className="stake-success" id="stake-success">
          PURCHASE SUCCESSFUL!
        </div>
        
        <button id="close-stake-modal" className="neon-btn w-full mt-4">CANCEL</button>
      </div>
      
      {/* Game Screen */}
      <div id="game-screen" className="game-screen">
        <button className="close-game" id="close-game">✕</button>
        <div className="game-container">
          {/* Game will be rendered here */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
            <h2 className="text-2xl text-green-400 mb-4">GAME SCREEN</h2>
            <p className="text-green-300 mb-6">PLAYING WILL INCREASE YOUR PLAY COUNTER</p>
            <div id="points-earned" className="points-earned" style={{display: 'none'}}>+0 POINTS</div>
            <button id="play-game-btn" className="neon-btn">PLAY GAME</button>
          </div>
        </div>
      </div>
      
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
        
        body {
          font-family: 'Press Start 2P', cursive;
          background-color: #0a0a1a;
          color: #59ff00ff;
          overflow-x: hidden;
          min-height: 100vh;
        }
        
        /* Neon grid background */
        .grid-bg {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background:
            linear-gradient(rgba(0, 255, 0, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0, 255, 0, 0.03) 1px, transparent 1px);
          background-size: 20px 20px;
          z-index: -1;
        }
        
        /* Pixel snake */
        .pixel-snake {
          position: absolute;
          display: flex;
          pointer-events: none;
          z-index: -1;
          filter: drop-shadow(0 0 5px #00ff00);
        }
        
        .pixel {
          width: 8px;
          height: 8px;
          background-color: #00ff00;
          margin: 1px;
          animation: pixelGlow 2s infinite alternate;
        }
        
        @keyframes pixelGlow {
          0% { opacity: 0.7; }
          100% { opacity: 1; }
        }
        
        /* Neon buttons */
        .neon-btn {
          position: relative;
          background: transparent;
          color: #00ff00;
          border: 2px solid #00ff00;
          padding: 15px 24px;
          font-family: 'Press Start 2P', cursive;
          font-size: 12px;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.9);
          text-transform: uppercase;
          letter-spacing: 2px;
          overflow: hidden;
          width: 300px;
          margin: 10px auto;
          text-align: center;
        }

        .neon-btn--sm {
          width: 160px;        
          padding: 8px 12px;   
          font-size: 10px;    
          box-shadow: 0 0 6px rgba(0, 255, 0, 0.6);
          letter-spacing: 1px; 
          margin: 6px 0;       
        }
        
        .neon-btn:hover {
          color: #0a0a1a;
          background: #00ff00c2;
          box-shadow:
            0 0 10px #00ff0048,
            0 0 20px #00ff00,
            0 0 40px #00ff00;
          text-shadow: 0 0 5px #6eed3fff;
        }
        
        .neon-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(0, 255, 0, 0.4), transparent);
          transition: 0.5s;
        }
        
        .neon-btn:hover::before {
          left: 100%;
        }
        
        /* Scanline effect */
        .scanlines {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(rgba(0, 0, 0, 0.7) 1px, transparent 1px);
          background-size: 100% 2px;
          pointer-events: none;
          z-index: 100;
          opacity: 0.3;
        }
        
        /* CRT effect */
        .crt::before {
          content: " ";
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background: rgba(0, 255, 0, 0.03);
          pointer-events: none;
          z-index: 100;
        }
        
        .crt::after {
          content: " ";
          display: block;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          background:
            radial-gradient(circle, transparent 50%, rgba(0, 0, 0, 0.7) 100%),
            repeating-linear-gradient(0deg, rgba(0, 0, 0, 0.2) 0px, rgba(0, 0, 0, 0.2) 1px, transparent 1px, transparent 2px);
          pointer-events: none;
          z-index: 100;
        }
        
        /* Floating text effect */
        .floating-text {
          animation: float 3s ease-in-out infinite;
          text-shadow: 0 0 10px #00ff00;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        /* Wallet connection modal */
        .wallet-modal {
          display: none;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: rgba(10, 10, 26, 0.95);
          border: 3px solid #00ff00;
          box-shadow: 0 0 20px #00ff00;
          padding: 30px;
          z-index: 1000;
          width: 300px;
          text-align: center;
        }
        
        .wallet-option {
          display: block;
          width: 100%;
          padding: 10px;
          margin: 10px 0;
          background: rgba(0, 255, 0, 0.1);
          border: 1px solid #00ff00;
          color: #00ff00;
          cursor: pointer;
          transition: all 0.3s;
        }
        
        .wallet-option:hover {
          background: rgba(0, 255, 0, 0.3);
          box-shadow: 0 0 10px #00ff0000;
        }
        
        .connected-wallet {
          position: fixed;
          top: 20px;
          right: 20px;
          background: rgba(0, 255, 0, 0.1);
          border: 1px solid #00ff00;
          padding: 8px 12px;
          font-size: 10px;
          color: #59ff00ff;
          max-width: 150px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          z-index: 100;
        }
        
        /* Game screen */
        .game-screen {
          display: none;
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-color: #000;
          z-index: 2000;
        }
        
        .game-container {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 90vw;
          max-width: 800px;
          aspect-ratio: 9/19;
          background-color: #111;
          border: 2px solid #00ff00;
          box-shadow: 0 0 30px #00ff00;
        }
        
        .close-game {
          position: absolute;
          top: 20px;
          right: 20px;
          background: transparent;
          border: none;
          color: #ff0000;
          font-size: 20px;
          cursor: pointer;
          z-index: 2001;
        }
        
        /* Stake Modal */
        .stake-modal {
          display: none;
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          background-color: rgba(10, 10, 26, 0.95);
          border: 3px solid #00ff00;
          box-shadow: 0 0 20px #00ff00;
          padding: 30px;
          z-index: 1000;
          width: 400px;
          text-align: center;
        }

        .stake-input {
          background: rgba(0, 255, 0, 0.05);
          border: 1px solid #00ff00;
          color: #00ff00;
          padding: 15px;
          width: 100%;
          margin: 20px 0;
          font-family: 'Press Start 2P', cursive;
          font-size: 14px;
          text-align: center;
        }

        .stake-input:focus {
          outline: none;
          box-shadow: 0 0 10px #00ff00;
        }

        .stake-amounts {
          display: flex;
          justify-content: space-between;
          margin: 20px 0;
        }

        .stake-amount {
          background: rgba(0, 255, 0, 0.1);
          border: 1px solid #00ff00;
          color: #00ff00;
          padding: 10px;
          cursor: pointer;
          transition: all 0.3s;
          flex: 1;
          margin: 0 5px;
          font-size: 12px;
        }

        .stake-amount:hover {
          background: rgba(0, 255, 0, 0.3);
          box-shadow: 0 0 10px #00ff00;
        }

        .stake-amount.active {
          background: #00ff00;
          color: #0a0a1a;
          box-shadow: 0 0 10px #00ff00;
        }

        .stake-info {
          font-size: 10px;
          color: #00cc00;
          margin: 15px 0;
          line-height: 1.5;
        }

        .stake-btn {
          width: 100%;
          padding: 15px;
          margin-top: 20px;
          background: rgba(0, 255, 0, 0.1);
          border: 1px solid #00ff00;
          color: #00ff00;
          cursor: pointer;
          transition: all 0.3s;
          font-family: 'Press Start 2P', cursive;
          font-size: 14px;
        }

        .stake-btn:hover {
          background: rgba(0, 255, 0, 0.3);
          box-shadow: 0 0 10px #00ff00;
        }
        
        .stake-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(0, 255, 0, 0.05);
          box-shadow: none;
        }
        
        .unstake-btn {
          width: 100%;
          padding: 15px;
          margin-top: 10px;
          background: rgba(255, 0, 0, 0.1);
          border: 1px solid #ff0000;
          color: #ff0000;
          cursor: pointer;
          transition: all 0.3s;
          font-family: 'Press Start 2P', cursive;
          font-size: 14px;
          display: none;
        }
        
        .unstake-btn:hover {
          background: rgba(255, 0, 0, 0.3);
          box-shadow: 0 0 10px #ff0000;
        }
        
        .unstake-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(255, 0, 0, 0.05);
          box-shadow: none;
        }
        
        .stake-success {
          display: none;
          color: #00ff00;
          font-size: 14px;
          margin: 20px 0;
          text-align: center;
        }
        
        .stake-error {
          display: none;
          color: #ff0000;
          font-size: 12px;
          margin: 10px 0;
          text-align: center;
        }
        
        .play-counter {
          font-size: 10px;
          color: #00cc00;
          margin: 10px 0;
          text-align: center;
        }
        
        /* Button states */
        .btn-disabled {
          opacity: 0.5;
          cursor: not-allowed;
          background: rgba(0, 255, 0, 0.05);
          box-shadow: none;
        }
        
        .btn-disabled:hover {
          color: #00ff00;
          background: transparent;
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.2);
        }
        
        /* Main menu container */
        .menu-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          padding: 20px;
        }
        
        /* Hidden RainbowKit button */
        .rainbowkit-container {
          position: absolute;
          opacity: 0;
          pointer-events: none;
        }
        
        .points-display {
          position: fixed;
          top: 20px;
          left: 20px;
          background: rgba(0, 255, 0, 0.1);
          border: 1px solid #00ff00;
          padding: 8px 12px;
          font-size: 14px;
          color: #00ff00;
          font-family: 'Press Start 2P', cursive;
          z-index: 1000;
          box-shadow: 0 0 10px rgba(0, 255, 0, 0.3);
        }
        
        .points-earned {
          color: #00ffff;
          font-size: 24px;
          margin: 20px 0;
          text-shadow: 0 0 10px #00ffff;
          animation: pulse 1s infinite alternate;
        }
        
        @keyframes pulse {
          0% { opacity: 0.7; }
          100% { opacity: 1; }
        }





      `}</style>
      <LeaderboardModal open={leaderOpen} onClose={() => setLeaderOpen(false)} />
    </div>
  );
}
